# TopUpKu — Game Top-Up Website

A game top-up website prototype built with **Next.js, TypeScript, and Supabase**.

TopUpKu is designed to provide a simple and user-friendly experience for browsing game products, placing top-up orders, and tracking order history.

> **Project Status:** Prototype — Payment gateway and game top-up provider integrations are not yet implemented.

## Screenshots

### Homepage
![TopUpKu Homepage](docs/screenshots/homepage.png)

### Game Selection
![Game Selection](docs/screenshots/game-selection.png)

### Checkout Page
![Checkout Page](docs/screenshots/checkout.png)

### Order History
![Order History](docs/screenshots/order-history.png)

### Search History
![Search History](docs/screenshots/search-history.png)

Users can review their previous searches, repeat a search, and manage their local search history.

### Forgot Order Number
![Forgot Order Number](docs/screenshots/forgot-order-number.png)

A prototype order-number recovery flow with Email and WhatsApp options. OTP delivery and verification are simulated and are not connected to real messaging services.

## Features

- Game selection and product catalog.
- Game ID and Zone ID input.
- Customer information input.
- Checkout interface.
- Multiple simulated payment method options.
- Order creation through backend API.
- Order data storage using Supabase.
- Order history lookup by order code.
- Order lookup using Game User ID and Zone ID.
- Local search history using browser Local Storage.
- Repeat previous searches.
- Manage and clear search history.
- Prototype order-number recovery interface.
- Responsive website interface.

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | React framework |
| React | User interface |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling |
| Supabase | Backend and database integration |
| PostgreSQL | Relational data storage |
| Git & GitHub | Version control |

## Supported Games

- Mobile Legends
- Free Fire
- PUBG Mobile
- Genshin Impact
- Valorant
- Honor of Kings

## Payment Methods (Prototype)

The checkout interface currently provides simulated payment method selection:

- QRIS
- E-Wallet
- Virtual Account
- Bank Transfer

**Note:** These payment methods are UI simulations only. No real transactions or payment processing are performed.

## Getting Started

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/imammularif/topupku.git
```

### 2. Navigate to the project directory

```bash
cd topupku
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env.local` file in the project root:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
```

Replace the placeholder values with your own Supabase credentials.

Never commit your `.env.local` file or expose your Supabase secret key in client-side code.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production build

```bash
npm run build
```

## Database

TopUpKu uses Supabase with PostgreSQL to store order information.

The `orders` table includes:

- Order ID
- Order code
- Customer name
- Game
- User ID
- Zone ID
- Product
- Price
- Payment method
- Order status
- Creation timestamp

Row Level Security (RLS) is enabled on the orders table.

## Project Structure

```text
topupku/
├── app/
│   ├── api/
│   │   └── orders/
│   │       └── route.ts
│   ├── checkout/
│   │   └── page.tsx
│   ├── orders/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabaseAdmin.ts
├── public/
│   └── games/
├── docs/
│   └── screenshots/
├── package.json
└── README.md
```

## Current Limitations

TopUpKu is currently a functional prototype for learning and portfolio purposes.

- Payment methods are simulated and do not process actual payments.
- No real QRIS, e-wallet, or virtual account transactions are performed.
- Order fulfillment is not connected to an official game top-up provider.
- Order status remains pending unless updated separately.
- Email and WhatsApp OTP delivery and verification are simulated.
- Search history is stored locally in the browser and is not synchronized across devices.

The current public order lookup endpoints are intended for prototype testing only. Additional authentication, authorization, rate limiting, and privacy protections are required before production use.

## Roadmap

- [x] Homepage and game catalog
- [x] Game selection interface
- [x] Checkout page
- [x] Supabase database integration
- [x] Order creation API
- [x] Order history page
- [x] Search history
- [x] Order recovery interface (prototype)
- [x] GitHub repository
- [ ] Code refactoring and improved project structure
- [ ] Improved order code generation and API security
- [ ] Customer authentication
- [ ] Payment gateway integration
- [ ] Real payment verification and webhooks
- [ ] OTP-based order verification
- [ ] Game top-up provider integration
- [ ] Production deployment

## Disclaimer

TopUpKu is an independent learning and portfolio project. Payment processing and game top-up fulfillment are simulated and are not available for real transactions.

This project is not affiliated with or officially endorsed by the game publishers mentioned above.

## Author

**Imammul Arif**

GitHub: [@imammularif](https://github.com/imammularif)

Project Repository: [TopUpKu](https://github.com/imammularif/topupku)

Portfolio: [imammularif.github.io/portfolio-V2.0](https://imammularif.github.io/portfolio-V2.0)
