# FIESTO - Phase 1 Frontend Complete

Welcome to the FIESTO repository! This project constitutes the structurally complete, responsive, and tokenized frontend UI for the FIESTO festival management platform.

## Architecture

This Next.js 14 App Router project is divided into distinct, isolated routing environments:

1. **Public Marketing Site** (`/app/(public)`)
   - Uses a light-mode aesthetic (`#FDF8E2` base) with bold, asymmetric layouts.
   - Routes: `/`, `/festivals`, `/festivals/[slug]`, `/checkout/[tierId]`, `/about`.

2. **Super Admin Dashboard** (`/app/admin`)
   - Uses a forced dark-mode aesthetic for a calm, data-dense back-office experience.
   - Routes: Overview, Festivals, Organizers, Users, Billing, Settings.

3. **Organizer Dashboard** (`/app/dashboard/[festivalId]`)
   - The workspace for festival creators to manage their specific events.
   - Routes: Overview, Lineup (visual builder), Stages, Tickets, Vendors, Staff (Live Check-in Mock), Announcements, Settings.

4. **Vendor Portal** (`/app/vendor/[vendorId]`)
   - A minimal interface for food/merch vendors to track sales and manage POS inventory.

## Design System Tokens
**CRITICAL: Do not deviate from these tokens in Phase 2.**
- Primary: `#504E76`
- Accent: `#F1642E`
- Success: `#A3B565`
- Warning: `#FCDD9D`
- Soft: `#C4C3E3`
- Base: `#FDF8E2`
- Fonts: `Anton` (Display), `Syne` (Heading), `Urbanist` (Body)

## Phase 2: Backend Completed

The FIESTO backend has been fully integrated! The mock data has been replaced with a real PostgreSQL database (Prisma), NextAuth authentication, direct-to-S3 file uploads, and Pusher WebSockets for real-time check-in syncing.

### Environment Setup

To run FIESTO locally, you must configure a `.env.local` file at the root of the project with the following variables:

```env
# Database (Supabase PostgreSQL recommended)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Resend Email Integration
RESEND_API_KEY="re_..."
EMAIL_FROM="Fiesto <onboarding@resend.dev>"

# AWS S3 for Banner Uploads
S3_BUCKET="your_s3_bucket"
S3_ACCESS_KEY="your_s3_access_key"
S3_SECRET_KEY="your_s3_secret_key"
S3_REGION="us-east-1"

# Pusher for Real-Time Check-In
NEXT_PUBLIC_PUSHER_APP_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_SECRET="your_pusher_secret"

# Stripe (Optional for future payment logic)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Architectural Note: Session Invalidation
Fiesto uses NextAuth's **JWT strategy** for authentication sessions because we utilize the Credentials provider. To meet strict security requirements (like invalidating all active sessions across devices upon a password reset), a `securityStamp` is stored on the `User` model and encoded into the JWT. This stamp is verified against the database on every authenticated request. When a password reset occurs, the `securityStamp` is regenerated, instantly expiring all existing JWTs.

### Database Seeding & Test Accounts

To populate the database with realistic test data and default users, run the Prisma seed script:

```bash
npx prisma db seed
```

This will create several mock festivals, artists, and attendees, along with **four default test accounts** so you can test every dashboard role. The password for all test accounts is `password123`.

- **Super Admin**: `superadmin@fiesto.app` (Access `/admin`)
- **Organizer**: `organizer@fiesto.app` (Access `/dashboard/[festivalId]`)
- **Vendor**: `vendor@fiesto.app` (Access `/vendor/[vendorId]`)
- **Attendee**: `attendee@fiesto.app` (Access public features)

### Running Integration Tests

We have included Vitest integration tests to verify the critical paths of checkout and check-in operations against the database. To run them:

```bash
npm run test
```
*(Note: Ensure your `DATABASE_URL` is correctly configured before running tests, as they write to the database).*
