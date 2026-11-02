
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const games = [
  {
    name: "Mobile Legends",
    category: "MOBA",
    image: "/games/mobile-legends.jpg",
  },
  {
    name: "Free Fire",
    category: "Battle Royale",
    image: "/games/free-fire.jpg",
  },
  {
    name: "PUBG Mobile",
    category: "Battle Royale",
    image: "/games/pubg-mobile.jpg",
  },
  {
    name: "Genshin Impact",
    category: "RPG",
    image: "/games/genshin-impact.jpg",
  },
  {
    name: "Valorant",
    category: "FPS",
    image: "/games/valorant.jpg",
  },
  {
    name: "Honor of Kings",
    category: "MOBA",
    image: "/games/honor-of-kings.jpg",
  },
];

const products = [
  { amount: "86 Diamonds", price: 20000 },
  { amount: "172 Diamonds", price: 39000 },
  { amount: "257 Diamonds", price: 58000 },
  { amount: "344 Diamonds", price: 77000 },
];

const categories = ["Semua", "MOBA", "Battle Royale", "RPG", "FPS"];

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

      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5">

          <button
            onClick={() => router.push("/")}
            className="shrink-0 text-2xl font-extrabold tracking-tight text-cyan-400"
          >
            TopUpKu<span className="text-white">.</span>
          </button>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-300 md:flex">
            <a href="/" className="transition hover:text-cyan-400">
              Beranda
            </a>

            <a href="#games" className="transition hover:text-cyan-400">
              Daftar Game
            </a>

            <a href="/orders" className="transition hover:text-cyan-400">
              Riwayat Pesanan
            </a>

            <a href="#bantuan" className="transition hover:text-cyan-400">
              Bantuan
            </a>
          </div>

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
              onClick={() => {
                setSearchOpen(!searchOpen);
                if (searchOpen) setSearchQuery("");
              }}
              className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
            >
              {searchOpen ? "Tutup" : "Cari Game"}
            </button>

            <button
              onClick={() => router.push("/orders")}
              className="hidden rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 sm:block"
            >
              Cek Pesanan
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION */}
        <div className="flex gap-6 overflow-x-auto border-t border-slate-800 px-5 py-3 text-xs font-medium text-slate-400 md:hidden">
          <a href="/" className="whitespace-nowrap hover:text-cyan-400">
            Beranda
          </a>

          <a href="#games" className="whitespace-nowrap hover:text-cyan-400">
            Daftar Game
          </a>

          <a href="/orders" className="whitespace-nowrap hover:text-cyan-400">
            Riwayat Pesanan
          </a>

          <a href="#bantuan" className="whitespace-nowrap hover:text-cyan-400">
            Bantuan
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/50 via-slate-950 to-purple-950/30" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 md:grid-cols-2 md:py-28">

          <div className="max-w-xl">
            <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Top Up Game Favoritmu
            </p>

            <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
              Main Game,
              <span className="mt-2 block text-cyan-400">
                Makin Seru!
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-8 text-slate-400 md:text-lg">
              Temukan kebutuhan game favoritmu di TopUpKu.
              Pilih game, tentukan nominal, dan buat pesanan
              dengan mudah melalui satu platform.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#games"
                className="rounded-xl bg-cyan-500 px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
              >
                Mulai Top Up
              </a>

              <button
                onClick={() => router.push("/orders")}
                className="rounded-xl border border-slate-700 px-7 py-3.5 text-sm font-semibold transition hover:border-cyan-400 hover:text-cyan-400"
              >
                Cek Pesanan
              </button>
            </div>

            <div className="mt-12 grid max-w-md grid-cols-3 gap-5 border-t border-slate-800 pt-7">
              <div>
                <p className="text-2xl font-extrabold text-cyan-400">6+</p>
                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                  Pilihan Game
                </p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-cyan-400">
                  Mudah
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                  Proses Pemesanan
                </p>
              </div>

              <div>
                <p className="text-2xl font-extrabold text-cyan-400">
                  24/7
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                  Akses Website
                </p>
              </div>
            </div>
          </div>

          {/* HERO GAME IMAGES */}
          <div className="relative hidden md:block">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl" />

            <div className="relative grid grid-cols-2 gap-4">
              {games.slice(0, 4).map((game) => (
                <div
                  key={game.name}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={game.image}
                      alt={game.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    <span className="absolute bottom-4 left-4 text-sm font-bold tracking-wide">
                      {game.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GAME LIST */}
      <section
        id="games"
        className="mx-auto max-w-7xl scroll-mt-24 px-5 py-20"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
              Game Favorit
            </p>

            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Pilih Game Kamu
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-7 text-slate-400">
              Temukan game favorit dan mulai pemesanan
              dengan proses yang mudah.
            </p>
          </div>

          <span className="text-sm text-slate-500">
            {filteredGames.length} game ditemukan
          </span>
        </div>

        {/* GAME SEARCH */}
        <div className="mb-7 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Mobile Legends, Free Fire, PUBG..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
          />
        </div>

        {/* CATEGORY FILTER */}
        <div className="mb-9 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-cyan-500 text-slate-950"
                  : "border border-slate-800 bg-slate-900 text-slate-400 hover:border-cyan-400 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* GAME CARDS */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredGames.map((game) => (
              <div
                key={game.name}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10"
              >
                <div className="relative h-44 overflow-hidden bg-slate-800 sm:h-52">
                  <img
                    src={game.image}
                    alt={game.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <span className="absolute right-4 top-4 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-cyan-300 backdrop-blur">
                    {game.category}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold tracking-tight">
                    {game.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Top up game favoritmu dengan mudah.
                  </p>

                  <button
                    onClick={() => setSelectedGame(game.name)}
                    className="mt-5 w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Top Up Sekarang
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 px-5 py-16 text-center">
            <h3 className="text-xl font-bold">
              Game Tidak Ditemukan
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Coba gunakan kata kunci atau kategori lainnya.
            </p>

            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("Semua");
              }}
              className="mt-6 text-sm font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </section>

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
      {selectedGame && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="my-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                  TopUpKu
                </p>

                <h3 className="mt-2 text-xl font-bold tracking-tight">
                  Pesan {selectedGame}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Lengkapi informasi akun dan pilih nominal top up.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-cyan-400 hover:text-white"
              >
                Tutup
              </button>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              User ID
            </label>

            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Masukkan User ID"
              className="mb-5 w-full rounded-lg border border-slate-700 bg-slate-950 p-3.5 text-sm outline-none transition focus:border-cyan-400"
            />

            <label className="mb-2 block text-sm font-semibold text-slate-300">
              Zone ID / Server ID
            </label>

            <input
              value={zoneId}
              onChange={(e) => setZoneId(e.target.value)}
              placeholder="Masukkan Zone ID"
              className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 p-3.5 text-sm outline-none transition focus:border-cyan-400"
            />

            <h4 className="mb-4 text-sm font-bold">
              Pilih Nominal
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {products.map((product) => (
                <button
                  key={product.amount}
                  onClick={() => setSelectedProduct(product.amount)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selectedProduct === product.amount
                      ? "border-cyan-400 bg-cyan-400/10"
                      : "border-slate-700 bg-slate-950 hover:border-slate-500"
                  }`}
                >
                  <p className="text-sm font-bold">
                    {product.amount}
                  </p>

                  <p className="mt-2 text-sm font-semibold text-cyan-400">
                    Rp{product.price.toLocaleString("id-ID")}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={handleCheckout}
              className="mt-7 w-full rounded-lg bg-cyan-500 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
            >
              Lanjutkan
            </button>

            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Produk dan harga masih dalam tahap simulasi.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
