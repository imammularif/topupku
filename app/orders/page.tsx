
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  order_code: string;
  customer_name: string;
  game: string;
  user_id: string;
  zone_id: string | null;
  product: string;
  price: number;
  payment_method: string | null;
  status: string;
  created_at: string;
  payment_url: string | null;
  expires_at: string | null;
};

function formatPrice(price: number) {
  return `Rp${Number(price).toLocaleString("id-ID")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });
}

function formatCountdown(expiresAt: string, now: number) {
  const remaining = Math.max(
    0,
    new Date(expiresAt).getTime() - now
  );

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor(
    (remaining % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function getStatusInfo(status: string) {
  const normalized = status.toLowerCase();

  if (["settlement", "capture", "success", "paid"].includes(normalized)) {
    return {
      label: "Berhasil",
      className:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
    };
  }

  if (["pending", "authorize"].includes(normalized)) {
    return {
      label: "Menunggu Pembayaran",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    };
  }

  if (["expire", "expired"].includes(normalized)) {
    return {
      label: "Kedaluwarsa",
      className: "border-slate-500/30 bg-slate-500/10 text-slate-400",
    };
  }

  if (["cancel", "cancelled", "deny", "failure", "failed"].includes(normalized)) {
    return {
      label: "Gagal",
      className: "border-red-500/30 bg-red-500/10 text-red-400",
    };
  }

  return {
    label: status || "Tidak diketahui",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  };
}

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<
  "all" | "unpaid" | "paid"
>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<string | null>(null);
  const [confirmHideOrder, setConfirmHideOrder] = useState<Order | null>(null);
  const [now, setNow] = useState(0);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login?next=%2Forders");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil riwayat pesanan."
        );
      }

      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mengambil riwayat."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setNow(Date.now());

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const paidOrders = orders.filter((order) =>
  ["settlement", "capture", "success", "paid"].includes(
    order.status.toLowerCase()
  )
);

const unpaidOrders = orders.filter((order) => {
  const isPending = ["pending", "authorize"].includes(
    order.status.toLowerCase()
  );

  const isNotExpired =
    !order.expires_at ||
    new Date(order.expires_at).getTime() > Date.now();

  return isPending && isNotExpired;
});

const filteredOrders =
  activeTab === "paid"
    ? paidOrders
    : activeTab === "unpaid"
      ? unpaidOrders
      : orders;

    async function handleHideOrder(order: Order) {
      setDeletingOrder(order.order_code);
      setError("");

    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderCode: order.order_code,
        }),
      });

      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login?next=%2Forders");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menyembunyikan riwayat pesanan."
        );
      }

      setOrders((current) =>
        current.filter((item) => item.order_code !== order.order_code)
      );

      setConfirmHideOrder(null);

      if (selectedOrder?.order_code === order.order_code) {
        setSelectedOrder(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat menyembunyikan pesanan."
      );
    } finally {
      setDeletingOrder(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#080B18] px-4 py-10 text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-400"
          >
            <span>←</span>
            Kembali ke Beranda
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-violet-400">
                YOUR TRANSACTIONS
              </p>

              <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Riwayat Pesanan
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                Pantau seluruh transaksi top up yang terhubung dengan akun
                TOPUPKU kamu.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-[#111827] px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-500/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-violet-400" />
                  Memuat...
                </span>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-7 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#15132B] to-[#101827] p-5 sm:p-6">
          <p className="text-sm font-medium text-slate-400">
            Total Pesanan
          </p>

          <div className="mt-2 flex items-end gap-3">
            <span className="text-4xl font-extrabold text-white">
              {orders.length}
            </span>
            <span className="pb-1 text-sm text-slate-400">
              transaksi tersimpan
            </span>
          </div>
        </div>


        {/* TRANSACTION TABS */}
        <div className="mb-7 grid grid-cols-3 gap-2 rounded-xl border border-slate-700 bg-[#111827] p-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3 py-3 text-xs font-bold transition sm:text-sm ${
              activeTab === "all"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Semua ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("unpaid")}
            className={`rounded-lg px-3 py-3 text-xs font-bold transition sm:text-sm ${
              activeTab === "unpaid"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-900/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Belum Dibayar ({unpaidOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("paid")}
            className={`rounded-lg px-3 py-3 text-xs font-bold transition sm:text-sm ${
              activeTab === "paid"
                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Sudah Dibayar ({paidOrders.length})
          </button>
        </div>


        {/* ERROR */}
        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadOrders}
              className="font-semibold underline underline-offset-4"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading ? (
          <div className="rounded-2xl border border-slate-700 bg-[#111827] p-12 text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />
            <p className="mt-5 text-sm text-slate-400">
              Memuat riwayat pesanan kamu...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-2xl border border-dashed border-slate-700 bg-[#111827]/70 px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-3xl">
              🛒
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Belum Ada Pesanan
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Pesanan yang kamu buat menggunakan akun ini akan otomatis
              muncul di halaman riwayat.
            </p>

            <Link
              href="/"
              className="mt-7 inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:from-violet-500 hover:to-blue-500"
            >
              Mulai Top Up
            </Link>
          </div>
        ) : (
          /* ORDER LIST */
          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {activeTab === "all"
                    ? "Semua Transaksi"
                    : activeTab === "unpaid"
                      ? "Transaksi Belum Dibayar"
                      : "Transaksi Sudah Dibayar"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Diurutkan dari pesanan terbaru.
                </p>
              </div>

              <span className="rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-xs font-bold text-violet-300">
                {filteredOrders.length} Pesanan
              </span>
            </div>

            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const status = getStatusInfo(order.status);
                const isPending = ["pending", "authorize"].includes(
                  order.status.toLowerCase()
                );

                const hasPaymentUrl = Boolean(order.payment_url);

                const isPaymentExpired =
                  Boolean(order.expires_at) &&
                  new Date(order.expires_at!).getTime() <= now;

                const canContinuePayment =
                  isPending &&
                  hasPaymentUrl &&
                  Boolean(order.expires_at) &&
                  !isPaymentExpired;

                return (
                  <article
                    key={order.order_code}
                    className="rounded-2xl border border-slate-700/80 bg-[#111827] p-5 transition hover:border-violet-500/40 sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500">
                          NOMOR PESANAN
                        </p>

                        <h3 className="mt-1 break-all font-bold text-violet-300">
                          {order.order_code}
                        </h3>

                        <p className="mt-3 text-sm font-semibold text-white">
                          {order.game}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {order.product}
                        </p>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-slate-700/80 pt-5">
                      <div>
                        <p className="text-xs text-slate-500">
                          Total Pembayaran
                        </p>

                        <p className="mt-1 text-xl font-extrabold text-white">
                          {formatPrice(order.price)}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          {formatDate(order.created_at)}
                        </p>
                        {isPending && order.payment_url && order.expires_at && (
                          <div className="mt-3">
                            {isPaymentExpired ? (
                              <p className="text-xs font-semibold text-red-400">
                                Waktu pembayaran habis
                              </p>
                            ) : (
                              <>
                                <p className="text-xs text-amber-400">
                                  Selesaikan pembayaran sebelum:
                                </p>
                                <p className="mt-1 font-mono text-sm font-bold text-amber-300">
                                  {formatCountdown(order.expires_at, now)}
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {canContinuePayment && (
                          <a
                            href={order.payment_url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-amber-400"
                          >
                            Lanjutkan Pembayaran
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:from-violet-500 hover:to-blue-500"
                        >
                          Lihat Detail
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmHideOrder(order)}
                          disabled={deletingOrder === order.order_code}
                          className="rounded-lg border border-red-500/30 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:border-red-500/60 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* CUSTOMER SUPPORT */}
        <section className="mt-10 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#111827] to-[#11152B] p-6 sm:p-7">
          <p className="text-xs font-semibold tracking-wide text-blue-400">
            NEED ASSISTANCE?
          </p>

          <h2 className="mt-2 text-lg font-bold text-white">
            Butuh Bantuan?
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Jika mengalami kendala dengan transaksi, silakan hubungi
            customer support TOPUPKU.
          </p>
        </section>

        {/* BACK HOME */}
        <Link
          href="/"
          className="mt-8 block text-center text-sm font-medium text-slate-400 transition hover:text-violet-400"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-8 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-title"
            className="my-auto w-full max-w-lg rounded-2xl border border-slate-700 bg-[#111827] p-5 shadow-2xl shadow-violet-950/30 sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-widest text-violet-400">
                  TRANSACTION DETAIL
                </p>

                <h2
                  id="order-detail-title"
                  className="mt-2 text-xl font-bold text-white"
                >
                  Detail Pesanan
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                aria-label="Tutup detail"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:border-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mb-5 rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
              <p className="text-xs text-slate-500">Nomor Pesanan</p>
              <p className="mt-1 break-all font-bold text-violet-300">
                {selectedOrder.order_code}
              </p>

              <div className="mt-3">
                <span
                  className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusInfo(selectedOrder.status).className}`}
                >
                  {getStatusInfo(selectedOrder.status).label}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              {[
                ["Nama Pemesan", selectedOrder.customer_name],
                ["Game", selectedOrder.game],
                ["User ID", selectedOrder.user_id],
                ["Zone ID", selectedOrder.zone_id || "-"],
                ["Produk", selectedOrder.product],
                ["Metode Pembayaran", selectedOrder.payment_method || "Belum tersedia"],
                ["Tanggal Pesanan", formatDate(selectedOrder.created_at)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4"
                >
                  <span className="text-slate-400">{label}</span>
                  <span className="max-w-[65%] break-words text-right font-medium text-slate-200">
                    {value}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between gap-4 border-t border-slate-700 pt-4">
                <span className="font-semibold text-slate-300">
                  Total Pembayaran
                </span>
                <span className="text-lg font-extrabold text-violet-400">
                  {formatPrice(selectedOrder.price)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-7 w-full rounded-xl border border-slate-700 bg-[#080B18] py-3 text-sm font-semibold text-slate-300 transition hover:border-violet-500/50 hover:text-white"
            >
              Tutup Detail
            </button>
          </div>
        </div>
      )}

      {confirmHideOrder && (
        <div className="fixed inset-0 z-[110] flex min-h-screen items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-red-500/20 bg-[#101426]/95 p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
                ⚠️
              </div>

              <h2 className="text-xl font-bold text-white">
                Hapus dari Riwayat?
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Yakin ingin menghapus pesanan ini dari riwayat akun kamu?
              </p>

              <p className="mt-3 break-all rounded-lg bg-slate-800/70 p-3 text-xs font-semibold text-violet-300">
                {confirmHideOrder.order_code}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Data transaksi tetap tersimpan di sistem TOPUPKU.
                Tindakan ini tidak membatalkan pembayaran.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmHideOrder(null)}
                disabled={deletingOrder === confirmHideOrder.order_code}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => void handleHideOrder(confirmHideOrder)}
                disabled={deletingOrder === confirmHideOrder.order_code}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingOrder === confirmHideOrder.order_code ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Memproses...
                  </span>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
