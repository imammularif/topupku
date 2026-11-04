TopUpKu — Game Top-Up Website

A full-stack game top-up website prototype built with Next.js 16, TypeScript, Supabase, PostgreSQL, and Resend.

TopUpKu is designed to provide a user-friendly experience for browsing game products, placing top-up orders, searching order information, and recovering lost order numbers through email-based verification.

The project demonstrates practical implementation of frontend development, backend API integration, relational database management, transactional email delivery, and basic security mechanisms.

Project Status: Functional prototype. Core order management, order lookup, search history, and email-based order recovery are integrated with Supabase and Resend. Real payment processing and automated game top-up fulfillment are not yet implemented.

⸻

Screenshots

Homepage

Game Selection

Checkout

Order History

Search History

Users can review previous searches, repeat a search, and manage their locally stored search history.

Order Lookup

Users can search for orders using available order information. Matching order details, including the order number, are displayed in the search results.

Forgot Order Number

Users who have lost their order number can initiate an email-based recovery process.

WhatsApp recovery is displayed as a future feature and is currently unavailable.

Email Recovery

Users can request an order recovery verification code using their registered email address.

The backend checks whether the email is associated with existing order records before processing the recovery request.

OTP Verification

The email recovery system implements a six-digit OTP verification mechanism.

Key implementation details:

* Six-digit verification code.
* Five-minute OTP expiration.
* Server-side OTP verification through Next.js API routes.
* OTP hashing before database storage.
* Verification attempt limitations.
* OTP consumption after successful verification.

Recovery Result

After successful verification, the system retrieves and displays order numbers associated with the verified email address.

Users can copy recovered order numbers directly from the result interface.

⸻

Key Features

1. Game Catalog & Product Selection

* Game catalog and product browsing.
* Support for multiple game categories.
* Game account information input (User ID and Zone ID).
* Product and denomination selection.
* Checkout interface.

2. Order Management

* Order creation through backend API.
* Order history management.
* Order lookup by order number or game account information.
* Display of matching order numbers in search results.
* Order information retrieval.

3. Search History

* Local search history storage.
* Previous search review.
* Repeat search functionality.
* Search history management.

4. Email-Based Order Recovery

* Recovery request using customer email.
* Email association checking against existing order records.
* Six-digit OTP generation.
* OTP hashing and expiration handling.
* Verification attempt limitations.
* Email delivery through Resend.
* Recovered order number retrieval.
* Copy order number functionality.

5. Backend & Database Integration

* Supabase backend integration.
* PostgreSQL relational database.
* Next.js API route implementation.
* Server-side database operations.
* Transactional email integration.

⸻

System Architecture

TopUpKu uses a Next.js application architecture with Supabase as its database backend and Resend for email delivery.

                 CUSTOMER
                     |
                     v
              NEXT.JS FRONTEND
                     |
                     v
              NEXT.JS API ROUTES
                     |
          +----------+----------+
          |                     |
          v                     v
     SUPABASE              RESEND API
          |
          v
      POSTGRESQL
          |
     +----+----------------+
     |                     |
     v                     v
  ORDERS              RECOVERY OTP
     |                     |
     +----------+----------+
                |
                v
       ORDER INFORMATION
        & RECOVERY RESULT

Backend Responsibilities

Component	Responsibility
Next.js API Routes	Handle order requests, lookup, and recovery operations
Supabase	Backend service and database connectivity
PostgreSQL	Store order and OTP recovery records
Resend	Deliver email verification codes
Server-side utilities	Manage privileged database operations

⸻

Email Recovery Security

The order recovery mechanism incorporates several security considerations:

Security Mechanism	Implementation
OTP Length	Six-digit verification code
OTP Expiration	Five minutes
OTP Storage	Hashed OTP values
Verification Attempts	Limited attempts
OTP Consumption	Prevents reuse after successful verification
Email Privacy	Generic recovery responses
Backend Processing	Server-side API routes

Email Delivery Requirements

Email delivery to arbitrary customer addresses requires a verified sending domain in Resend. The default testing sender may be restricted to the account owner’s verified email address.

⸻

Tech Stack

Technology	Purpose
Next.js 16	React framework and API routes
React	Frontend user interface
TypeScript	Type-safe application development
Tailwind CSS	UI styling
Supabase	Backend and database integration
PostgreSQL	Relational data storage
Resend	Transactional email delivery
Node.js	JavaScript runtime
Git & GitHub	Version control and project management

⸻

Supported Games

The prototype currently includes the following game categories:

* Mobile Legends
* Free Fire
* PUBG Mobile
* Genshin Impact
* Valorant
* Honor of Kings

Planned Product Expansion

The platform is designed to support additional digital products:

* Game Currency: Diamonds, UC, Genesis Crystals, Valorant Points, and other in-game currencies.
* Game Membership: Weekly Pass, Monthly Card, and other subscriptions.
* Game Vouchers: Digital game vouchers and prepaid codes.
* Digital Gift Cards: Steam Wallet, Google Play, and PlayStation Store.
* Gaming Subscriptions: PlayStation Plus and Xbox Game Pass.

⸻

Payment Methods (Prototype)

The checkout interface currently provides simulated payment method selection:

* QRIS
* E-Wallet
* Virtual Account
* Bank Transfer

Important: These payment methods are UI simulations. The application does not currently process real payments or communicate with payment gateways.

⸻

Getting Started

Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git

You also need:

* A Supabase project.
* A Resend account for email-based OTP delivery.

1. Clone the Repository

git clone https://github.com/imammularif/topupku.git
cd topupku

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a .env.local file in the project root.

SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_secret_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=TopUpKu <your_verified_sender_email>
ORDER_OTP_SECRET=your_random_32_byte_secret

Replace all placeholder values with your actual credentials.

