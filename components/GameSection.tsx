
"use client";

import type { Game } from "../data/games";
import GameCard from "./GameCard";

type GameSectionProps = {
  filteredGames: Game[];
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  activeCategory: string;
  setActiveCategory: (value: string) => void;
  categories: string[];
  onSelectGame: (gameName: string) => void;
};

export default function GameSection({
  filteredGames,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  categories,
  onSelectGame,
}: GameSectionProps) {
  return (
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
            <GameCard
              key={game.name}
              game={game}
              onSelect={onSelectGame}
            />
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
  );
}
