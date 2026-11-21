
import type { Game } from "../data/games";

type GameCardProps = {
  game: Game;
  onSelect: (gameName: string) => void;
};

export default function GameCard({
  game,
  onSelect,
}: GameCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(game.name)}
      aria-label={`Top up ${game.name}`}
      className="group w-full overflow-hidden rounded-xl border border-slate-700/80 bg-[#111827] text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080B18]"
    >
      {/* GAME IMAGE */}
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-900">
        <img
          src={game.image}
          alt={game.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080B18]/40 to-transparent opacity-70" />
      </div>

      {/* GAME INFORMATION */}
      <div className="flex items-center justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-violet-300 sm:text-base">
            {game.name}
          </h3>

          <p className="mt-1 text-xs text-slate-400">
            {game.category}
          </p>
        </div>

        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-400 transition-all group-hover:border-violet-400 group-hover:bg-violet-600 group-hover:text-white group-hover:shadow-[0_0_12px_rgba(139,92,246,0.5)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </span>
      </div>
    </button>
  );
}
