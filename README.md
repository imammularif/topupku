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

## Features

- Game selection and product catalog
- Game ID and Zone ID input
- Checkout interface
- Multiple simulated payment method options
- Order creation and storage
- Order history lookup
- Order search functionality
- Responsive website interface

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React framework |
| TypeScript | Programming language |
| Tailwind CSS | Styling |
| Supabase | Database |
| PostgreSQL | Data storage |
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

Never commit your `.env.local` file or expose your Supabase secret key.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Production build

```bash
npm run build
```

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
├── .env.local
├── package.json
└── README.md
```

## Roadmap

- [x] Homepage and game catalog
- [x] Game selection interface
- [x] Checkout page
- [x] Supabase database integration
- [x] Order creation API
- [x] Order history page
- [x] GitHub repository
- [ ] Payment gateway integration
- [ ] Real payment verification and webhooks
- [ ] OTP-based order verification
- [ ] Game top-up provider integration
- [ ] Production deployment

## Disclaimer

TopUpKu is currently a learning and portfolio project. Payment processing and game top-up fulfillment are simulated and are not available for real transactions.

## Author

**Imammul Arif**

GitHub: [@imammularif](https://github.com/imammularif)

Project Repository: [TopUpKu](https://github.com/imammularif/topupku)
