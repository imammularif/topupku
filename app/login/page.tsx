
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

  // FORGOT PASSWORD STATE
  const [showForgotPopup, setShowForgotPopup] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<"email" | "whatsapp" | null>(null);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");

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


  async function handleGoogleLogin() {
    setLoading(true);
    setErrorMessage("");

    try {
      const supabase = createClient();

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");

      const safeNext =
        next && next.startsWith("/") && !next.startsWith("//")
          ? next
          : "/";

      const redirectTo =
        `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch {
      setErrorMessage("Gagal menghubungkan akun Google. Silakan coba kembali.");
      setLoading(false);
    }
  }


  function openForgotPopup() {
    setRecoveryEmail(email);
    setRecoveryMethod(null);
    setResetMessage("");
    setResetError("");
    setShowForgotPopup(true);
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!recoveryEmail.trim()) {
      setResetError("Masukkan alamat email terlebih dahulu.");
      return;
    }

    setResetLoading(true);
    setResetMessage("");
    setResetError("");

    try {
      const supabase = createClient();

      const redirectTo =
        `${window.location.origin}/auth/callback?next=${encodeURIComponent("/reset-password")}`;

      const { error } = await supabase.auth.resetPasswordForEmail(
        recoveryEmail.trim(),
        { redirectTo }
      );

      if (error) {
        console.error("Supabase reset request error:", error);
        setResetError(error.message);
        return;
      }

      setResetMessage(
        "Jika email terdaftar, instruksi reset password akan dikirim ke email tersebut. Silakan periksa inbox atau folder spam."
      );
    } catch {
      setResetError("Terjadi kesalahan. Silakan coba kembali.");
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080B18] px-4 py-12 text-white">

      {/* BACKGROUND GLOW */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />

      <div className="relative w-full max-w-md">

        {/* BACK TO HOME */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-violet-400"
        >
          ← Kembali ke Beranda
        </Link>

        {/* LOGIN CARD */}
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

          {/* LOGIN FORM */}
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
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300"
                >
                  Password
                </label>

                <button
                  type="button"
                  onClick={openForgotPopup}
                  className="text-xs font-semibold text-violet-400 transition hover:text-violet-300"
                >
                  Lupa Password?
                </button>
              </div>

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

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">ATAU LOGIN DENGAN</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          {/* SOCIAL LOGIN - TEMPORARILY DISABLED */}
          <div className="grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm font-semibold text-white transition hover:border-violet-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="font-bold text-lg">G</span>
            {loading ? "Menghubungkan..." : "Google"}
          </button>


            <button
              type="button"
              disabled
              className="flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-3 text-sm font-semibold text-slate-500 opacity-70"
            >
              <span className="font-bold">●</span>
              Apple ID
            </button>
          </div>

          <p className="mt-3 text-center text-[11px] text-slate-500">
            Login dengan Google atau Apple ID.
          </p>

          {/* REGISTER */}
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

      {/* FORGOT PASSWORD POPUP */}
      {showForgotPopup && (
        <div className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center bg-black/75 px-4 py-6 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-violet-500/20 bg-[#101426]/95 p-6 shadow-2xl shadow-black/50">

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-2xl">
                🔐
              </div>

              <h2 className="text-xl font-bold text-white">
                Lupa Password?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Pilih metode pemulihan akun TOPUPKU.
              </p>
            </div>

            {!recoveryMethod && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setRecoveryMethod("email")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-left transition hover:border-violet-500/50 hover:bg-violet-500/5"
                >
                  <span className="text-xl">✉️</span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Melalui Email
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      Terima tautan reset password melalui email.
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setRecoveryMethod("whatsapp")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-left transition hover:border-green-500/50 hover:bg-green-500/5"
                >
                  <span className="text-xl">💬</span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      Melalui WhatsApp
                    </span>
                    <span className="mt-1 block text-xs text-slate-400">
                      Pemulihan menggunakan nomor WhatsApp.
                    </span>
                  </span>
                </button>
              </div>
            )}

            {recoveryMethod === "email" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label
                    htmlFor="recoveryEmail"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Alamat Email
                  </label>

                  <input
                    id="recoveryEmail"
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>

                {resetMessage && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs leading-relaxed text-green-300">
                    {resetMessage}
                  </div>
                )}

                {resetError && (
                  <div role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                    {resetError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60"
                >
                  {resetLoading ? "Mengirim..." : "Kirim Tautan Reset"}
                </button>
              </form>
            )}

            {recoveryMethod === "whatsapp" && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                <p className="text-sm font-semibold text-amber-300">
                  WhatsApp Belum Tersedia
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Fitur pemulihan melalui WhatsApp sedang dipersiapkan. Untuk sementara, silakan gunakan metode Email.
                </p>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              {recoveryMethod && (
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryMethod(null);
                    setResetMessage("");
                    setResetError("");
                  }}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700"
                >
                  Kembali
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowForgotPopup(false)}
                className="flex-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
