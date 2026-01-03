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

## Deployment

### Vercel Deployment

This project is optimized for deployment on Vercel. Follow these steps for a successful deployment:

#### 1. Environment Variables Setup

**Required Environment Variables:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key
- `VITE_ALCHEMY_API_KEY` - Your Alchemy API key (for wallet features)

**Optional Environment Variables:**
- `VITE_ALCHEMY_GAS_POLICY_ID` - For sponsored transactions
- `VITE_GEMINI_API_KEY` - For AI chatbot features

**Setting Variables in Vercel Dashboard:**
1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings → Environment Variables**
3. Add each variable with appropriate values for:
   - **Production** (required)
   - **Preview** (recommended)
   - **Development** (optional)

**Using the Deployment Helper Script:**
```bash
# Run the helper script to guide you through the setup
./scripts/deploy-supabase-vars.sh
```

This script will:
- Check your local `.env.local` configuration
- Provide step-by-step instructions for Vercel CLI
- Show exactly what commands to run

#### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended for first-time deployment)**
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Configure environment variables as described above
5. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### 3. Post-Deployment Verification

After deployment, verify that:
1. The application loads without errors
2. Supabase connection is working (check browser console for errors)
3. Wallet features are functional (if Alchemy is configured)
4. No environment variable errors in Vercel logs

### Local Development Deployment

For local development with production-like environment:

```bash
# 1. Create .env.local from template
cp .env.example .env.local

# 2. Edit .env.local with your actual credentials
# Add at minimum:
#   VITE_SUPABASE_URL=https://your-project.supabase.co
#   VITE_SUPABASE_ANON_KEY=your-key
#   VITE_ALCHEMY_API_KEY=your-key

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Build for production testing
npm run build
npm run preview
```

## Troubleshooting

### Common Build Issues

#### Issue 1: "ENOENT: no such file or directory"

**Symptoms:**
- Build fails with file not found errors
- Module resolution errors during Vite build

**Solutions:**
1. **Clear node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Verify vite.config.ts has correct alias:**
   ```typescript
   resolve: {
     alias: {
       "@": path.resolve(__dirname, "./src"),
     },
   }
   ```

3. **Check that all imports use the correct path:**
   ```typescript
   // Correct
   import { supabase } from '@/lib/supabase';
   
   // Incorrect (if using @ alias)
   import { supabase } from '../lib/supabase';
   ```

#### Issue 2: "Missing Supabase environment variables"

**Symptoms:**
- Console error: "Error: Missing Supabase environment variables!"
- Application fails to connect to database
- Blank pages or authentication errors

**Solutions:**
1. **Check environment variables are set:**
   ```bash
   # For local development, verify .env.local exists
   cat .env.local | grep VITE_SUPABASE
   
   # Should show:
   # VITE_SUPABASE_URL=https://your-project.supabase.co
   # VITE_SUPABASE_ANON_KEY=your-key
   ```

2. **For Vercel deployments:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Redeploy after adding/updating variables

3. **Verify .env.example has both variables:**
   ```bash
   grep VITE_SUPABASE .env.example
   ```

4. **Check that src/lib/supabase.ts is properly configured:**
   ```typescript
   // Should use import.meta.env (Vite) not process.env
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

#### Issue 3: "webpack-cli not found" or Webpack errors during deployment

**Symptoms:**
- Build requests webpack-cli during deployment
- "Cannot find module 'webpack-cli'" errors

**Solutions:**
1. **Ensure webpack-cli is in devDependencies:**
   ```bash
   npm install --save-dev webpack-cli
   ```

2. **Verify package.json includes:**
   ```json
   "devDependencies": {
     "webpack-cli": "^5.1.4"
   }
   ```

3. **This project uses Vite (not Webpack) for building. If you see Webpack errors:**
   - Remove any Webpack configurations if not needed
   - Ensure `npm run build` uses `vite build` (check package.json scripts)
   - The webpack.config.js in this project is for legacy compatibility only

#### Issue 4: Vercel Build Failures

**Symptoms:**
- Build succeeds locally but fails on Vercel
- "Command failed" errors in Vercel logs

**Solutions:**
1. **Check Node.js version:**
   - Ensure Vercel uses Node.js 18 or higher
   - Add to package.json:
     ```json
     "engines": {
       "node": ">=18.0.0"
     }
     ```

2. **Verify build command in Vercel:**
   - Should be: `npm run build` or `vite build`
   - Output directory: `dist`

3. **Check Vercel logs for specific errors:**
   - Go to Vercel Dashboard → Deployments → Select failed deployment
   - Review build logs for specific error messages
   - Look for missing dependencies or environment variables

4. **Test production build locally:**
   ```bash
   npm run build
   # Should complete without errors
   
   npm run preview
   # Should serve the built application
   ```

#### Issue 5: Import Errors or TypeScript Issues

**Symptoms:**
- "Cannot find module" errors
- TypeScript compilation errors during build

**Solutions:**
1. **Verify tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Check file extensions in imports:**
   ```typescript
   // Correct (no extension needed with TypeScript)
   import { supabase } from '@/lib/supabase';
   
   // Incorrect
   import { supabase } from '@/lib/supabase.ts';
   ```

3. **Reinstall TypeScript:**
   ```bash
   npm install --save-dev typescript@latest
   ```

### Getting Help

If you encounter issues not covered here:

1. **Check Vercel deployment logs** for specific error messages
2. **Review browser console** for client-side errors
3. **Verify all environment variables** are correctly set
4. **Test the build locally** before deploying:
   ```bash
   npm run build
   ```
5. **Open an issue** on GitHub with:
   - Error message and full stack trace
   - Steps to reproduce
   - Build logs (if deployment issue)
   - Environment (Node version, OS, etc.)

### Debug Mode

Enable debug logging for troubleshooting:

```bash
# Add to .env.local
VITE_DEBUG=true

# Rebuild and check console for detailed logs
npm run build
```

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
