
"use client";

import { useRouter } from "next/navigation";
import { games } from "../data/games";

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden border-b border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-slate-950 to-purple-950/30" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">
        <div className="max-w-xl">
          <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Top Up Game Favoritmu
          </p>

          <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            Main Game,
            <span className="mt-2 block text-cyan-400">
              Makin Seru!
            </span>
          </h1>

          <p className="mt-7 max-w-lg text-base leading-8 text-slate-400 md:text-lg">
            Temukan kebutuhan game favoritmu di TopUpKu.
            Pilih game, tentukan nominal, dan buat pesanan
            dengan mudah melalui satu platform.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#games"
              className="rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Mulai Top Up
            </a>

            <button
              onClick={() => router.push("/orders")}
              className="rounded-xl border border-slate-700 px-7 py-3.5 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-400"
            >
              Cek Pesanan
            </button>
          </div>

          <div className="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-slate-800 pt-7">
            <div>
              <p className="text-2xl font-extrabold text-cyan-400">6+</p>
              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                Pilihan Game
              </p>
            </div>

            <div>
              <p className="text-2xl font-extrabold text-cyan-400">
                Mudah
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                Proses Pemesanan
              </p>
            </div>

            <div>
              <p className="text-2xl font-extrabold text-cyan-400">
                24/7
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                Akses Website
              </p>
            </div>
          </div>
        </div>

        {/* HERO GAME IMAGES */}
        <div className="relative hidden md:block">
          <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl" />

          <div className="relative grid grid-cols-2 gap-4">
            {games.slice(0, 4).map((game) => (
              <div
                key={game.name}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                  <span className="absolute bottom-4 left-4 text-sm font-bold tracking-wide">
                    {game.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
