
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { games, products, categories } from "../data/games";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import GameSection from "../components/GameSection";
import OrderModal from "../components/OrderModal";


export default function Home() {
  const router = useRouter();

  const [selectedGame, setSelectedGame] = useState("");
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

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

  function closeModal() {
    setSelectedGame("");
    setUserId("");
    setZoneId("");
    setSelectedProduct("");
  }

  function handleCheckout() {
    if (!userId.trim() || !zoneId.trim() || !selectedProduct) {
      alert("Lengkapi User ID, Zone ID, dan nominal top up!");
      return;
    }

    const product = products.find(
      (item) => item.amount === selectedProduct
    );

    if (!product) return;

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
    <main className="min-h-screen bg-slate-950 text-white">

      <Navbar
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <HeroSection />

      <GameSection
        filteredGames={filteredGames}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={categories}
        onSelectGame={setSelectedGame}
      />


      {/* HOW IT WORKS */}
      <section className="border-y border-slate-800 bg-slate-900/50 px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Mudah dan Praktis
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Cara Top Up
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-400">
              Ikuti tiga langkah sederhana untuk membuat pesanan
              melalui TopUpKu.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Pilih Game",
                description:
                  "Pilih game favorit yang ingin kamu top up.",
              },
              {
                number: "02",
                title: "Isi Data dan Nominal",
                description:
                  "Masukkan User ID, Zone ID, dan pilih produk.",
              },
              {
                number: "03",
                title: "Buat Pesanan",
                description:
                  "Periksa detail pesanan dan lanjutkan checkout.",
              },
            ].map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-7 transition hover:border-cyan-400/50"
              >
                <span className="text-4xl font-extrabold tracking-tight text-cyan-400">
                  {step.number}
                </span>

                <h3 className="mt-7 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELP */}
      <section
        id="bantuan"
        className="mx-auto max-w-7xl px-5 py-20"
      >
        <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-cyan-950/30 p-8 md:flex md:items-center md:justify-between md:p-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Pusat Bantuan
            </p>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Butuh Bantuan?
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
              Periksa status transaksi dan riwayat pesanan
              melalui halaman pesanan TopUpKu.
            </p>
          </div>

          <button
            onClick={() => router.push("/orders")}
            className="mt-7 rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 md:mt-0"
          >
            Cek Riwayat Pesanan
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 px-5 py-12">
        <div className="mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 md:grid-cols-3">

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-cyan-400">
              TopUpKu.
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-500">
              Platform pemesanan top up game dengan pengalaman
              yang praktis dan mudah.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide">
              Navigasi
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
              <a href="/" className="transition hover:text-cyan-400">
                Beranda
              </a>

              <a href="#games" className="transition hover:text-cyan-400">
                Daftar Game
              </a>

              <a href="/orders" className="transition hover:text-cyan-400">
                Riwayat Pesanan
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold tracking-wide">
              Informasi
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
              <a href="#bantuan" className="transition hover:text-cyan-400">
                Bantuan
              </a>

              <a href="#bantuan" className="transition hover:text-cyan-400">
                Cara Top Up
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-7xl border-t border-slate-800 pt-7 text-center text-xs text-slate-500">
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
