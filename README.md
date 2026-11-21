## System Architecture

TOPUPKU follows a full-stack architecture built with Next.js, integrating frontend interfaces, backend API routes, database services, authentication, payment processing, and email delivery.

### Architecture Diagram

```text
                         USER
                           |
                           v
                  NEXT.JS APPLICATION
                           |
             +-------------+-------------+
             |                           |
             v                           v
       FRONTEND LAYER              BACKEND LAYER
       (React / Next.js)           (Next.js API Routes)
             |                           |
             v                           v
       USER INTERFACE              BUSINESS LOGIC
       - Homepage                  - Order Management
       - Game Catalog              - Product Validation
       - Authentication            - Payment Notification
       - Checkout                  - OTP Verification
       - User Profile                     |
       - Order History                    |
             |                            |
             |              +-------------+-------------+
             |              |             |             |
             |              v             v             v
             |          SUPABASE       MIDTRANS        RESEND
             |              |             |             |
             |              v             v             v
             |          PostgreSQL    Snap Payment   Email Delivery
             |          Supabase Auth  Gateway       OTP Recovery
             |              |
             |              v
             |          ORDER DATA
             |          USER DATA
             |          RECOVERY OTP DATA
             |
             v
        USER EXPERIENCE
```

### Main Components

- **Next.js:** Application framework for frontend pages and backend API routes.
- **React:** Component-based user interface.
- **Supabase:** PostgreSQL database and user authentication.
- **Midtrans:** Payment gateway integration using Snap.
- **Resend:** Email delivery service for order recovery and OTP verification.

### Architecture Responsibilities

| Layer | Responsibility |
|---|---|
| Frontend | User interface and customer interactions |
| Backend API | Order processing, validation, and payment notifications |
| Database | Persistent order and application data |
| Authentication | User registration, login, and session management |
| Payment Gateway | Payment initiation and transaction status |
| Email Service | Order recovery and OTP email delivery |
