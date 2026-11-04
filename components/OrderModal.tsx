
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
        className="my-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-7 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              TopUpKu
            </p>

            <h3 className="mt-2 text-xl font-bold tracking-tight">
              Pesan {selectedGame}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Lengkapi informasi akun dan pilih nominal top up.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-cyan-400 hover:text-white"
          >
            Tutup
          </button>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-300">
          User ID
        </label>

        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Masukkan User ID"
          className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 p-3.5 text-sm outline-none transition focus:border-cyan-400"
        />

        <label className="mb-2 block text-sm font-semibold text-slate-300">
          Zone ID / Server ID
        </label>

        <input
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          placeholder="Masukkan Zone ID"
          className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 p-3.5 text-sm outline-none transition focus:border-cyan-400"
        />

        <h4 className="mb-4 text-sm font-bold">
          Pilih Nominal
        </h4>

        <div className="grid grid-cols-2 gap-3">
          {products.map((product) => (
            <button
              key={product.amount}
              onClick={() => setSelectedProduct(product.amount)}
              className={`rounded-xl border p-4 text-left transition ${
                selectedProduct === product.amount
                  ? "border-cyan-400 bg-cyan-400/10"
                  : "border-slate-700 bg-slate-950 hover:border-slate-500"
              }`}
            >
              <p className="text-sm font-bold">
                {product.amount}
              </p>

              <p className="mt-2 text-sm font-semibold text-cyan-400">
                Rp{product.price.toLocaleString("id-ID")}
              </p>
            </button>
          ))}
        </div>

        <button
          onClick={onCheckout}
          className="mt-7 w-full rounded-lg bg-cyan-500 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
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
