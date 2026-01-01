# Deployment Scripts

This directory contains scripts for deploying Africoin to Vercel and migrating the database.

## Quick Start

### 1. Setup (First Time Only)

```bash
./scripts/setup-deployment.sh
```

This will:
- Install Vercel CLI if needed
- Login to Vercel
- Create `.env.local` from template
- Link to Vercel project

### 2. Deploy

**Preview Deployment:**
```bash
npm run deploy
```

**Production Deployment:**
```bash
npm run deploy:prod
```

### 3. Migrate Database Only

```bash
npm run migrate:db
```

## Scripts Overview

### `setup-deployment.sh`
Initial setup script for deployment environment.

**Usage:**
```bash
./scripts/setup-deployment.sh
```

**What it does:**
- Checks for Vercel CLI
- Authenticates with Vercel
- Creates environment file
- Links to Vercel project

### `deploy-to-vercel.sh`
Main deployment script with database migration.

**Usage:**
```bash
./scripts/deploy-to-vercel.sh [preview|production]
```

**Arguments:**
- `preview` - Deploy to preview environment (default)
- `production` - Deploy to production

**What it does:**
1. Builds the application
2. Deploys to Vercel
3. Prompts for database migration
4. Displays deployment URL

**Example:**
```bash
# Preview deployment
./scripts/deploy-to-vercel.sh preview

# Production deployment
./scripts/deploy-to-vercel.sh production
```

### `migrate-database.js`
Database migration script that copies data from Famous.AI to Vercel.

**Usage:**
```bash
node scripts/migrate-database.js
```

**Environment Variables Required:**
```bash
SOURCE_SUPABASE_URL=https://famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=service_role_key
TARGET_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
TARGET_SUPABASE_KEY=service_role_key
```

**What it does:**
- Connects to source (Famous.AI) and target (Vercel) databases
- Validates database connectivity before migration
- Fetches data from source database
- Inserts/updates data in target database
- Processes in batches of 100 records
- Provides detailed progress output

For detailed migration instructions, see [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)

**Tables Migrated:**
- profiles
- users
- admin_roles
- loyalty_points
- points_transactions
- favorite_posts
- support_tickets

## Environment Variables

### Required for Deployment

Set these in Vercel Dashboard:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ALCHEMY_API_KEY=your_alchemy_key
```

### Required for Migration

Set these locally in `.env.local`:

```bash
SOURCE_SUPABASE_URL=source_database_url
SOURCE_SUPABASE_KEY=source_service_role_key
TARGET_SUPABASE_URL=target_database_url
TARGET_SUPABASE_KEY=target_service_role_key
```

## Common Tasks

### Deploy Without Migration

```bash
# Just deploy, skip database migration
./scripts/deploy-to-vercel.sh preview
# When prompted, answer 'N' to skip migration
```

### Migrate Existing Deployment

```bash
# Set environment variables
export SOURCE_SUPABASE_URL="..."
export SOURCE_SUPABASE_KEY="..."
export TARGET_SUPABASE_URL="https://llvprbmrnjvamjzavmhg.supabase.co"
export TARGET_SUPABASE_KEY="..."

# Run migration
npm run migrate:db
```

For detailed migration instructions, see [MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md)

### Check Deployment Status

```bash
vercel ls
```

### View Deployment Logs

```bash
vercel logs [deployment-url]
```

### Rollback Deployment

```bash
vercel rollback
```

## Troubleshooting

### "Vercel CLI not found"

Install Vercel CLI:
```bash
npm install -g vercel
```

### "Permission denied" when running scripts

Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### Migration fails with "Invalid API key"

Ensure you're using **service role keys**, not anon keys:
- Service role key: `eyJ...` (starts with service_role)
- Anon key: `eyJ...` (starts with anon)

### Build fails

Clear cache and rebuild:
```bash
rm -rf node_modules dist
npm install
npm run build
```

### Environment variables not working

1. Check `.env.local` exists and has correct values
2. Verify variables are set in Vercel Dashboard
3. Redeploy after changing variables

## Security Notes

⚠️ **Important:**
- Never commit `.env.local` or `.env`
- Use service role keys only in secure environments
- Rotate API keys regularly
- Review Vercel access logs

## Support

For detailed documentation, see:
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

For issues, contact: support@africoin.com
