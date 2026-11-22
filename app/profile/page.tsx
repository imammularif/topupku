
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  phone: string | null;
  avatar_style: "default" | "male" | "female";
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fallbackName, setFallbackName] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }

      const user = authData.user;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");
      setFallbackName(
        user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Pengguna"
      );

      setProfile(data as Profile | null);
      setLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-slate-300">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-violet-500" />
          <p className="mt-5 text-sm text-slate-400">
            Memuat profil...
          </p>
        </div>
      </main>
    );
  }

  const fullName = profile?.full_name || fallbackName;
  const avatarStyle = profile?.avatar_style || "default";

  const avatarEmoji =
    avatarStyle === "male"
      ? "👨🏻‍💻"
      : avatarStyle === "female"
        ? "👩🏻‍💻"
        : "👤";

  const joinDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <main className="min-h-screen bg-[#080B18] px-4 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-sm text-violet-400 transition hover:text-violet-300"
        >
          ← Kembali ke Beranda
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-extrabold">
            Profil Saya
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Informasi akun TOPUPKU kamu.
          </p>
        </div>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-[#101426]">
          <div className="h-32 bg-gradient-to-r from-violet-900/70 via-violet-700/30 to-blue-900/70" />

          <div className="px-6 pb-7">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#101426] bg-violet-500/15 text-5xl">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Foto profil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarEmoji
                  )}
                </div>

                <div className="min-w-0 pb-2">
                  <h2 className="truncate text-xl font-bold text-white">
                    {fullName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Pengguna TOPUPKU
                  </p>
                </div>
              </div>

              <Link
                href="/profile/edit"
                className="rounded-lg bg-violet-600 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-violet-500"
              >
                ✏️ Edit Profil
              </Link>
            </div>

            <div className="mt-9">
              <h3 className="text-base font-bold">
                Informasi Akun
              </h3>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#080B18] p-4">
                  <p className="text-xs text-slate-500">
                    Nama Lengkap
                  </p>
                  <p className="mt-2 break-words text-sm font-semibold text-slate-200">
                    {fullName}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#080B18] p-4">
                  <p className="text-xs text-slate-500">
                    Email
                  </p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-200">
                    {email || "-"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#080B18] p-4">
                  <p className="text-xs text-slate-500">
                    Nomor Telepon
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    {profile?.phone || "Belum diisi"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#080B18] p-4">
                  <p className="text-xs text-slate-500">
                    Tanggal Bergabung
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">
                    {joinDate}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="text-base font-bold">
                Aktivitas Akun
              </h3>

              <Link
                href="/orders"
                className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-[#080B18] p-4 transition hover:border-violet-500/50 hover:bg-violet-500/5"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    Riwayat Pesanan
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Lihat transaksi TOPUPKU kamu.
                  </p>
                </div>
                <span className="text-xl text-violet-400">
                  →
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
