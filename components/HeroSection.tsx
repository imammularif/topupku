
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-violet-500/20 bg-[#080B18]">
      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-3xl">

          {/* BADGE */}
          <span className="neon-orbit inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-violet-300">
            DISCOVER YOUR ADVENTURE
          </span>

          {/* HEADLINE */}
          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Top Up Game Favoritmu
            <br />
            <span className="neon-text">
              dengan Mudah dan Cepat.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Temukan game favoritmu, pilih produk yang kamu
            inginkan, dan nikmati pengalaman pemesanan top up
            yang praktis bersama TopUpKu.
          </p>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex flex-wrap gap-3">

            <Link
              href="#games"
              className="neon-orbit inline-flex rounded-lg border border-violet-400/40 bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
            >
              Jelajahi Game →
            </Link>

            <Link
              href="/orders"
              className="neon-orbit inline-flex rounded-lg border border-blue-400/40 bg-slate-900/90 px-6 py-3 text-sm font-semibold text-slate-200 transition-all hover:text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]"
            >
              Cek Pesanan
            </Link>

          </div>

          {/* NEON DIVIDER */}
          <div className="neon-divider mt-10 w-48 rounded-full" />

        </div>
      </div>
    </section>
  );
}
