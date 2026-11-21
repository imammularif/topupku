
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-violet-500/20 bg-[#080B18]">
      <div className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-purple-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-blue-600/15 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-xs font-semibold tracking-wide text-violet-300">
            DISCOVER YOUR ADVENTURE
          </span>

          <h1 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
            Top Up Game Favoritmu
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              dengan Mudah dan Cepat.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Temukan game favoritmu, pilih produk yang kamu
            inginkan, dan nikmati pengalaman pemesanan top up
            yang praktis bersama TopUpKu.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="#games"
              className="inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)]"
            >
              Jelajahi Game →
            </Link>

            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 px-6 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-blue-500/50 hover:text-blue-300"
            >
              Cek Pesanan
            </Link>
          </div>

          <div className="mt-10 h-[2px] w-48 rounded-full bg-gradient-to-r from-violet-500 via-purple-400 to-blue-500 shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
        </div>
      </div>
    </section>
  );
}
