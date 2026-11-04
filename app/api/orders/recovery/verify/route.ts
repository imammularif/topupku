
import { NextResponse } from "next/server";
import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


const OTP_SECRET = process.env.ORDER_OTP_SECRET;
const MAX_ATTEMPTS = 5;

function hashOTP(email: string, otp: string) {
  if (!OTP_SECRET) {
    throw new Error("ORDER_OTP_SECRET belum diatur.");
  }

  return createHmac("sha256", OTP_SECRET)
    .update(`${email}:${otp}`)
    .digest("hex");
}

function compareHash(first: string, second: string) {
  const firstBuffer = Buffer.from(first, "hex");
  const secondBuffer = Buffer.from(second, "hex");

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

export async function POST(request: Request) {
  try {
    if (!OTP_SECRET) {
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

    const otp =
      typeof body.otp === "string"
        ? body.otp.trim()
        : "";

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{6}$/.test(otp)
    ) {
      return NextResponse.json(
        { message: "Email atau kode OTP tidak valid." },
        { status: 400 }
      );
    }

    // Ambil OTP terbaru yang belum digunakan.
    const { data: otpRecord, error: lookupError } =
      await supabaseAdmin
        .from("order_recovery_otps")
        .select(
          "id, otp_hash, expires_at, attempts, consumed_at"
        )
        .eq("email", email)
        .is("consumed_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (lookupError) {
      console.error("OTP lookup error:", lookupError);

      return NextResponse.json(
        { message: "Terjadi kesalahan pada server." },
        { status: 500 }
      );
    }

    if (!otpRecord) {
      return NextResponse.json(
        { message: "Kode OTP tidak valid atau sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { message: "Batas percobaan OTP telah tercapai." },
        { status: 429 }
      );
    }

    if (new Date(otpRecord.expires_at).getTime() <= Date.now()) {
      await supabaseAdmin
        .from("order_recovery_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", otpRecord.id);

      return NextResponse.json(
        { message: "Kode OTP sudah kedaluwarsa." },
        { status: 400 }
      );
    }

    // Periksa OTP yang dimasukkan pengguna.
    const submittedHash = hashOTP(email, otp);

    if (!compareHash(otpRecord.otp_hash, submittedHash)) {
      const nextAttempts = otpRecord.attempts + 1;

      const updateData: {
        attempts: number;
        consumed_at?: string;
      } = {
        attempts: nextAttempts,
      };

      if (nextAttempts >= MAX_ATTEMPTS) {
        updateData.consumed_at = new Date().toISOString();
      }

      const { error: attemptError } = await supabaseAdmin
        .from("order_recovery_otps")
        .update(updateData)
        .eq("id", otpRecord.id)
        .eq("attempts", otpRecord.attempts)
        .is("consumed_at", null);

      if (attemptError) {
        console.error("OTP attempt update error:", attemptError);

        return NextResponse.json(
          { message: "Terjadi kesalahan pada server." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message:
            nextAttempts >= MAX_ATTEMPTS
              ? "Batas percobaan OTP telah tercapai."
              : "Kode OTP salah.",
          remainingAttempts: Math.max(
            0,
            MAX_ATTEMPTS - nextAttempts
          ),
        },
        { status: nextAttempts >= MAX_ATTEMPTS ? 429 : 400 }
      );
    }

    // Ambil hanya nomor pesanan milik email terverifikasi.
    const { data: orders, error: ordersError } =
      await supabaseAdmin
        .from("orders")
        .select("order_code")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(20);

    if (ordersError) {
      console.error("Recovered orders error:", ordersError);

      return NextResponse.json(
        { message: "Gagal mengambil nomor pesanan." },
        { status: 500 }
      );
    }

    // Tandai OTP sudah digunakan.
    const { data: consumedOTP, error: consumeError } =
      await supabaseAdmin
        .from("order_recovery_otps")
        .update({ consumed_at: new Date().toISOString() })
        .eq("id", otpRecord.id)
        .eq("attempts", otpRecord.attempts)
        .is("consumed_at", null)
        .select("id")
        .maybeSingle();

    if (consumeError || !consumedOTP) {
      console.error("OTP consumption error:", consumeError);

      return NextResponse.json(
        { message: "Kode OTP sudah digunakan atau tidak valid." },
        { status: 409 }
      );
    }

    const orderCodes = (orders ?? []).map(
      (order) => order.order_code
    );

    return NextResponse.json(
      {
        message: "Nomor pesanan berhasil ditemukan.",
        orderCodes,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Order recovery verification error:", error);

    return NextResponse.json(
      { message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
