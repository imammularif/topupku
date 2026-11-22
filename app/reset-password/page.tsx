
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleResetPassword(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 8) {
      setErrorMessage("Password minimal harus 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi password tidak sesuai.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

        if (error) {
        console.error("Supabase password reset error:", error);
        setErrorMessage(error.message);
        return;
        }

      setSuccessMessage(
        "Password berhasil diperbarui. Silakan login menggunakan password baru."
      );

      setPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B18] px-4 py-12 text-white">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative w-full max-w-md">

        <div className="rounded-2xl border border-slate-800 bg-[#101426]/90 p-7 shadow-2xl shadow-purple-950/20 sm:p-9">

          <div className="mb-8 text-center">
            <Link href="/" className="text-3xl font-black tracking-tight">
              TOPUP<span className="text-violet-500">KU</span>
            </Link>

            <div className="mx-auto mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-2xl">
              🔐
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Buat Password Baru
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Masukkan password baru untuk akun TOPUPKU kamu.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password Baru
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Konfirmasi Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                minLength={8}
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

            {successMessage && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm leading-relaxed text-green-300">
                {successMessage}
              </div>
            )}

            {successMessage ? (
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white transition hover:brightness-110"
              >
                Kembali ke Login
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Simpan Password Baru"}
              </button>
            )}
          </form>

          <div className="mt-7 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-violet-400 transition hover:text-violet-300"
            >
              Kembali ke Login
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
