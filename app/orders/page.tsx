
"use client";

import { useState } from "react";

type Order = {
  order_code: string;
  customer_name: string;
  game: string;
  user_id: string;
  zone_id: string | null;
  product: string;
  price: number;
  payment_method: string;
  status: string;
  created_at: string;
};

type SearchMode = "orderCode" | "gameId";
type RecoveryMethod = "email" | "whatsapp";
type RecoveryStep = "method" | "contact" | "otp" | "result";

export default function OrdersPage() {
  const [mode, setMode] = useState<SearchMode>("orderCode");

  const [orderCode, setOrderCode] = useState("");
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State popup lupa nomor pesanan
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMethod, setRecoveryMethod] =
    useState<RecoveryMethod>("email");
  const [recoveryStep, setRecoveryStep] =
    useState<RecoveryStep>("method");

  const [recoveryContact, setRecoveryContact] = useState("");
  const [otp, setOtp] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  async function handleSearch() {
    if (mode === "orderCode" && !orderCode.trim()) {
      setError("Masukkan nomor pesanan terlebih dahulu.");
      return;
    }

    if (mode === "gameId" && (!userId.trim() || !zoneId.trim())) {
      setError("Masukkan User ID dan Zone ID terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setOrders([]);

    try {
      const params = new URLSearchParams();

      if (mode === "orderCode") {
        params.set("orderCode", orderCode.trim());
      } else {
        params.set("userId", userId.trim());
        params.set("zoneId", zoneId.trim());
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Pesanan tidak ditemukan.");
      }

      setOrders(result.orders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  function openRecovery() {
    setShowRecovery(true);
    setRecoveryStep("method");
    setRecoveryMethod("email");
    setRecoveryContact("");
    setOtp("");
    setRecoveryMessage("");
  }

  function closeRecovery() {
    setShowRecovery(false);
  }

  function handleSendOTP() {
    if (!recoveryContact.trim()) {
      setRecoveryMessage(
        recoveryMethod === "email"
          ? "Masukkan alamat email terlebih dahulu."
          : "Masukkan nomor WhatsApp terlebih dahulu."
      );
      return;
    }

    if (
      recoveryMethod === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryContact.trim())
    ) {
      setRecoveryMessage("Format email tidak valid.");
      return;
    }

    if (
      recoveryMethod === "whatsapp" &&
      !/^(08\d{8,12}|\+628\d{8,11}|628\d{8,11})$/.test(
        recoveryContact.replace(/[\s-]/g, "")
      )
    ) {
      setRecoveryMessage("Format nomor WhatsApp tidak valid.");
      return;
    }

    setRecoveryMessage(
      "Simulasi berhasil! Kode OTP tidak benar-benar dikirim."
    );
    setRecoveryStep("otp");
  }

  function handleVerifyOTP() {
    if (!otp.trim()) {
      setRecoveryMessage("Masukkan kode OTP terlebih dahulu.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setRecoveryMessage("Kode OTP harus terdiri dari 6 angka.");
      return;
    }

    setRecoveryMessage("");
    setRecoveryStep("result");
  }

  function formatPrice(price: number) {
    return `Rp${price.toLocaleString("id-ID")}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-cyan-400">
          Riwayat Pesanan
        </h1>

        <p className="mb-8 text-slate-400">
          Cari transaksi TopUpKu berdasarkan nomor pesanan atau Game ID.
        </p>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("orderCode");
                setOrders([]);
                setError("");
              }}
              className={`rounded-lg py-3 text-sm font-bold transition ${
                mode === "orderCode"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Nomor Pesanan
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("gameId");
                setOrders([]);
                setError("");
              }}
              className={`rounded-lg py-3 text-sm font-bold transition ${
                mode === "gameId"
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Game ID
            </button>
          </div>

          {mode === "orderCode" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Nomor Pesanan
              </label>

              <input
                type="text"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Contoh: TOPUP-123456789"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  User ID
                </label>

                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Masukkan User ID"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Zone ID
                </label>

                <input
                  type="text"
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Masukkan Zone ID"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <p className="text-xs text-slate-400">
                Gunakan kombinasi User ID dan Zone ID yang sama
                dengan saat melakukan pemesanan.
              </p>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading ? "Mencari..." : "Cari Pesanan"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={openRecovery}
            className="mt-5 w-full text-center text-sm font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Lupa Nomor Pesanan?
          </button>
        </div>

        {orders.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-bold text-cyan-400">
              Hasil Pencarian ({orders.length})
            </h2>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_code}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold text-cyan-400">
                      {order.order_code}
                    </h3>

                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Nama Pemesan</span>
                      <span className="font-semibold">
                        {order.customer_name}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Game</span>
                      <span>{order.game}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">User ID</span>
                      <span>{order.user_id}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Zone ID</span>
                      <span>{order.zone_id || "-"}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Produk</span>
                      <span>{order.product}</span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Total</span>
                      <span className="font-bold text-cyan-400">
                        {formatPrice(order.price)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">Pembayaran</span>
                      <span>{order.payment_method}</span>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-slate-400">Tanggal Pesanan</p>
                      <p className="mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <a
          href="/"
          className="mt-8 block text-center text-sm text-slate-400 hover:text-white"
        >
          ← Kembali ke Beranda
        </a>
      </div>

      {/* POPUP LUPA NOMOR PESANAN */}
      {showRecovery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-sm"
          onClick={closeRecovery}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeRecovery}
              className="absolute right-5 top-5 text-xl text-slate-400 hover:text-white"
              aria-label="Tutup popup"
            >
              ×
            </button>

            {recoveryStep === "method" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-3xl">
                  🔎
                </div>

                <h2 className="mb-2 text-2xl font-bold text-cyan-400">
                  Lupa Nomor Pesanan?
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Jangan khawatir! Pilih metode yang ingin digunakan
                  untuk memulihkan nomor pesanan kamu.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMethod("email");
                      setRecoveryStep("contact");
                      setRecoveryMessage("");
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 text-left transition hover:border-cyan-400"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 text-2xl">
                      ✉️
                    </span>

                    <span className="flex-1">
                      <span className="block font-bold">Email</span>
                      <span className="text-xs text-slate-400">
                        Terima kode melalui email
                      </span>
                    </span>

                    <span className="text-slate-400">›</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMethod("whatsapp");
                      setRecoveryStep("contact");
                      setRecoveryMessage("");
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 text-left transition hover:border-cyan-400"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-2xl">
                      💬
                    </span>

                    <span className="flex-1">
                      <span className="block font-bold">WhatsApp</span>
                      <span className="text-xs text-slate-400">
                        Terima kode melalui WhatsApp
                      </span>
                    </span>

                    <span className="text-slate-400">›</span>
                  </button>
                </div>
              </>
            )}

            {recoveryStep === "contact" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-3xl">
                  {recoveryMethod === "email" ? "✉️" : "💬"}
                </div>

                <h2 className="mb-2 text-2xl font-bold text-cyan-400">
                  {recoveryMethod === "email"
                    ? "Pemulihan melalui Email"
                    : "Pemulihan melalui WhatsApp"}
                </h2>

                <p className="mb-6 text-sm text-slate-400">
                  Masukkan {recoveryMethod === "email" ? "email" : "nomor WhatsApp"}{" "}
                  yang kamu gunakan saat melakukan pemesanan.
                </p>

                <label className="mb-2 block text-sm font-semibold">
                  {recoveryMethod === "email"
                    ? "Alamat Email"
                    : "Nomor WhatsApp"}
                </label>

                <input
                  type={recoveryMethod === "email" ? "email" : "tel"}
                  value={recoveryContact}
                  onChange={(e) => {
                    setRecoveryContact(e.target.value);
                    setRecoveryMessage("");
                  }}
                  placeholder={
                    recoveryMethod === "email"
                      ? "nama@email.com"
                      : "08xxxxxxxxxx"
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                />

                {recoveryMessage && (
                  <p className="mt-3 rounded-lg bg-cyan-500/10 p-3 text-xs text-cyan-300">
                    {recoveryMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSendOTP}
                  className="mt-5 w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
                >
                  Kirim Kode Verifikasi
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryStep("method");
                    setRecoveryMessage("");
                  }}
                  className="mt-4 w-full text-sm text-slate-400 hover:text-white"
                >
                  ← Kembali memilih metode
                </button>
              </>
            )}

            {recoveryStep === "otp" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500/10 text-3xl">
                  🔐
                </div>

                <h2 className="mb-2 text-2xl font-bold text-cyan-400">
                  Verifikasi OTP
                </h2>

                <p className="mb-6 text-sm text-slate-400">
                  Masukkan kode verifikasi 6 digit.
                  Dalam prototype ini, kode tidak benar-benar dikirim.
                </p>

                <label className="mb-2 block text-sm font-semibold">
                  Kode OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setRecoveryMessage("");
                  }}
                  placeholder="000000"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none focus:border-cyan-400"
                />

                {recoveryMessage && (
                  <p className="mt-3 rounded-lg bg-red-500/10 p-3 text-xs text-red-300">
                    {recoveryMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  className="mt-5 w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Verifikasi Kode
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryStep("contact");
                    setOtp("");
                    setRecoveryMessage("");
                  }}
                  className="mt-4 w-full text-sm text-slate-400 hover:text-white"
                >
                  ← Kembali
                </button>
              </>
            )}

            {recoveryStep === "result" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-3xl">
                  ✓
                </div>

                <h2 className="mb-2 text-2xl font-bold text-green-400">
                  Verifikasi Berhasil!
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Simulasi verifikasi berhasil dilakukan.
                  Pada sistem asli, nomor pesanan yang cocok akan
                  ditampilkan di bagian ini.
                </p>

                <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5 text-center">
                  <p className="text-sm text-slate-400">
                    Nomor Pesanan
                  </p>
                  <p className="mt-2 font-bold text-cyan-400">
                    Akan ditampilkan setelah integrasi sistem
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeRecovery}
                  className="mt-6 w-full rounded-lg bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
                >
                  Selesai
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
