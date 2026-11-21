
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");

      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/";

      router.replace(safeNext);
      router.refresh();
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B18] px-4 py-12 text-white">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-400"
        >
          ← Kembali ke Beranda
        </Link>

        <div className="rounded-2xl border border-slate-800 bg-[#101426]/90 p-7 shadow-2xl shadow-purple-950/20 sm:p-9">
          <div className="mb-8 text-center">
            <Link href="/" className="text-3xl font-black tracking-tight">
              TOPUP<span className="text-violet-500">KU</span>
            </Link>

            <h1 className="mt-6 text-2xl font-bold">
              Selamat Datang Kembali
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Login untuk melanjutkan ke akun TOPUPKU.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <div className="mt-7 text-center text-sm text-slate-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-400 transition hover:text-violet-300"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-slate-500">
          © 2026 TopUpKu. All Rights Reserved.
        </p>
      </div>
    </main>
  );
}
