# Africoin Wallet - Cryptocurrency Wallet & Payment Platform

A modern cryptocurrency wallet application with AI-powered assistance, built with React, TypeScript, and Vite.

## Features

- **Smart Wallet**: Alchemy-powered smart wallets with passkey authentication
- **Phone Authentication**: Sign up and log in with phone number + SMS OTP
- **2FA Wallet Security**: Biometric authentication (Face ID, Touch ID, passkey)
- **AI Assistant**: Gemini-powered chatbot for 24/7 customer support
- **Token Management**: Send/receive ETH, AFC, USDC with gas-sponsored transactions
- **Africa Railways Integration**: Real railway booking with Sui blockchain backend
- **Cross-Chain Payments**: Bridge AFC (Ethereum) to AFRC (Sui) for bookings
- **Real-Time Tracking**: Live train telemetry and sentinel network integration
- **Merchant Portal**: API integration for payment processing
- **Multi-Layer Security**: Separate account and wallet authentication

## Prerequisites

- Node.js (v18 or higher)
- Alchemy Account Kit API key and Configuration (required for wallet features)
- Alchemy Gas Manager Policy ID (optional, for sponsored transactions)
- Supabase project (authentication & database)
- Gemini API key (optional, for AI chatbot)
- Twilio account (optional, for SMS/phone auth)
- Africa Railways API key (optional, for real railway bookings)

## Database Migration from Famous.AI

⚠️ **IMPORTANT**: If your database is empty or showing low activity:

This project uses Supabase for data storage. If you're migrating from Famous.AI or another Supabase project, you need to run the database migration to populate your tables.

**Quick Start:**
1. Check migration setup: `npm run check:migration`
2. Follow the comprehensive guide: [FAMOUS_AI_MIGRATION_GUIDE.md](./FAMOUS_AI_MIGRATION_GUIDE.md)

**Symptoms that migration is needed:**
- Only 6 requests in last 24 hours in Supabase dashboard
- Empty tables (no users, profiles, etc.)
- Application shows no data

**Quick Migration:**
```bash
# 1. Set up credentials in .env.local (see FAMOUS_AI_MIGRATION_GUIDE.md)
# 2. Check setup
npm run check:migration

# 3. Test connection
node scripts/migrate-database.js --dry-run --debug

# 4. Run migration
npm run migrate:db

# 5. Verify success
npm run verify:migration
```

See [FAMOUS_AI_MIGRATION_GUIDE.md](./FAMOUS_AI_MIGRATION_GUIDE.md) for detailed instructions.

## Database Migration

If you're migrating from Famous.AI to Vercel, see the comprehensive [Database Migration Guide](DATABASE_MIGRATION_GUIDE.md) for detailed instructions on:
- Using Vercel Edge Config for secure credential management
- Batch processing with safety prompts
- Table migration and data integrity
- Post-migration configuration

