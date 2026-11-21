
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AuthMenu() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    setLoggingOut(false);

    if (error) {
      alert("Logout gagal. Silakan coba kembali.");
      return;
    }

    setShowLogoutConfirm(false);
    setIsOpen(false);
    router.replace("/");
    router.refresh();
  }

  if (isLoading) {
    return (
      <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-800" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-lg border border-violet-500/50 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
        >
          Daftar
        </Link>
      </div>
    );
  }

  const fullName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Pengguna";

  const avatarStyle = user.user_metadata?.avatar_style || "default";
  const avatarUrl = user.user_metadata?.avatar_url;

  const avatarEmoji =
    avatarStyle === "male"
      ? "👨🏻‍💻"
      : avatarStyle === "female"
        ? "👩🏻‍💻"
        : "👤";

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Menu akun"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-[#101426] px-3 py-2 transition hover:border-violet-500/60"
        >
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-violet-500/40 bg-violet-500/15 text-xl">
            {typeof avatarUrl === "string" && avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Foto profil"
                className="h-full w-full object-cover"
              />
            ) : (
              avatarEmoji
            )}
          </span>

          <span className="hidden max-w-28 text-left sm:block">
            <span className="block truncate text-sm font-semibold text-white">
              {fullName}
            </span>
            <span className="block text-xs text-slate-400">
              Akun Saya
            </span>
          </span>

          <span
            className={`text-xs text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ▼
          </span>
        </button>

        <div
          className={`absolute right-0 z-50 mt-3 w-60 origin-top-right overflow-hidden rounded-xl border border-slate-700 bg-[#101426] shadow-2xl shadow-black/40 transition-all duration-300 ease-out ${
            isOpen
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible -translate-y-3 scale-95 opacity-0"
          }`}
        >
          <div className="border-b border-slate-800 p-4">
            <p className="truncate text-sm font-semibold text-white">
              {fullName}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user.email}
            </p>
          </div>

          <div className="p-2">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-violet-500/10 hover:text-violet-300"
            >
              <span>👤</span>
              Profil Saya
            </Link>

            <Link
              href="/profile/edit"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 transition hover:bg-violet-500/10 hover:text-violet-300"
            >
              <span>✏️</span>
              Edit Profil
            </Link>

            <div className="my-2 border-t border-slate-800" />

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setShowLogoutConfirm(true);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-red-400 transition hover:bg-red-500/10"
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-[fadeIn_0.2s_ease-out] rounded-2xl border border-slate-700 bg-[#101426] p-6 shadow-2xl shadow-black/50">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
                <span>↪</span>
              </div>

              <h2 className="text-xl font-bold text-white">
                Yakin ingin logout?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Anda akan keluar dari akun TOPUPKU. Anda dapat login kembali kapan saja.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                disabled={loggingOut}
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loggingOut ? "Memproses..." : "Ya, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
