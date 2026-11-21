
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B18] px-4 py-12 text-white">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative w-full max-w-md">

        {/* BACK HOME */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-400"
        >
          ← Kembali ke Beranda
        </Link>

        {/* LOGIN CARD */}
        <div className="rounded-2xl border border-violet-500/25 bg-[#111827]/95 p-7 shadow-[0_0_40px_rgba(124,58,237,0.10)] sm:p-9">

          {/* BRAND */}
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="text-3xl font-extrabold tracking-tight text-white"
            >
              TopUpKu<span className="text-violet-400">.</span>
            </Link>

            <div className="mx-auto mt-4 h-[2px] w-20 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />

            <h1 className="mt-7 text-2xl font-bold">
              Selamat Datang!
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Masuk ke akun TopUpKu untuk melanjutkan.
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-5">

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-200"
                >
                  Password
                </label>

                <span className="text-xs text-slate-500">
                  Lupa password?
                </span>
              </div>

              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white opacity-60"
            >
              Masuk
            </button>

          </form>

          {/* PROTOTYPE NOTICE */}
          <div className="mt-6 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-center">
            <p className="text-xs leading-5 text-blue-300">
              Halaman Login masih dalam tahap pengembangan.
              Fitur autentikasi segera hadir.
            </p>
          </div>

        </div>

        {/* FOOTER */}
        <p className="mt-7 text-center text-xs text-slate-500">
          © 2026 TopUpKu. All Rights Reserved.
        </p>

      </div>
    </main>
  );
}
