
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AvatarStyle = "default" | "male" | "female";

export default function EditProfilePage() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarStyle, setAvatarStyle] =
    useState<AvatarStyle>("default");

  // Avatar TOPUPKU dan avatar Google disimpan terpisah.
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [googleAvatarUrl, setGoogleAvatarUrl] =
    useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarError, setAvatarError] = useState(false);

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
        setErrorMessage("Gagal mengambil data profil.");
        setLoading(false);
        return;
      }

      setFullName(
        data?.full_name ||
          user.user_metadata?.full_name ||
          ""
      );

      setPhone(data?.phone || "");

      setAvatarStyle(
        (data?.avatar_style as AvatarStyle) || "default"
      );

      setAvatarUrl(data?.avatar_url || null);

      setGoogleAvatarUrl(
        user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null
      );

      setLoading(false);
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [router, supabase]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setErrorMessage("");
    setAvatarError(false);

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Gunakan foto JPG, PNG, atau WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran foto maksimal 2 MB.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  }

  async function handleSave(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/login");
        return;
      }

      const user = authData.user;

      // Hanya gunakan avatar TOPUPKU yang sudah tersimpan.
      // Avatar Google tidak pernah disalin ke profiles.avatar_url.
      let finalAvatarUrl = avatarUrl;

      if (selectedFile) {
        const extension =
          selectedFile.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath =
          `${user.id}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: selectedFile.type,
          });

        if (uploadError) {
          throw new Error("Gagal mengunggah foto profil.");
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        finalAvatarUrl = publicUrlData.publicUrl;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            full_name: fullName.trim(),
            phone: phone.trim() || null,
            avatar_style: avatarStyle,
            avatar_url: finalAvatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) {
        throw new Error("Gagal menyimpan perubahan profil.");
      }

      setAvatarUrl(finalAvatarUrl);
      setSelectedFile(null);
      setAvatarError(false);
      setMessage("Profil berhasil diperbarui.");

      // Memberi tahu Navbar bahwa data profil telah diperbarui.
      window.dispatchEvent(
        new Event("topupku:profile-updated")
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan. Silakan coba kembali."
      );
    } finally {
      setSaving(false);
    }
  }

  const avatarOptions: {
    value: AvatarStyle;
    label: string;
    emoji: string;
  }[] = [
    { value: "male", label: "Cowok", emoji: "👨🏻‍💻" },
    { value: "female", label: "Cewek", emoji: "👩🏻‍💻" },
    { value: "default", label: "Netral", emoji: "👤" },
  ];

  const selectedAvatar = avatarOptions.find(
    (item) => item.value === avatarStyle
  );

  const displayedAvatar =
    previewUrl || avatarUrl || googleAvatarUrl;

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

  return (
    <main className="min-h-screen bg-[#080B18] px-4 py-12 text-white">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/profile"
          className="text-sm text-violet-400 transition hover:text-violet-300"
        >
          ← Kembali ke Profil
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#101426] p-6 shadow-xl shadow-black/20 sm:p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Edit Profil
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Perbarui informasi dan foto profil akun TOPUPKU kamu.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <h2 className="mb-4 text-sm font-semibold text-slate-200">
                Foto Profil TOPUPKU
              </h2>

              <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-800 bg-[#080B18] p-6">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-violet-500/40 bg-violet-500/15 text-5xl">
                  {displayedAvatar && !avatarError ? (
                    <img
                      src={displayedAvatar}
                      alt="Preview foto profil TOPUPKU"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    selectedAvatar?.emoji || "👤"
                  )}
                </div>

                <label className="cursor-pointer rounded-lg border border-violet-500/50 px-5 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10">
                  Pilih Foto
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <p className="text-center text-xs text-slate-500">
                  JPG, PNG, atau WebP · Maksimal 2 MB
                </p>

                {selectedFile && (
                  <p className="text-xs text-emerald-400">
                    Foto baru siap disimpan.
                  </p>
                )}

                <p className="text-center text-xs text-slate-500">
                  Foto ini hanya mengubah avatar TOPUPKU, bukan foto Google kamu.
                </p>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold text-slate-200">
                Pilihan Avatar Default
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {avatarOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setAvatarStyle(option.value);
                      setAvatarError(false);
                    }}
                    className={`rounded-xl border p-4 text-center transition ${
                      avatarStyle === option.value
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-slate-700 bg-[#080B18] hover:border-violet-500/50"
                    }`}
                  >
                    <span className="block text-3xl">
                      {option.emoji}
                    </span>
                    <span className="mt-2 block text-xs font-semibold text-slate-300">
                      {option.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-semibold"
              >
                Nama Lengkap
              </label>
              <input
                id="fullName"
                type="text"
                required
                maxLength={100}
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-semibold"
              >
                Nomor Telepon
              </label>
              <input
                id="phone"
                type="tel"
                maxLength={20}
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="Contoh: 08xxxxxxxxxx"
                className="w-full rounded-lg border border-slate-700 bg-[#080B18] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500"
              />
            </div>

            {message && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                {message}
              </p>
            )}

            {errorMessage && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <Link
                href="/profile"
                className="flex-1 rounded-lg border border-slate-700 px-5 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Menyimpan...
                  </span>
                ) : (
                  "Simpan Perubahan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
