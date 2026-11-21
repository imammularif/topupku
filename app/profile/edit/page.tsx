
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

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

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

      setLoading(false);
    }

    loadProfile();

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
      setMessage("Profil berhasil diperbarui.");

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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080B18] text-slate-300">
        Memuat profil...
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

        <div className="mt-6 rounded-2xl border border-slate-800 bg-[#101426] p-6 shadow-xl sm:p-8">
          <h1 className="text-2xl font-bold">
            Edit Profil
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Perbarui informasi dan tampilan akun TOPUPKU kamu.
          </p>

          <form onSubmit={handleSave} className="mt-8 space-y-7">
            <div>
              <label className="mb-3 block text-sm font-semibold">
                Foto Profil
              </label>

              <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-800 bg-[#080B18] p-6">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-violet-500/60 bg-violet-500/10 text-5xl">
                  {previewUrl || avatarUrl ? (
                    <img
                      src={previewUrl || avatarUrl || ""}
                      alt="Preview avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    selectedAvatar?.emoji || "👤"
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-semibold">
                    Pilih Avatar
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Kamu bisa menggantinya kapan saja.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar.value}
                      type="button"
                      onClick={() => {
                        setAvatarStyle(avatar.value);
                        setAvatarUrl(null);
                        setSelectedFile(null);
                      }}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition ${
                        avatarStyle === avatar.value &&
                        !selectedFile &&
                        !avatarUrl
                          ? "border-violet-500 bg-violet-500/15"
                          : "border-slate-700 bg-[#101426] hover:border-violet-500/50"
                      }`}
                    >
                      <span className="text-3xl">
                        {avatar.emoji}
                      </span>
                      <span className="text-xs text-slate-300">
                        {avatar.label}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="cursor-pointer rounded-lg border border-violet-500/50 bg-violet-500/10 px-5 py-3 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20">
                  Upload Foto Sendiri
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
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
