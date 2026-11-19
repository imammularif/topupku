
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type NavbarProps = {
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
};

export default function Navbar({
  searchOpen,
  setSearchOpen,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="shrink-0 text-2xl font-extrabold tracking-tight text-cyan-400"
        >
          TopUpKu<span className="text-white">.</span>
        </button>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
          <Link href="/" className="transition hover:text-cyan-400">
            Beranda
          </Link>

          <a href="#games" className="transition hover:text-cyan-400">
            Daftar Game
          </a>

          <Link
            href="/orders"
            className="transition hover:text-cyan-400"
          >
            Riwayat Pesanan
          </Link>

          <a href="#bantuan" className="transition hover:text-cyan-400">
            Bantuan
          </a>
        </div>

        {/* SEARCH AND ORDER BUTTONS */}
        <div className="flex items-center gap-3">
          {searchOpen && (
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);

                document.getElementById("games")?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
              placeholder="Cari game..."
              className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-cyan-400 sm:w-44"
            />
          )}

          <button
            type="button"
            onClick={() => {
              setSearchOpen(!searchOpen);

              if (searchOpen) {
                setSearchQuery("");
              }
            }}
            className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            {searchOpen ? "Tutup" : "Cari Game"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/orders")}
            className="hidden rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 sm:block"
          >
            Cek Pesanan
          </button>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      <div className="flex gap-6 overflow-x-auto border-t border-slate-800 px-5 py-3 text-xs font-medium text-slate-400 md:hidden">
        <Link
          href="/"
          className="whitespace-nowrap hover:text-cyan-400"
        >
          Beranda
        </Link>

        <a
          href="#games"
          className="whitespace-nowrap hover:text-cyan-400"
        >
          Daftar Game
        </a>

        <Link
          href="/orders"
          className="whitespace-nowrap hover:text-cyan-400"
        >
          Riwayat Pesanan
        </Link>

        <a
          href="#bantuan"
          className="whitespace-nowrap hover:text-cyan-400"
        >
          Bantuan
        </a>
      </div>
    </nav>
  );
}
