
"use client";

import { products } from "../data/games";

type OrderModalProps = {
  selectedGame: string;
  userId: string;
  setUserId: (value: string) => void;
  zoneId: string;
  setZoneId: (value: string) => void;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  onClose: () => void;
  onCheckout: () => void;
};

export default function OrderModal({
  selectedGame,
  userId,
  setUserId,
  zoneId,
  setZoneId,
  selectedProduct,
  setSelectedProduct,
  onClose,
  onCheckout,
}: OrderModalProps) {
  if (!selectedGame) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
        className="my-auto w-full max-w-md rounded-2xl border border-violet-500/30 bg-[#111827] p-5 shadow-[0_0_40px_rgba(124,58,237,0.18)] sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-400">
              TOPUPKU
            </p>

            <h2
              id="order-modal-title"
              className="mt-2 text-xl font-bold tracking-tight text-white"
            >
              Pesan {selectedGame}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Masukkan informasi akun dan pilih nominal top up.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-violet-500 hover:text-white"
          >
            Tutup
          </button>
        </div>

        {/* ACCOUNT INPUT */}
        <div className="space-y-5">
          <div>
            <label
              htmlFor="userId"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              User ID
            </label>

            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Masukkan User ID"
              className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="zoneId"
              className="mb-2 block text-sm font-semibold text-slate-200"
            >
              Zone ID / Server ID
            </label>

            <input
              id="zoneId"
              type="text"
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              placeholder="Masukkan Zone ID"
              className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
        </div>

        {/* PRODUCT SELECTION */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white">
              Pilih Nominal
            </h3>

            <span className="text-xs text-slate-400">
              {products.length} pilihan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => {
              const isSelected =
                selectedProduct === product.amount;

              return (
                <button
                  key={product.amount}
                  type="button"
                  onClick={() =>
                    setSelectedProduct(product.amount)
                  }
                  aria-pressed={isSelected}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-violet-500 bg-violet-500/15 shadow-[0_0_14px_rgba(139,92,246,0.2)]"
                      : "border-slate-700 bg-[#080B18] hover:border-blue-500/60"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    {product.amount}
                  </p>

                  <p className="mt-2 text-sm font-bold text-violet-400">
                    Rp{product.price.toLocaleString("id-ID")}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* CHECKOUT BUTTON */}
        <button
          type="button"
          onClick={onCheckout}
          className="mt-7 w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-semibold text-white transition-all hover:from-violet-500 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(124,58,237,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827]"
        >
          Lanjutkan
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Produk dan harga masih dalam tahap simulasi.
        </p>
      </div>
    </div>
  );
}
