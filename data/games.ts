export type Game = {
  name: string;
  category: string;
  image: string;
};

export type Product = {
  amount: string;
  price: number;
};

export const games: Game[] = [
  { name: "Mobile Legends", category: "MOBA", image: "/games/mobile-legends.jpg" },
  { name: "Free Fire", category: "Battle Royale", image: "/games/free-fire.jpg" },
  { name: "PUBG Mobile", category: "Battle Royale", image: "/games/pubg-mobile.jpg" },
  { name: "Genshin Impact", category: "RPG", image: "/games/genshin-impact.jpg" },
  { name: "Valorant", category: "FPS", image: "/games/valorant.jpg" },
  { name: "Honor of Kings", category: "MOBA", image: "/games/honor-of-kings.jpg" },
];

export const products: Product[] = [
  { amount: "86 Diamonds", price: 20000 },
  { amount: "172 Diamonds", price: 39000 },
  { amount: "257 Diamonds", price: 58000 },
  { amount: "344 Diamonds", price: 77000 },
];

export const categories = [
  "Semua",
  "MOBA",
  "Battle Royale",
  "RPG",
  "FPS",
];