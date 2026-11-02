
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const paymentMethods = [
  { id: "QRIS", name: "QRIS", icon: "📱", description: "Scan kode QR" },
  { id: "E-Wallet", name: "E-Wallet", icon: "👛", description: "Dompet digital" },
  {
    id: "Virtual Account",
    name: "Virtual Account",
    icon: "🏦",
    description: "Pembayaran melalui VA",
  },
  {
    id: "Transfer Bank",
    name: "Transfer Bank",
    icon: "💳",
    description: "Transfer antarbank",
  },
];

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

  const [selectedPayment, setSelectedPayment] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleCreateOrder() {
    if (
      !customerName.trim() ||
      !email.trim() ||
      !phone.trim()
    ) {
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

    if (!selectedPayment) {
      setErrorMessage("Silakan pilih metode pembayaran terlebih dahulu.");
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
          paymentMethod: selectedPayment,
          customerName: customerName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal membuat pesanan.");
      }

      setOrderId(result.order.order_code);
      setSubmitted(true);
    } catch (error) {
      console.error("Create order error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat pesanan."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-xl">
        {!submitted ? (
          <>
            <h1 className="mb-2 text-3xl font-bold text-cyan-400">
              Checkout
            </h1>

            <p className="mb-8 text-slate-400">
              Periksa pesanan dan lengkapi informasi pelanggan.
            </p>

            {/* RINGKASAN PESANAN */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-5 text-xl font-bold">
                Ringkasan Pesanan
              </h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Game</span>
                  <span>{game}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">User ID</span>
                  <span>{userId}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Zone ID</span>
                  <span>{zoneId}</span>
                </div>

                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Produk</span>
                  <span>{product}</span>
                </div>

                <div className="flex justify-between border-t border-slate-700 pt-4 font-bold">
                  <span>Total Pembayaran</span>
                  <span className="text-cyan-400">
                    Rp{price.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* INFORMASI PELANGGAN */}
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-2 text-xl font-bold">
                Informasi Pelanggan
              </h2>

              <p className="mb-5 text-sm text-slate-400">
                Isi informasi yang benar dan aktif untuk keperluan
                transaksi dan pemulihan nomor pesanan.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Nomor HP Aktif
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="081234567890"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Gunakan nomor HP Indonesia yang masih aktif.
                  </p>
                </div>
              </div>
            </div>

            {/* METODE PEMBAYARAN */}
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-2 text-xl font-bold">
                Metode Pembayaran
              </h2>

              <p className="mb-5 text-sm text-slate-400">
                Pilih metode pembayaran yang kamu inginkan.
              </p>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${
                      selectedPayment === method.id
                        ? "border-cyan-400 bg-cyan-400/10"
                        : "border-slate-700 bg-slate-950 hover:border-slate-500"
                    }`}
                  >
                    <span className="text-3xl">{method.icon}</span>

                    <span className="flex-1">
                      <span className="block font-semibold">
                        {method.name}
                      </span>
                      <span className="text-sm text-slate-400">
                        {method.description}
                      </span>
                    </span>

                    <span className="text-cyan-400">
                      {selectedPayment === method.id ? "✓" : "○"}
                    </span>
                  </button>
                ))}
              </div>

              {errorMessage && (
                <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <button
                type="button"
                onClick={handleCreateOrder}
                disabled={isSubmitting}
                className="mt-6 w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Menyimpan Pesanan..." : "Buat Pesanan"}
              </button>

              <a
                href="/"
                className="mt-4 block text-center text-sm text-slate-400 hover:text-white"
              >
                Kembali ke Beranda
              </a>
            </div>
          </>
        ) : (
          /* KONFIRMASI PESANAN */
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7 text-center">
            <div className="mb-5 text-5xl">🎉</div>

            <h1 className="text-2xl font-bold text-cyan-400">
              Pesanan Berhasil Dibuat!
            </h1>

            <p className="mt-3 text-slate-400">
              Pesanan berhasil disimpan ke database TopUpKu.
            </p>

            <div className="my-7 rounded-xl bg-slate-950 p-5 text-left">
              <div className="mb-4">
                <p className="text-sm text-slate-400">Nomor Pesanan</p>
                <p className="mt-1 font-bold text-cyan-400">
                  {orderId}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">Nama Pemesan</p>
                <p className="mt-1 font-semibold">{customerName}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-1 font-semibold">{email}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">Nomor HP</p>
                <p className="mt-1 font-semibold">{phone}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">Game</p>
                <p className="mt-1 font-semibold">{game}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">Produk</p>
                <p className="mt-1 font-semibold">{product}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">
                  Metode Pembayaran
                </p>
                <p className="mt-1 font-semibold">{selectedPayment}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400">Total</p>
                <p className="mt-1 font-bold text-cyan-400">
                  Rp{price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="border-t border-slate-700 pt-4">
                <p className="text-sm text-slate-400">Status Pesanan</p>
                <p className="mt-1 font-semibold text-amber-400">
                  Menunggu Pembayaran (Simulasi)
                </p>
              </div>
            </div>

            <p className="mb-6 text-xs text-amber-300">
              Ini masih simulasi. Belum ada pembayaran sungguhan,
              pengiriman email atau SMS, kode QR, maupun proses top-up
              otomatis. Jangan melakukan transfer untuk pesanan ini.
            </p>

            <a
              href="/orders"
              className="mb-3 block w-full rounded-lg border border-cyan-500 py-3 font-bold text-cyan-400 hover:bg-cyan-500/10"
            >
              Cek Riwayat Pesanan
            </a>

            <a
              href="/"
              className="block w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
            >
              Kembali ke Beranda
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="p-10 text-white">Memuat checkout...</p>}>
      <CheckoutContent />
    </Suspense>
  );
}
