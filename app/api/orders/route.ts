
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// Membuat pesanan dan transaksi pembayaran Midtrans
export async function POST(request: Request) {
  try {
    // Verifikasi sesi pengguna di server
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu untuk membuat pesanan." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      game,
      userId,
      zoneId,
      product,
      price,
      customerName,
      email,
      phone,
    } = body;

    // Validasi tipe data
    if (
      typeof customerName !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof game !== "string" ||
      typeof userId !== "string" ||
      typeof product !== "string" ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        { message: "Data pesanan tidak valid." },
        { status: 400 }
      );
    }

    const cleanName = customerName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[\s-]/g, "");

    // Validasi nama
    if (cleanName.length < 3 || cleanName.length > 100) {
      return NextResponse.json(
        { message: "Nama pemesan harus 3-100 karakter." },
        { status: 400 }
      );
    }

    // Validasi email
    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      return NextResponse.json(
        { message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Validasi nomor HP
    if (!/^(08\d{8,12}|\+628\d{8,11}|628\d{8,11})$/.test(cleanPhone)) {
      return NextResponse.json(
        { message: "Format nomor HP tidak valid." },
        { status: 400 }
      );
    }

    // Validasi informasi game
    if (
      !game.trim() ||
      game.length > 100 ||
      !userId.trim() ||
      userId.length > 100 ||
      product.length > 100
    ) {
      return NextResponse.json(
        { message: "Informasi game atau produk tidak valid." },
        { status: 400 }
      );
    }

    // Validasi Zone ID
    if (
      zoneId !== null &&
      zoneId !== undefined &&
      (typeof zoneId !== "string" || zoneId.length > 50)
    ) {
      return NextResponse.json(
        { message: "Zone ID tidak valid." },
        { status: 400 }
      );
    }

    // Katalog harga di server
    const catalog: Record<string, number> = {
      "86 Diamonds": 20000,
      "172 Diamonds": 39000,
      "257 Diamonds": 58000,
      "344 Diamonds": 77000,
    };

    if (catalog[product] !== price) {
      return NextResponse.json(
        { message: "Harga produk tidak sesuai." },
        { status: 400 }
      );
    }

    // Periksa konfigurasi Midtrans
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction =
      process.env.MIDTRANS_IS_PRODUCTION === "true";

    if (!serverKey) {
      console.error("Midtrans Server Key belum dikonfigurasi.");

      return NextResponse.json(
        { message: "Konfigurasi pembayaran belum tersedia." },
        { status: 500 }
      );
    }

    // Buat nomor pesanan
    const orderCode = `TOPUP-${Date.now()}`;

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    // Simpan pesanan dengan ID akun dari sesi terverifikasi
    const { error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        account_id: user.id,
        order_code: orderCode,
        customer_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        game: game.trim(),
        user_id: userId.trim(),
        zone_id: zoneId?.trim() || null,
        product,
        price,
        status: "pending",
      });

    if (insertError) {
      console.error("Supabase error:", insertError);

      return NextResponse.json(
        { message: "Gagal menyimpan pesanan." },
        { status: 500 }
      );
    }

    // Tentukan endpoint Midtrans
    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    // Buat autentikasi Basic menggunakan Server Key
    const authorization = Buffer.from(`${serverKey}:`).toString(
      "base64"
    );

    // Buat transaksi Snap
    const midtransResponse = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authorization}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: orderCode,
          gross_amount: price,
        },
        customer_details: {
          first_name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
        },
        item_details: [
          {
            id: product,
            price,
            quantity: 1,
            name: product,
          },
        ],
        expiry: {
        unit: "hour",
        duration: 24,
      },
      }),
      cache: "no-store",
    });

    const midtransResult = await midtransResponse.json();

    // Periksa hasil pembuatan transaksi
    if (
      !midtransResponse.ok ||
      typeof midtransResult.redirect_url !== "string"
    ) {
      console.error("Midtrans transaction error:", midtransResult);

      return NextResponse.json(
        {
          message:
            "Pesanan tersimpan, tetapi transaksi pembayaran gagal dibuat. Silakan coba kembali atau hubungi admin.",
          orderCode,
        },
        { status: 502 }
      );
    }


    // Simpan URL pembayaran dan waktu kedaluwarsa
    const { error: updatePaymentError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_url: midtransResult.redirect_url,
        expires_at: expiresAt,
      })
      .eq("order_code", orderCode)
      .eq("account_id", user.id);

    if (updatePaymentError) {
      console.error(
        "Gagal menyimpan URL pembayaran:",
        updatePaymentError
      );

      return NextResponse.json(
        {
          message:
            "Transaksi pembayaran dibuat, tetapi gagal menyimpan informasi pembayaran. Silakan hubungi admin.",
        },
        { status: 500 }
      );
    }

    // Kirim URL pembayaran ke halaman checkout
    return NextResponse.json(
      {
        message: "Pesanan berhasil dibuat. Silakan lanjutkan pembayaran.",
        order: {
          order_code: orderCode,
          product,
          price,
          status: "pending",
        },
        paymentUrl: midtransResult.redirect_url,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// Mengambil riwayat pesanan milik akun yang sedang login
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Silakan login untuk melihat riwayat pesanan." },
        { status: 401 }
      );
    }

    const safeFields =
      "order_code, customer_name, game, user_id, zone_id, product, price, payment_method, status, created_at, payment_url, expires_at";

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(safeFields)
      .eq("account_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase order history error:", error);

      return NextResponse.json(
        { message: "Gagal mengambil riwayat pesanan." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Riwayat pesanan berhasil diambil.",
        orders: data ?? [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get order history error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}


// Menyembunyikan riwayat pesanan milik akun yang sedang login
export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const orderCode =
      typeof body?.orderCode === "string"
        ? body.orderCode.trim()
        : "";

    if (!orderCode || orderCode.length > 100) {
      return NextResponse.json(
        { message: "Nomor pesanan tidak valid." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("order_code", orderCode)
      .eq("account_id", user.id)
      .is("deleted_at", null)
      .select("order_code")
      .maybeSingle();

    if (error) {
      console.error("Delete order history error:", error);

      return NextResponse.json(
        { message: "Gagal menyembunyikan riwayat pesanan." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan atau sudah disembunyikan." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Riwayat pesanan berhasil disembunyikan." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete order API error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
