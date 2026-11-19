
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

    // Kirim OTP melalui Resend dengan template HTML TOPUPKU.
    const { error: emailError } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: "Kode Verifikasi Pemulihan Pesanan TOPUPKU",

      text: [
        "TOPUPKU",
        "",
        "Verifikasi Pemulihan Pesanan",
        "",
        "Halo!",
        "Gunakan kode berikut untuk memverifikasi permintaan pemulihan pesanan kamu:",
        "",
        otp,
        "",
        `Kode berlaku selama ${OTP_EXPIRY_MINUTES} menit.`,
        "Jangan bagikan kode ini kepada siapa pun.",
        "",
        "Jika kamu tidak meminta kode ini, abaikan email ini.",
        "",
        "Tim TOPUPKU",
      ].join("\n"),

      html: `
        <!DOCTYPE html>
        <html lang="id">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Verifikasi TOPUPKU</title>
          </head>

          <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f3f4f6;padding:32px 12px;">
              <tr>
                <td align="center">

                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;">

                    <!-- Header -->
                    <tr>
                      <td align="center" style="background-color:#111827;padding:28px 20px;">
                        <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:2px;">
                          TOPUPKU
                        </h1>

                        <p style="margin:8px 0 0;color:#d1d5db;font-size:11px;letter-spacing:2px;">
                          DIGITAL TOP-UP &amp; PAYMENT
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding:32px 28px;">

                        <h2 style="margin:0 0 16px;text-align:center;color:#111827;font-size:22px;">
                          Verifikasi Pemulihan Pesanan
                        </h2>

                        <p style="margin:0 0 24px;text-align:center;color:#6b7280;font-size:14px;line-height:1.7;">
                          Halo! Gunakan kode berikut untuk memverifikasi permintaan pemulihan pesanan kamu.
                        </p>

                        <!-- OTP -->
                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                          <tr>
                            <td align="center" style="background-color:#eff6ff;border:1px solid #dbeafe;border-radius:12px;padding:24px 12px;">

                              <p style="margin:0 0 10px;color:#64748b;font-size:11px;font-weight:700;letter-spacing:2px;">
                                KODE VERIFIKASI OTP
                              </p>

                              <p style="margin:0;color:#2563eb;font-size:36px;font-weight:800;letter-spacing:10px;">
                                ${otp}
                              </p>

                            </td>
                          </tr>
                        </table>

                        <p style="margin:24px 0 8px;text-align:center;color:#374151;font-size:14px;line-height:1.6;">
                          Kode berlaku selama
                          <strong>${OTP_EXPIRY_MINUTES} menit</strong>.
                        </p>

                        <p style="margin:0;text-align:center;color:#dc2626;font-size:13px;">
                          Jangan bagikan kode ini kepada siapa pun.
                        </p>

                        <hr style="margin:28px 0;border:0;border-top:1px solid #e5e7eb;" />

                        <p style="margin:0;text-align:center;color:#9ca3af;font-size:12px;line-height:1.7;">
                          Jika kamu tidak meminta kode ini, abaikan email ini.
                        </p>

                        <p style="margin:20px 0 0;text-align:center;color:#111827;font-size:14px;font-weight:700;">
                          Tim TOPUPKU
                        </p>

                      </td>
                    </tr>
                  </table>

                  <!-- Footer -->
                  <p style="margin:20px 0 0;color:#9ca3af;font-size:11px;text-align:center;">
                    &copy; TOPUPKU. All rights reserved.
                  </p>

                </td>
              </tr>
            </table>

          </body>
        </html>
      `,
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
