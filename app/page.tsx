
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { games, products, categories } from "../data/games";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import GameSection from "../components/GameSection";
import OrderModal from "../components/OrderModal";

export default function Home() {
  const router = useRouter();

  // ORDER STATE
  const [selectedGame, setSelectedGame] = useState("");
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  // GAME SEARCH & FILTER STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  // FILTER GAME
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesCategory =
        activeCategory === "Semua" ||
        game.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  // OPEN ORDER MODAL
  function handleSelectGame(gameName: string) {
    setSelectedGame(gameName);
  }

  // CLOSE ORDER MODAL
  function closeModal() {
    setSelectedGame("");
    setUserId("");
    setZoneId("");
    setSelectedProduct("");
  }

  // CHECKOUT
  function handleCheckout() {
    if (!userId.trim() || !zoneId.trim() || !selectedProduct) {
      alert("Lengkapi User ID, Zone ID, dan nominal top up!");
      return;
    }

    const product = products.find(
      (item) => item.amount === selectedProduct
    );

    if (!product) {
      alert("Produk tidak ditemukan.");
      return;
    }

    const params = new URLSearchParams({
      game: selectedGame,
      userId: userId.trim(),
      zoneId: zoneId.trim(),
      product: product.amount,
      price: String(product.price),
    });

    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#080B18] text-slate-100">
      <Navbar />

      <HeroSection />

      <GameSection
        filteredGames={filteredGames}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        onSelectGame={handleSelectGame}
      />

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden border-t border-violet-500/20 bg-[#0B1020] px-4 py-16 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-blue-600/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-violet-400">
              Cara Pemesanan
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Top Up dalam 3 Langkah
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-400">
              Ikuti langkah sederhana berikut untuk membuat pesanan
              melalui TopUpKu.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Pilih Game",
                description:
                  "Cari dan pilih game yang ingin kamu top up.",
              },
              {
                number: "02",
                title: "Isi Data dan Nominal",
                description:
                  "Masukkan User ID, Zone ID, dan pilih produk.",
              },
              {
                number: "03",
                title: "Lanjutkan Pembayaran",
                description:
                  "Periksa detail pesanan dan lanjutkan checkout.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="group rounded-xl border border-slate-700/80 bg-[#111827] p-6 transition-all duration-300 hover:border-violet-500/60 hover:shadow-[0_0_18px_rgba(139,92,246,0.12)]"
              >
                <span className="text-2xl font-bold text-violet-400 transition-colors group-hover:text-blue-400">
                  {step.number}
                </span>

                <h3 className="mt-4 text-base font-semibold text-white">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELP & CUSTOMER SUPPORT */}
      <section
        id="bantuan"
        className="scroll-mt-24 bg-[#080B18] px-4 py-14 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-2">

          {/* CUSTOMER SUPPORT */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#19112F] to-[#111827] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-600/15 blur-[80px]" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
                  <path d="M5 14h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3v-6H5Z" />
                  <path d="M19 14h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-3v-6h2Z" />
                  <path d="M17 20c-.5 1-1.5 1.5-3 1.5" />
                </svg>
              </div>

              <p className="mt-5 text-sm font-semibold text-violet-400">
                CUSTOMER SUPPORT
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Butuh Bantuan?
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                Mengalami kendala saat melakukan top up? Jangan khawatir.
                Tim Customer Support TopUpKu siap membantu memberikan
                solusi untuk kebutuhanmu.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                Customer Support
                <span className="text-xs font-normal text-slate-500">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>

          {/* ORDER CHECK */}
          <div className="relative overflow-hidden rounded-2xl border border-blue-500/25 bg-gradient-to-br from-[#101D35] to-[#111827] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-600/15 blur-[80px]" />

            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 6h13" />
                  <path d="M8 12h13" />
                  <path d="M8 18h13" />
                  <path d="M3 6h.01" />
                  <path d="M3 12h.01" />
                  <path d="M3 18h.01" />
                </svg>
              </div>

              <p className="mt-5 text-sm font-semibold text-blue-400">
                ORDER TRACKING
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                Cek Pesananmu
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                Ingin mengetahui status transaksi? Kamu bisa memeriksa
                informasi pesanan melalui halaman pengecekan pesanan TopUpKu.
              </p>

              <Link
                href="/orders"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 hover:shadow-[0_0_18px_rgba(59,130,246,0.35)]"
              >
                Cek Pesanan
                <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* FOOTER */}
      <footer className="border-t border-violet-500/20 bg-[#050814] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-white"
            >
              TopUpKu<span className="text-violet-400">.</span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Platform pemesanan top up game dengan pengalaman
              yang praktis dan mudah.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">
              Navigasi
            </h3>

            <div className="mt-3 flex flex-col gap-3 text-sm text-slate-400">
              <Link
                href="/"
                className="transition-colors hover:text-violet-400"
              >
                Beranda
              </Link>

              <Link
                href="/#games"
                className="transition-colors hover:text-violet-400"
              >
                Daftar Game
              </Link>

              <Link
                href="/orders"
                className="transition-colors hover:text-violet-400"
              >
                Pesanan Saya
              </Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          © 2026 TopUpKu. All Rights Reserved.
        </div>
      </footer>

      {/* ORDER MODAL */}
      <OrderModal
        selectedGame={selectedGame}
        userId={userId}
        setUserId={setUserId}
        zoneId={zoneId}
        setZoneId={setZoneId}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onClose={closeModal}
        onCheckout={handleCheckout}
      />
    </main>
  );
}
