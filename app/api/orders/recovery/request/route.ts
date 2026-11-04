
import { NextResponse } from "next/server";
import { createHmac, randomInt } from "node:crypto";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


const resend = new Resend(process.env.RESEND_API_KEY);

const OTP_SECRET = process.env.ORDER_OTP_SECRET;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function hashOTP(email: string, otp: string) {
  if (!OTP_SECRET) {
    throw new Error("ORDER_OTP_SECRET belum diatur.");
  }

  return createHmac("sha256", OTP_SECRET)
    .update(`${email}:${otp}`)
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY || !FROM_EMAIL || !OTP_SECRET) {
      console.error("Konfigurasi OTP belum lengkap.");

      return NextResponse.json(
        { message: "Layanan belum siap digunakan." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Periksa apakah email memiliki pesanan.
    const { count, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("email", email);

    if (orderError) {
      console.error("Order lookup error:", orderError);

      return NextResponse.json(
        { message: "Terjadi kesalahan pada server." },
        { status: 500 }
      );
    }

    // Respons tetap generik untuk mencegah enumerasi email.
    const genericResponse = NextResponse.json({
      message:
        "Jika email terdaftar, kode verifikasi akan dikirim.",
    });

    if (!count || count === 0) {
      return genericResponse;
    }

    // Batasi permintaan OTP: maksimal satu kali per 60 detik.
    const cooldownTime = new Date(
      Date.now() - RESEND_COOLDOWN_SECONDS * 1000
    ).toISOString();

    const { data: recentOTP, error: cooldownError } =
      await supabaseAdmin
        .from("order_recovery_otps")
        .select("id")
        .eq("email", email)
        .gte("created_at", cooldownTime)
        .limit(1);

    if (cooldownError) {
      console.error("OTP cooldown error:", cooldownError);

      return NextResponse.json(
        { message: "Terjadi kesalahan pada server." },
        { status: 500 }
      );
    }

    if (recentOTP && recentOTP.length > 0) {
      return NextResponse.json(
        {
          message: "Tunggu 60 detik sebelum meminta kode baru.",
        },
        { status: 429 }
      );
    }

    // Nonaktifkan OTP sebelumnya yang belum digunakan.
    const { error: invalidateError } = await supabaseAdmin
      .from("order_recovery_otps")
      .update({ consumed_at: new Date().toISOString() })
      .eq("email", email)
      .is("consumed_at", null);

    if (invalidateError) {
      console.error("OTP invalidation error:", invalidateError);

      return NextResponse.json(
        { message: "Terjadi kesalahan pada server." },
        { status: 500 }
      );
    }

    // Buat OTP enam digit.
    const otp = randomInt(100000, 1000000).toString();
    const otpHash = hashOTP(email, otp);

    const expiresAt = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    ).toISOString();

    // Simpan hash OTP ke Supabase.
    const { data: savedOTP, error: saveError } =
      await supabaseAdmin
        .from("order_recovery_otps")
        .insert({
          email,
          otp_hash: otpHash,
          expires_at: expiresAt,
          attempts: 0,
        })
        .select("id")
        .single();

    if (saveError || !savedOTP) {
      console.error("OTP save error:", saveError);

      return NextResponse.json(
        { message: "Gagal memproses permintaan OTP." },
        { status: 500 }
      );
    }

    // Kirim OTP melalui Resend.
    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Kode Verifikasi Pemulihan Pesanan TopUpKu",
      text: [
        `Halo!`,
        ``,
        `Kode verifikasi pemulihan nomor pesanan TopUpKu kamu:`,
        ``,
        `${otp}`,
        ``,
        `Kode berlaku selama ${OTP_EXPIRY_MINUTES} menit.`,
        `Jangan bagikan kode ini kepada siapa pun.`,
        ``,
        `Jika kamu tidak meminta kode ini, abaikan email ini.`,
        ``,
        `Tim TopUpKu`,
      ].join("\n"),
    });

    if (emailError) {
      console.error("Resend delivery error:", emailError);

      await supabaseAdmin
        .from("order_recovery_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", savedOTP.id);

      return NextResponse.json(
        { message: "Gagal mengirim email verifikasi." },
        { status: 502 }
      );
    }

    return genericResponse;
  } catch (error) {
    console.error("Order recovery request error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