Quick start:
```bash
# Test migration setup
npm run test:migration

# Run the migration
npm run migrate:db
```

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env.local` file in the root directory (see `.env.example` for template):
   ```env
   # Alchemy Account Kit (Required for wallet features)
   VITE_ALCHEMY_API_KEY=your-alchemy-api-key
   VITE_ALCHEMY_GAS_POLICY_ID=your-gas-policy-id  # Optional, for sponsored transactions
   
   # Supabase (Authentication & Database)
   VITE_SUPABASE_ANON_KEY=sb_publishable_mvf27GcPR10HH9wCFm2rTA_oN1YXo6l
   
   # Gemini AI (Optional)
   VITE_GEMINI_API_KEY=your-gemini-api-key
   
   # Africa Railways Integration (Optional)
   VITE_AFRICA_RAILWAYS_API_URL=https://api.africa-railways.com
   AFRICA_RAILWAYS_API_KEY=your-africa-railways-api-key
   VITE_SUI_NETWORK=testnet
   ```
   
   **⚠️ Security Note for Supabase Configuration:**
   - The `src/lib/supabase.ts` file is designed to use environment variables for all credentials
   - **NEVER** hardcode actual Supabase credentials directly in `supabase.ts`
   - All Supabase configuration must come from environment variables (`VITE_SUPABASE_ANON_KEY`)
   - For production deployments, use your deployment platform's environment variable management (Vercel, Netlify, etc.)
   - For local development, use `.env.local` file (already in `.gitignore`)
   - The `.gitignore` entry for `supabase.ts` prevents accidental commits of modified configuration
   - If `src/lib/supabase.ts` doesn't exist, copy from `src/lib/supabase.ts.example`
   
   **Setting up Alchemy Account Kit:**
   1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
   2. Create a new app or select existing app
   3. Copy your API key
   4. Go to [Smart Wallets Configuration](https://dashboard.alchemy.com/services/smart-wallets/configuration)
   5. Create a new configuration and enable desired login methods (email, social, passkeys)
   6. (Optional) Create a [Gas Manager Policy](https://dashboard.alchemy.com/services/gas-manager/configuration) for sponsored transactions
   
   **For Phone Authentication:**
   Configure Twilio in Supabase Dashboard:
   - Go to Authentication > Providers > Phone
   - Add your Twilio credentials
   - Enable phone authentication
   
   **For Africa Railways Integration:**
   - Contact Africa Railways for API access
   - Configure bridge service for cross-chain payments
   - See `AFRICA_RAILWAYS_INTEGRATION.md` for details

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Authentication

### Phone Number Login
- Sign up with phone number + SMS OTP
- International format required (+country code)
- Secure 6-digit verification code
- Rate-limited to prevent abuse

### Wallet Security (2FA)
- Email authentication (primary method)
- Social login (Google, Facebook)
- Passkey support (Face ID, Touch ID, device passcode) - added after initial login
- Self-custodial wallet with device-level security

**Important:** Passkeys (Face ID, Touch ID, Passcode) are added AFTER you authenticate with email or social login. They cannot be used as the primary authentication method without first logging in.

### Two-Layer Security
1. **Account Layer**: Phone/email authentication via Supabase
2. **Wallet Layer**: Biometric/passkey authentication via Alchemy

## AI Assistant

The Gemini AI chatbot provides:
- Wallet and transaction help
- Blockchain concept explanations
- Railway booking assistance
- Security guidance
- 24/7 support

To enable AI features, add your Gemini API key to `.env.local`.

## Database Migration

The project includes a secure database migration script (`scripts/migrate-database.js`) for copying data between Supabase instances.

### Environment Variables Required

For database migration operations, you must set the following environment variables:
```bash
# Source database (e.g., Famous.AI)
SOURCE_SUPABASE_URL=https://your-source-project.supabase.co
SOURCE_SUPABASE_KEY=your_source_service_role_key

# Target database (e.g., Vercel deployment)
TARGET_SUPABASE_URL=https://your-target-project.supabase.co
TARGET_SUPABASE_KEY=your_target_service_role_key
```

**⚠️ Security Notes:**
- The migration script validates all required environment variables before execution
- Use **service role keys** for migration (these have elevated permissions for direct database access)
  - Service role keys bypass Row Level Security (RLS) policies
  - Get these from your Supabase project dashboard under Settings > API
  - **NEVER** commit service role keys to the repository or expose them client-side
- Set these variables in your CI/CD platform or local environment (not in `.env` files committed to git)
- See `.env.example` for reference configuration
- The script includes built-in retry logic and error handling

### Running Migrations

```bash
# Basic migration
npm run migrate:db

# With debug logging
node scripts/migrate-database.js --debug

# Interactive mode with confirmations
node scripts/migrate-database.js --interactive

# Custom retry count
node scripts/migrate-database.js --retry-count=5
```

## Africa Railways Integration

### Overview
Africoin Wallet integrates with Africa Railways' Sui blockchain infrastructure for real railway bookings across 54 African nations.

### Features
- **Real Railway Data**: Live train schedules and seat availability
- **Cross-Chain Payments**: AFC (Ethereum) → AFRC (Sui) bridge
- **Real-Time Tracking**: WebSocket-based train telemetry
- **Sentinel Network**: Safety reports and track worker alerts
- **Blockchain Tickets**: Sui Move-based digital tickets

### Demo
Visit `/africa-railways-demo` to see the integration in action.

### Documentation
See `AFRICA_RAILWAYS_INTEGRATION.md` for:
- Complete architecture specifications
- 4-phase implementation plan (16 weeks)
- API endpoint documentation
- Security considerations
- Cost analysis

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase
- **Blockchain**: Alchemy Account Kit (Sepolia testnet)
- **AI**: Google Gemini Pro
- **State**: React Context + TanStack Query

## Database Migration

This project uses Supabase for database management. The database is currently configured to use:
- **Production Database**: https://llvprbmrnjvamjzavmhg.supabase.co (supabase-teal-window)

### Migration from Famous.AI

If you need to migrate data from Famous.AI to the Vercel Supabase instance:

1. **Verify Database Connection**:
   ```bash
   npm run verify:db
   ```

2. **Run Migration**:
   ```bash
   npm run migrate:db
   ```

For detailed migration instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md).

### Migration Features
- Automated data transfer between Supabase instances
- Batch processing (100 records at a time)
- Connection validation before migration
- Upsert strategy (safe to run multiple times)
- Detailed progress logging

### Tables Migrated
- User profiles and authentication
- Admin roles and permissions
- Loyalty points and transactions
- Favorite posts
- Support tickets
