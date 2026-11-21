
import Link from "next/link";
import AuthMenu from "./AuthMenu";

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Game", href: "/#games" },
  { label: "Bantuan", href: "/#bantuan" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-violet-500/20 bg-[#080B18]/95 backdrop-blur-xl">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-white"
        >
          TopUpKu<span className="text-violet-400">.</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-violet-400"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="flex items-center gap-2 rounded-lg border border-violet-500/40 bg-violet-500/10 px-3 py-2.5 text-xs font-semibold text-violet-300 transition hover:border-violet-400 hover:bg-violet-500/20 sm:px-4 sm:text-sm"
          >
            <span>📦</span>
            <span className="hidden sm:inline">Riwayat Pesanan</span>
            <span className="sm:hidden">Pesanan</span>
          </Link>

          <AuthMenu />
        </div>
      </nav>

      <div className="border-t border-violet-500/10 px-4 py-3 md:hidden">
        <nav
          aria-label="Navigasi mobile"
          className="mx-auto flex max-w-7xl items-center gap-7 overflow-x-auto"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 whitespace-nowrap text-xs font-medium text-slate-400 transition-colors hover:text-violet-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
