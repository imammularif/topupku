
"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function CheckoutContent() {
  const params = useSearchParams();

  const game = params.get("game") || "-";
  const userId = params.get("userId") || "-";
  const zoneId = params.get("zoneId") || "-";
  const product = params.get("product") || "-";
  const price = Number(params.get("price")) || 0;

  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateOrder() {
    if (!customerName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Nama, email, dan nomor HP wajib diisi.");
      return;
    }

    if (customerName.trim().length < 3) {
      setErrorMessage("Nama pemesan minimal 3 karakter.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setErrorMessage("Format email tidak valid.");
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");

    if (!/^(08\d{8,12}|\+628\d{8,11}|628\d{8,11})$/.test(cleanPhone)) {
      setErrorMessage("Format nomor HP tidak valid. Contoh: 081234567890.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          game,
          userId,
          zoneId,
          product,
          price,
          customerName: customerName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat pesanan.");
      }

      if (typeof result.paymentUrl !== "string") {
        throw new Error("URL pembayaran tidak ditemukan.");
      }

      const paymentUrl = new URL(result.paymentUrl);

      const allowedPaymentHosts = [
        "app.sandbox.midtrans.com",
        "app.midtrans.com",
      ];

      if (
        paymentUrl.protocol !== "https:" ||
        !allowedPaymentHosts.includes(paymentUrl.hostname)
      ) {
        throw new Error("URL pembayaran tidak valid.");
      }

      window.location.assign(paymentUrl.toString());
    } catch (error) {
      console.error("Create order error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat pesanan."
      );

      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080B18] px-4 py-10 text-slate-100 sm:px-6 sm:py-14">
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none fixed left-0 top-0 h-80 w-80 rounded-full bg-violet-600/10 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-80 w-80 rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-5xl">

      {/* HEADER */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-slate-400 transition-colors hover:text-violet-400"
        >
          ← Kembali ke Beranda
        </Link>

        <p className="mt-6 text-sm font-semibold tracking-wide text-violet-400">
          ORDER CHECKOUT
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Selesaikan Pesananmu
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-400">
          Periksa detail pesanan dan lengkapi informasi
          pelanggan sebelum melanjutkan pembayaran.
        </p>
      </div>

        {/* MAIN CONTENT */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* CUSTOMER INFORMATION */}
            <section className="rounded-2xl border border-slate-700/80 bg-[#111827] p-5 sm:p-7">
              <div className="mb-6">
                <p className="text-xs font-semibold text-violet-400">
                  STEP 01
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Informasi Pelanggan
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Masukkan informasi yang benar dan aktif untuk
                  keperluan transaksi dan pemulihan nomor pesanan.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Nama Lengkap Pemesan
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    autoComplete="name"
                    maxLength={100}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Email Aktif
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contoh@email.com"
                    autoComplete="email"
                    maxLength={254}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Nomor HP Aktif
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Gunakan nomor HP Indonesia yang masih aktif.
                  </p>
                </div>
              </div>
            </section>

            {/* PAYMENT INFORMATION */}
            <section className="rounded-2xl border border-slate-700/80 bg-[#111827] p-5 sm:p-7">
              <p className="text-xs font-semibold text-blue-400">
                STEP 02
              </p>

              <h2 className="mt-2 text-xl font-bold text-white">
                Metode Pembayaran
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-400">
                Setelah membuat pesanan, kamu akan diarahkan ke
                halaman pembayaran Midtrans. Pilih metode pembayaran
                yang tersedia, seperti QRIS, E-Wallet, Virtual Account,
                atau transfer bank.
              </p>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Pembayaran Aman
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Pembayaran diproses melalui Midtrans.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">

            {/* ORDER SUMMARY */}
            <section className="overflow-hidden rounded-2xl border border-violet-500/30 bg-[#111827] shadow-[0_0_25px_rgba(124,58,237,0.08)]">
              <div className="border-b border-violet-500/20 bg-gradient-to-r from-violet-600/15 to-blue-600/10 p-5 sm:p-6">
                <p className="text-xs font-semibold text-violet-400">
                  ORDER SUMMARY
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  Ringkasan Pesanan
                </h2>
              </div>

              <div className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-xs text-slate-500">
                    GAME
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {game}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-700/70 bg-[#080B18] p-4">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-400">User ID</span>
                    <span className="break-all text-right font-medium text-white">
                      {userId}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between gap-4 text-sm">
                    <span className="text-slate-400">Zone ID</span>
                    <span className="break-all text-right font-medium text-white">
                      {zoneId}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-slate-400">Produk</span>
                  <span className="text-right font-semibold text-white">
                    {product}
                  </span>
                </div>

                <div className="border-t border-dashed border-slate-700 pt-5">
                  <p className="text-sm text-slate-400">
                    Total Pembayaran
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-violet-400">
                    Rp{price.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </section>

            {/* CREATE ORDER */}
            <section className="rounded-2xl border border-slate-700/80 bg-[#111827] p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white">
                Konfirmasi Pesanan
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Pastikan informasi pelanggan dan detail pesanan
                sudah benar sebelum melanjutkan.
              </p>

              {errorMessage && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="mt-6 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Memproses Pesanan...
                </span>
              ) : (
                "Buat Pesanan →"
              )}
              </button>

              <Link
                href="/"
                className="mt-4 block text-center text-sm text-slate-400 transition-colors hover:text-violet-400"
              >
                Kembali ke Beranda
              </Link>
            </section>

            {/* SUPPORT NOTE */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <div className="flex items-start gap-3">
                <span className="text-blue-400">ⓘ</span>

                <p className="text-xs leading-6 text-slate-400">
                  Pastikan User ID dan Zone ID sudah benar.
                  Kesalahan pengisian data akun dapat memengaruhi
                  proses pengiriman produk.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-12 border-t border-slate-800 pt-6 text-center">
          <p className="text-xs text-slate-500">
            © 2026 TopUpKu. All Rights Reserved.
          </p>
        </div>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-slate-400">
          Memuat checkout...
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
