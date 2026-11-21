
import { NextResponse } from "next/server";
import {
  createHash,
  timingSafeEqual,
} from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export async function POST(request: Request) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const signatureSecretKey =
      process.env.MIDTRANS_SIGNATURE_SECRET_KEY;

    if (!serverKey || !signatureSecretKey) {
      console.error("Konfigurasi key Midtrans belum lengkap.");

      return NextResponse.json(
        { message: "Konfigurasi pembayaran tidak tersedia." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const orderId = String(body.order_id ?? "");
    const statusCode = String(body.status_code ?? "");
    const grossAmount = String(body.gross_amount ?? "");
    const signatureKey = String(body.signature_key ?? "");

    if (!orderId || !statusCode || !grossAmount || !signatureKey) {
      return NextResponse.json(
        { message: "Data notifikasi tidak lengkap." },
        { status: 400 }
      );
    }

    // 1. Verifikasi signature notifikasi
    const expectedSignature = createHash("sha512")
      .update(
        `${orderId}${statusCode}${grossAmount}${signatureSecretKey}`
      )
      .digest("hex");

    const receivedBuffer = Buffer.from(signatureKey, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      receivedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(receivedBuffer, expectedBuffer)
    ) {
      return NextResponse.json(
        { message: "Signature tidak valid." },
        { status: 401 }
      );
    }

    // 2. Cari pesanan di Supabase
    const { data: order, error: findError } =
      await supabaseAdmin
        .from("orders")
        .select("order_code, status, price")
        .eq("order_code", orderId)
        .maybeSingle();

    if (findError) {
      console.error("Gagal mencari pesanan:", findError);

      return NextResponse.json(
        { message: "Gagal memeriksa pesanan." },
        { status: 500 }
      );
    }

    if (!order) {
      return NextResponse.json(
        { message: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Validasi nominal notifikasi
    const notificationAmount = Number(grossAmount);

    if (
      !Number.isFinite(notificationAmount) ||
      notificationAmount !== Number(order.price)
    ) {
      return NextResponse.json(
        { message: "Nominal pembayaran tidak cocok." },
        { status: 400 }
      );
    }

    // 4. Ambil status resmi transaksi dari Midtrans
    const isProduction =
      process.env.MIDTRANS_IS_PRODUCTION === "true";

    const statusUrl = isProduction
      ? `https://api.midtrans.com/v2/${encodeURIComponent(orderId)}/status`
      : `https://api.sandbox.midtrans.com/v2/${encodeURIComponent(orderId)}/status`;

    const authorization = Buffer.from(`${serverKey}:`).toString(
      "base64"
    );

    const statusResponse = await fetch(statusUrl, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authorization}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!statusResponse.ok) {
      console.error(
        "Gagal mengambil status resmi Midtrans:",
        statusResponse.status
      );

      return NextResponse.json(
        { message: "Gagal memverifikasi status pembayaran." },
        { status: 502 }
      );
    }

    const midtransStatus = await statusResponse.json();

    // 5. Cocokkan data transaksi resmi
    if (
      String(midtransStatus.order_id) !== orderId ||
      Number(midtransStatus.gross_amount) !== Number(order.price)
    ) {
      return NextResponse.json(
        { message: "Data transaksi Midtrans tidak cocok." },
        { status: 400 }
      );
    }

    const transactionStatus = String(
      midtransStatus.transaction_status ?? ""
    ).toLowerCase();

    let newStatus: string;

    switch (transactionStatus) {
      case "settlement":
        newStatus = "settlement";
        break;

      case "capture":
        newStatus =
          midtransStatus.fraud_status === "accept"
            ? "capture"
            : "pending";
        break;

      case "pending":
        newStatus = "pending";
        break;

      case "expire":
        newStatus = "expire";
        break;

      case "cancel":
        newStatus = "cancel";
        break;

      case "deny":
        newStatus = "deny";
        break;

      default:
        return NextResponse.json(
          { message: "Status transaksi tidak diproses." },
          { status: 200 }
        );
    }

    // 6. Lindungi pesanan yang sudah lunas
    const paidStatuses = [
      "settlement",
      "capture",
      "success",
      "paid",
    ];

    const currentStatus = String(order.status).toLowerCase();

    if (
      paidStatuses.includes(currentStatus) &&
      !paidStatuses.includes(newStatus)
    ) {
      return NextResponse.json({
        message: "Pesanan sudah dibayar.",
      });
    }

// 7. Perbarui status dengan perlindungan transaksi lunas
    const { data: updatedOrder, error: updateError } =
    await supabaseAdmin
        .from("orders")
        .update({ status: newStatus })
        .eq("order_code", orderId)
        .not(
        "status",
        "in",
        '("settlement","capture","success","paid")'
        )
        .select("order_code")
        .maybeSingle();

    if (updateError) {
      console.error("Gagal memperbarui status:", updateError);

      return NextResponse.json(
        { message: "Gagal memperbarui status pesanan." },
        { status: 500 }
      );
    }

    if (!updatedOrder) {
    return NextResponse.json({
        message: "Pesanan sudah dibayar atau tidak perlu diperbarui.",
    });
    }

    return NextResponse.json({
      message: "Notifikasi berhasil diproses.",
      order_id: orderId,
      status: newStatus,
    });
  } catch (error) {
    console.error("Midtrans notification error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada webhook." },
      { status: 500 }
    );
  }
}