Environment Security Guidelines:

* SUPABASE_SECRET_KEY must only be accessed from server-side code.
* RESEND_API_KEY must never be exposed in client-side code.
* ORDER_OTP_SECRET must use a strong, randomly generated secret.
* Never commit .env.local or expose credentials in the repository.
* Use environment variables for all sensitive configuration.

4. Configure the Database

TopUpKu uses Supabase PostgreSQL.

Create the following database tables:

Orders Table (orders)

Stores customer order information, including:

* Order ID
* Order code
* Customer name
* Customer email
* Customer phone
* Game
* User ID
* Zone ID
* Product
* Price
* Payment method
* Order status
* Creation timestamp

Order Recovery OTP Table (order_recovery_otps)

Stores email recovery verification records:

* Recovery record ID
* Customer email
* Hashed OTP
* Expiration timestamp
* Verification attempt counter
* OTP consumption timestamp
* Creation timestamp

Enable Row Level Security (RLS) and configure appropriate database permissions.

Privileged database operations are handled through server-side Supabase credentials.

5. Run the Development Server

npm run dev

Open http://localhost:3000 in your browser.

6. Production Build

npm run build

⸻

Project Structure

topupku/
├── app/
│   ├── api/
│   │   └── orders/
│   │       ├── recovery/
│   │       │   ├── request/
│   │       │   │   └── route.ts
│   │       │   └── verify/
│   │       │       └── route.ts
│   │       └── route.ts
│   ├── checkout/
│   │   └── page.tsx
│   ├── orders/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── GameCard.tsx
│   ├── GameSection.tsx
│   ├── HeroSection.tsx
│   ├── Navbar.tsx
│   └── OrderModal.tsx
├── data/
│   └── games.ts
├── lib/
│   └── supabaseAdmin.ts
├── public/
│   └── games/
├── docs/
│   └── screenshots/
├── package.json
├── package-lock.json
└── README.md

Directory Overview

Directory	Description
app/	Next.js App Router pages, layouts, and API endpoints
app/api/	Backend API routes for order and recovery operations
components/	Reusable frontend UI components
data/	Centralized game catalog and product data
lib/	Shared utilities and backend integration
public/	Static assets and game images
docs/	Project documentation and screenshots

⸻

Current Limitations

TopUpKu is currently a functional prototype intended for learning, experimentation, and portfolio demonstration.

The following limitations remain:

* Payment methods are simulated and do not process actual transactions.
* No real QRIS, e-wallet, or virtual account integration.
* Game top-up fulfillment is not connected to official providers.
* Order status requires separate updates and is not automatically synchronized with payment providers.
* Email recovery requires a verified Resend sending domain for general customer delivery.
* WhatsApp recovery is not available.
* Search history is stored locally in the browser and is not synchronized across devices.
* Public order lookup endpoints require additional security hardening before production use.

Additional authentication, authorization, rate limiting, access control, and privacy protections are required before production deployment.

⸻

Development Roadmap

Completed

Core Application

* [x]	Homepage and game catalog.
* [x]	Game selection interface.
* [x]	Checkout interface.
* [x]	Order creation API.
* [x]	Order history page.
* [x]	Order lookup functionality.
* [x]	Display matching order numbers in lookup results.
* [x]	Search history management.

Backend & Integration

* [x]	Supabase database integration.
* [x]	PostgreSQL order data storage.
* [x]	Email-based OTP recovery request API.
* [x]	OTP verification API.
* [x]	OTP hashing and expiration handling.
* [x]	Resend email service integration.
* [x]	Recovered order number retrieval.
* [x]	Copy recovered order numbers.

Frontend & Code Organization

* [x]	Modular homepage architecture.
* [x]	Reusable UI components.
* [x]	Centralized game and product data management.
* [x]	GitHub repository and version control.
* [x]	Application screenshots and documentation.

Future Development

Code Quality & Security

* [ ]	Further code refactoring and service-layer separation.
* [ ]	Implement reusable order history and recovery hooks.
* [ ]	Improve order code generation.
* [ ]	Strengthen API security and data protection.
* [ ]	Implement IP-based rate limiting and abuse prevention.
* [ ]	Implement customer authentication.
* [ ]	Improve order lookup authorization and verification.

Product Expansion

* [ ]	Expand the game catalog.
* [ ]	Add game memberships and subscriptions.
* [ ]	Add digital game vouchers and gift cards.
* [ ]	Support additional digital products.

Payment & Order Management

* [ ]	Integrate a real payment gateway.
* [ ]	Implement payment verification and webhooks.
* [ ]	Implement real-time order status updates.
* [ ]	Implement automated order fulfillment.

Integration & Deployment

* [ ]	Verify a custom sending domain for Resend.
* [ ]	Complete end-to-end email recovery testing.
* [ ]	Integrate official game top-up providers.
* [ ]	Integrate digital product providers.
* [ ]	Prepare production deployment.

⸻

Customer Support

TopUpKu provides an email contact channel for customer assistance.

For transaction inquiries, order issues, or other questions, customers can contact:

Email: your-support-email@example.com

When contacting support, customers are encouraged to include:

* Order number, if available.
* Game name and product.
* Description of the issue.
* Relevant transaction details.

Never share passwords, OTP verification codes, or sensitive payment information through email.

⸻

Disclaimer

TopUpKu is an independent learning and portfolio project.

Payment processing and automated game top-up fulfillment are not available for real transactions.

This project is not affiliated with or officially endorsed by any of the game publishers mentioned above.

⸻

Author

Imammul Arif

* GitHub: @imammularif
* Repository: TopUpKu
* Portfolio: imammularif.github.io/portfolio-V2.0

Project Focus: Full-Stack Development · Backend API Integration · SQL & Database Management · Data Processing · Application Operations