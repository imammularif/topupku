
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
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-6 md:py-16 lg:px-8"
    >
      {/* SECTION HEADER */}
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-violet-400">
            Katalog Game
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Pilih Game Favoritmu
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Cari game dan pilih nominal top up yang kamu inginkan.
          </p>
        </div>

        <span className="shrink-0 rounded-lg border border-violet-500/20 bg-slate-900 px-3 py-2 text-xs font-medium text-violet-300">
          {filteredGames.length} Game
        </span>
      </div>

      {/* SEARCH */}
      <div className="mb-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-[#111827] px-4 transition-all focus-within:border-violet-500 focus-within:shadow-[0_0_15px_rgba(139,92,246,0.15)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 text-slate-500"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama game..."
            aria-label="Cari game"
            className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-500"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Hapus pencarian"
              className="shrink-0 text-xs font-medium text-slate-400 transition-colors hover:text-violet-400"
            >
              Hapus
            </button>
          )}
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const isActive = activeCategory === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={isActive}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-violet-600 text-white shadow-[0_0_14px_rgba(139,92,246,0.3)]"
                  : "border border-slate-700 bg-slate-900/70 text-slate-400 hover:border-blue-500/50 hover:text-blue-300"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* GAME CATALOG */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {filteredGames.map((game) => (
            <GameCard
              key={game.name}
              game={game}
              onSelect={onSelectGame}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-700 bg-[#111827] px-5 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 text-2xl text-violet-400">
            ⌕
          </div>

          <h3 className="mt-4 text-lg font-semibold text-white">
            Game Tidak Ditemukan
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Coba kata kunci atau kategori lainnya.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("Semua");
            }}
            className="mt-5 text-sm font-semibold text-violet-400 transition-colors hover:text-blue-400"
          >
            Reset Pencarian
          </button>
        </div>
      )}
    </section>
  );
}
