
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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

type SearchHistory = {
  id: string;
  mode: SearchMode;
  orderCode?: string;
  userId?: string;
  zoneId?: string;
  searchedAt: string;
  resultCount: number;
};

type RecoveryMethod = "email" | "whatsapp";
type RecoveryStep = "method" | "contact" | "otp" | "result";

const HISTORY_KEY = "topupku_search_history";
const MAX_HISTORY = 30;

export default function OrdersPage() {
  const [mode, setMode] = useState<SearchMode>("orderCode");

  const [orderCode, setOrderCode] = useState("");
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMethod, setRecoveryMethod] =
    useState<RecoveryMethod>("email");
  const [recoveryStep, setRecoveryStep] =
    useState<RecoveryStep>("method");

  const [recoveryContact, setRecoveryContact] = useState("");
  const [otp, setOtp] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [otpRemaining, setOtpRemaining] = useState(0);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveredOrderCodes, setRecoveredOrderCodes] = useState<string[]>([]);

  // OTP COUNTDOWN
  useEffect(() => {
    if (recoveryStep !== "otp" || otpExpiresAt === null) return;

    const interval = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((otpExpiresAt - Date.now()) / 1000)
      );

      setOtpRemaining(remaining);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [recoveryStep, otpExpiresAt]);

  // LOAD SEARCH HISTORY
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setHistory(parsed);
        }
      }
    } catch {
      console.error("Gagal membaca riwayat pencarian.");
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  // SAVE SEARCH HISTORY
  function saveHistory(newHistory: SearchHistory[]) {
    setHistory(newHistory);

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch {
      setError("Riwayat tidak dapat disimpan di browser.");
    }
  }

  function addSearchHistory(
    entry: Omit<SearchHistory, "id" | "searchedAt">
  ) {
    const newEntry: SearchHistory = {
      ...entry,
      id: crypto.randomUUID(),
      searchedAt: new Date().toISOString(),
    };

    const updated = [
      newEntry,
      ...history.filter((item) => {
        if (item.mode !== newEntry.mode) return true;

        if (item.mode === "orderCode") {
          return item.orderCode !== newEntry.orderCode;
        }

        return (
          item.userId !== newEntry.userId ||
          item.zoneId !== newEntry.zoneId
        );
      }),
    ].slice(0, MAX_HISTORY);

    saveHistory(updated);
  }

  function deleteHistory(id: string) {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  }

  function clearHistory() {
    if (!window.confirm("Hapus seluruh riwayat pencarian?")) return;
    saveHistory([]);
  }

  // SEARCH ORDERS
  async function searchOrders(
    searchMode: SearchMode,
    values: {
      orderCode?: string;
      userId?: string;
      zoneId?: string;
    }
  ) {
    setLoading(true);
    setError("");
    setOrders([]);

    try {
      const params = new URLSearchParams();

      if (searchMode === "orderCode") {
        params.set("orderCode", values.orderCode || "");
      } else {
        params.set("userId", values.userId || "");
        params.set("zoneId", values.zoneId || "");
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Pesanan tidak ditemukan.");
      }

      const foundOrders: Order[] = result.orders || [];
      setOrders(foundOrders);

      addSearchHistory({
        mode: searchMode,
        orderCode: values.orderCode,
        userId: values.userId,
        zoneId: values.zoneId,
        resultCount: foundOrders.length,
      });

      if (foundOrders.length === 0) {
        setError("Pesanan tidak ditemukan.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (mode === "orderCode") {
      const value = orderCode.trim();

      if (!value) {
        setError("Masukkan nomor pesanan terlebih dahulu.");
        return;
      }

      await searchOrders("orderCode", { orderCode: value });
      return;
    }

    const id = userId.trim();
    const zone = zoneId.trim();

    if (!id || !zone) {
      setError("Masukkan User ID dan Zone ID terlebih dahulu.");
      return;
    }

    await searchOrders("gameId", {
      userId: id,
      zoneId: zone,
    });
  }

  // REPEAT SEARCH
  async function searchAgain(item: SearchHistory) {
    setMode(item.mode);
    setError("");
    setOrders([]);

    if (item.mode === "orderCode") {
      setOrderCode(item.orderCode || "");

      await searchOrders("orderCode", {
        orderCode: item.orderCode,
      });
    } else {
      setUserId(item.userId || "");
      setZoneId(item.zoneId || "");

      await searchOrders("gameId", {
        userId: item.userId,
        zoneId: item.zoneId,
      });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // RECOVERY
  function openRecovery() {
    setShowRecovery(true);
    setRecoveryStep("method");
    setRecoveryMethod("email");
    setRecoveryContact("");
    setOtp("");
    setRecoveryMessage("");
    setRecoveredOrderCodes([]);
    setOtpExpiresAt(null);
    setOtpRemaining(0);
  }

  function closeRecovery() {
    setShowRecovery(false);
  }

  async function handleSendOTP() {
    const email = recoveryContact.trim().toLowerCase();

    if (!email) {
      setRecoveryMessage("Masukkan alamat email terlebih dahulu.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRecoveryMessage("Format email tidak valid.");
      return;
    }

    setRecoveryLoading(true);
    setRecoveryMessage("");

    try {
      const response = await fetch("/api/orders/recovery/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal meminta kode OTP.");
      }

      setRecoveryContact(email);
      setRecoveryStep("otp");
      setRecoveryMessage(result.message);
      setOtpExpiresAt(Date.now() + 5 * 60 * 1000);
      setOtpRemaining(300);
    } catch (err) {
      setRecoveryMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setRecoveryLoading(false);
    }
  }

  async function handleVerifyOTP() {
    const email = recoveryContact.trim().toLowerCase();

    if (!/^\d{6}$/.test(otp)) {
      setRecoveryMessage("Kode OTP harus terdiri dari 6 angka.");
      return;
    }

    setRecoveryLoading(true);
    setRecoveryMessage("");

    try {
      const response = await fetch("/api/orders/recovery/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Verifikasi OTP gagal.");
      }

      setRecoveredOrderCodes(result.orderCodes || []);
      setRecoveryMessage("");
      setRecoveryStep("result");
    } catch (err) {
      setRecoveryMessage(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setRecoveryLoading(false);
    }
  }

  function formatPrice(price: number) {
    return `Rp${price.toLocaleString("id-ID")}`;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID");
  }

  function formatHistoryDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <main className="min-h-screen bg-[#080B18] px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-400"
          >
            <span>←</span>
            Kembali ke Beranda
          </Link>

          <div className="mb-4 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-violet-300">
            TOPUPKU ORDER CENTER
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Riwayat <span className="text-violet-400">Pesanan</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Temukan transaksi, pantau status pembayaran, dan kelola
            riwayat pesanan TopUpKu dengan mudah.
          </p>

          <div className="mt-6 h-[2px] w-40 rounded-full bg-gradient-to-r from-violet-500 via-purple-400 to-blue-500 shadow-[0_0_12px_rgba(139,92,246,0.5)]" />
        </div>

        {/* SEARCH CARD */}
        <section className="rounded-2xl border border-violet-500/20 bg-[#111827] p-5 shadow-[0_0_30px_rgba(124,58,237,0.06)] sm:p-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">
              Cari Pesanan
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Pilih metode pencarian yang ingin digunakan.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("orderCode");
                setOrders([]);
                setError("");
              }}
              className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                mode === "orderCode"
                  ? "border-violet-500 bg-violet-600 text-white shadow-[0_0_14px_rgba(139,92,246,0.25)]"
                  : "border-slate-700 bg-[#080B18] text-slate-400 hover:border-violet-500/50 hover:text-white"
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
              className={`rounded-xl border py-3 text-sm font-semibold transition-all ${
                mode === "gameId"
                  ? "border-violet-500 bg-violet-600 text-white shadow-[0_0_14px_rgba(139,92,246,0.25)]"
                  : "border-slate-700 bg-[#080B18] text-slate-400 hover:border-violet-500/50 hover:text-white"
              }`}
            >
              Game ID
            </button>
          </div>

          {mode === "orderCode" ? (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">
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
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-600"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  User ID
                </label>

                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Masukkan User ID"
                  className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
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
                  className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 placeholder:text-slate-600"
                />
              </div>

              <p className="text-xs leading-5 text-slate-500">
                Gunakan kombinasi User ID dan Zone ID yang sama
                dengan saat melakukan pemesanan.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-[0_0_18px_rgba(124,58,237,0.35)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Mencari Pesanan..." : "Cari Pesanan"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="mt-5 border-t border-slate-700/70 pt-5 text-center">
            <p className="text-sm text-slate-400">
              Tidak ingat nomor pesanan?
            </p>

            <button
              type="button"
              onClick={openRecovery}
              className="mt-2 text-sm font-semibold text-violet-400 transition hover:text-blue-300"
            >
              Lupa Nomor Pesanan? →
            </button>
          </div>
        </section>

        {/* SEARCH RESULTS */}
        {orders.length > 0 && (
          <section className="mt-9">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-violet-400">
                  TRANSACTION RESULT
                </p>
                <h2 className="mt-1 text-xl font-bold text-white">
                  Hasil Pencarian
                </h2>
              </div>

              <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300">
                {orders.length} Pesanan
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.order_code}
                  className="rounded-2xl border border-slate-700/80 bg-[#111827] p-5 transition hover:border-violet-500/40 sm:p-6"
                >
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-500">
                        Nomor Pesanan
                      </p>
                      <h3 className="mt-1 break-all font-bold text-violet-300">
                        {order.order_code}
                      </h3>
                    </div>

                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    {[
                      ["Nama Pemesan", order.customer_name],
                      ["Game", order.game],
                      ["User ID", order.user_id],
                      ["Zone ID", order.zone_id || "-"],
                      ["Produk", order.product],
                      ["Pembayaran", order.payment_method],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex justify-between gap-4"
                      >
                        <span className="text-slate-400">{label}</span>
                        <span className="text-right font-medium text-slate-200">
                          {value}
                        </span>
                      </div>
                    ))}

                    <div className="flex justify-between gap-4 border-t border-slate-700 pt-4">
                      <span className="font-semibold text-slate-300">
                        Total Pembayaran
                      </span>
                      <span className="font-bold text-violet-400">
                        {formatPrice(order.price)}
                      </span>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-xs text-slate-500">
                        Tanggal Pesanan
                      </p>
                      <p className="mt-1 text-slate-300">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SEARCH HISTORY */}
        <section className="mt-11">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-blue-400">
                YOUR ACTIVITY
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Riwayat Pencarian
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Pencarian yang pernah kamu lakukan di browser ini.
              </p>
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
              >
                Hapus Semua
              </button>
            )}
          </div>

          {!historyLoaded ? (
            <div className="rounded-xl border border-slate-700 bg-[#111827] p-6 text-center text-sm text-slate-400">
              Memuat riwayat...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-[#111827]/70 p-9 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-400">
                ⌕
              </div>

              <h3 className="mt-4 font-semibold text-slate-200">
                Belum Ada Riwayat Pencarian
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pencarian pesanan yang berhasil dilakukan akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-700/80 bg-[#111827] p-4 transition hover:border-blue-500/40 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">
                        {item.mode === "orderCode"
                          ? "Nomor Pesanan"
                          : "Game ID"}
                      </span>

                      <p className="mt-2 break-all font-semibold text-white">
                        {item.mode === "orderCode"
                          ? item.orderCode
                          : `${item.userId} / ${item.zoneId}`}
                      </p>

                      <p className="mt-2 text-xs text-slate-500">
                        {formatHistoryDate(item.searchedAt)}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.resultCount} pesanan ditemukan
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => searchAgain(item)}
                        disabled={loading}
                        className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
                      >
                        Cari Lagi
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteHistory(item.id)}
                        aria-label="Hapus riwayat"
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-red-400 transition hover:border-red-500/40 hover:bg-red-500/10"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Riwayat ini tersimpan di browser dan perangkat yang kamu gunakan.
            Menghapus data browser dapat menghilangkan riwayat ini.
          </p>
        </section>

        {/* CUSTOMER SUPPORT */}
        <section className="mt-10 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#111827] to-[#11152B] p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-wide text-blue-400">
                NEED ASSISTANCE?
              </p>
              <h2 className="mt-2 text-lg font-bold text-white">
                Butuh Bantuan?
              </h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                Jika mengalami kendala saat mencari pesanan, silakan hubungi
                customer support TopUpKu.
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 px-5 py-3 text-sm font-semibold text-blue-300">
              Customer Support
            </span>
          </div>
        </section>

        {/* BACK HOME */}
        <Link
          href="/"
          className="mt-8 block text-center text-sm font-medium text-slate-400 transition hover:text-violet-400"
        >
          ← Kembali ke Beranda
        </Link>

        {/* FOOTER */}
        <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 TopUpKu. All Rights Reserved.
        </footer>
      </div>

      {/* RECOVERY MODAL */}
      {showRecovery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
          onClick={closeRecovery}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-violet-500/30 bg-[#111827] p-6 shadow-[0_0_40px_rgba(124,58,237,0.2)] sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeRecovery}
              className="absolute right-5 top-5 rounded-lg px-2 text-xl text-slate-400 transition hover:text-white"
              aria-label="Tutup popup"
            >
              ×
            </button>

            {/* RECOVERY METHOD */}
            {recoveryStep === "method" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-3xl">
                  🔎
                </div>

                <h2 className="mb-2 text-2xl font-bold text-white">
                  Lupa Nomor Pesanan?
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Pilih metode yang ingin digunakan untuk memulihkan nomor
                  pesanan kamu.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMethod("email");
                      setRecoveryStep("contact");
                      setRecoveryMessage("");
                    }}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-700 bg-[#080B18] p-4 text-left transition hover:border-violet-500/60"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-violet-500/10 text-2xl">
                      ✉️
                    </span>

                    <span className="flex-1">
                      <span className="block font-bold text-white">
                        Email
                      </span>
                      <span className="text-xs text-slate-400">
                        Terima kode melalui email
                      </span>
                    </span>

                    <span className="text-slate-400">›</span>
                  </button>

                  <button
                    type="button"
                    disabled
                    className="flex w-full cursor-not-allowed items-center gap-4 rounded-xl border border-slate-700 bg-[#080B18] p-4 text-left opacity-50"
                  >
                    <span className="text-2xl">💬</span>
                    <span className="flex-1">
                      <span className="block font-bold text-white">
                        WhatsApp
                      </span>
                      <span className="text-xs text-slate-400">
                        Segera tersedia
                      </span>
                    </span>
                  </button>
                </div>
              </>
            )}

            {/* RECOVERY CONTACT */}
            {recoveryStep === "contact" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-3xl">
                  ✉️
                </div>

                <h2 className="mb-2 text-2xl font-bold text-white">
                  Pemulihan melalui Email
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Masukkan email yang kamu gunakan saat melakukan pemesanan.
                </p>

                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Alamat Email
                </label>

                <input
                  type="email"
                  value={recoveryContact}
                  onChange={(e) => {
                    setRecoveryContact(e.target.value);
                    setRecoveryMessage("");
                  }}
                  placeholder="nama@email.com"
                  className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                />

                {recoveryMessage && (
                  <p className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-300">
                    {recoveryMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleSendOTP}
                  disabled={recoveryLoading}
                  className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3 font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:opacity-50"
                >
                  {recoveryLoading ? "Mengirim..." : "Kirim Kode Verifikasi"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryStep("method");
                    setRecoveryMessage("");
                  }}
                  className="mt-4 w-full text-sm text-slate-400 transition hover:text-white"
                >
                  ← Kembali memilih metode
                </button>
              </>
            )}

            {/* OTP VERIFICATION */}
            {recoveryStep === "otp" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-3xl">
                  🔐
                </div>

                <h2 className="mb-2 text-2xl font-bold text-white">
                  Verifikasi OTP
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Masukkan kode verifikasi 6 digit yang diterima melalui email.
                  Kode berlaku selama 5 menit.
                </p>

                <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center">
                  <p className="mb-1 text-xs text-slate-400">
                    Sisa waktu kode OTP
                  </p>

                  <p
                    className={`text-3xl font-bold tabular-nums ${
                      otpRemaining <= 60
                        ? "text-red-400"
                        : "text-violet-400"
                    }`}
                  >
                    {String(Math.floor(otpRemaining / 60)).padStart(2, "0")}:
                    {String(otpRemaining % 60).padStart(2, "0")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {otpRemaining > 0
                      ? "Kode OTP akan kedaluwarsa setelah waktu habis."
                      : "Kode OTP telah kedaluwarsa. Silakan minta kode baru."}
                  </p>
                </div>

                <label className="mb-2 block text-sm font-semibold text-slate-200">
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
                  className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-4 text-center text-2xl font-bold tracking-[0.5em] text-white outline-none transition focus:border-violet-500"
                />

                {recoveryMessage && (
                  <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                    {recoveryMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVerifyOTP}
                  disabled={recoveryLoading || otpRemaining <= 0}
                  className="mt-5 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3 font-bold text-white transition hover:from-violet-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {recoveryLoading ? "Memverifikasi..." : "Verifikasi Kode"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRecoveryStep("contact");
                    setOtp("");
                    setRecoveryMessage("");
                  }}
                  className="mt-4 w-full text-sm text-slate-400 transition hover:text-white"
                >
                  ← Kembali
                </button>
              </>
            )}

            {/* RECOVERY RESULT */}
            {recoveryStep === "result" && (
              <>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10 text-3xl text-green-400">
                  ✓
                </div>

                <h2 className="mb-2 text-2xl font-bold text-green-400">
                  Verifikasi Berhasil!
                </h2>

                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Berikut nomor pesanan yang terhubung dengan email kamu.
                </p>

                <div className="space-y-3">
                  {recoveredOrderCodes.length > 0 ? (
                    recoveredOrderCodes.map((code) => (
                      <div
                        key={code}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-[#080B18] p-4"
                      >
                        <span className="break-all font-bold text-violet-300">
                          {code}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                            setRecoveryMessage(
                              "Nomor pesanan berhasil disalin."
                            );
                          }}
                          className="shrink-0 rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-600"
                        >
                          Salin
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-700 bg-[#080B18] p-5 text-center text-sm text-slate-400">
                      Tidak ada nomor pesanan yang ditemukan.
                    </div>
                  )}
                </div>

                {recoveryMessage && (
                  <p className="mt-3 text-xs text-green-300">
                    {recoveryMessage}
                  </p>
                )}

                <button
                  type="button"
                  onClick={closeRecovery}
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3 font-bold text-white transition hover:from-violet-500 hover:to-blue-500"
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
