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
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl hover:shadow-cyan-500/10">
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
          onClick={() => onSelect(game.name)}
          className="mt-5 w-full rounded-lg bg-cyan-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Top Up Sekarang
        </button>
      </div>
    </div>
  );
}
