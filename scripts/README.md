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

### 2. Configure Supabase Environment Variables

```bash
./scripts/deploy-supabase-vars.sh
```

This will configure Supabase environment variables in Vercel. See [Supabase Environment Variables](#deploy-supabase-varssh) section for details.

### 3. Deploy

**Preview Deployment:**
```bash
npm run deploy
```

**Production Deployment:**
```bash
npm run deploy:prod
```

### 4. Migrate Database Only

```bash
npm run migrate:db
```

### 5. Verify Migration

After running the migration, verify data integrity:

```bash
npm run verify:migration

# With detailed comparison
node scripts/verify-migration.js --detailed

# With debug logging
node scripts/verify-migration.js --debug --detailed
```

## Scripts Overview

### `deploy-supabase-vars.sh`
**NEW** - Automated Supabase environment variable configuration for Vercel.

**Usage:**
```bash
# Using environment variables (recommended for CI/CD)
export SUPABASE_URL="https://llvprbmrnjvamjzavmhg.supabase.co"
export SUPABASE_SECRET="your_supabase_anon_key"
./scripts/deploy-supabase-vars.sh

# Or use interactive prompts
./scripts/deploy-supabase-vars.sh
```

**What it does:**
- Validates Vercel CLI installation and authentication
- Prompts for Supabase URL and Secret (or uses environment variables)
- Allows selection of target environment (production, preview, development, or all)
- Configures `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel
- Verifies deployment

**Security Notes:**
- **Never hardcode secrets in the script file**
- Script is added to `.gitignore` to prevent accidental commits
- Use environment variables for CI/CD pipelines
- Use the Supabase **Anon Key** (not Service Role Key) for frontend
- Ensure Row Level Security (RLS) is enabled on all Supabase tables

**Interactive Mode:**
The script will prompt you for:
1. Supabase URL (hidden after first 30 characters)
2. Supabase Secret/Anon Key (hidden input for security)
3. Target environment selection

**Example Output:**
```
╔════════════════════════════════════════════════════════════╗
║   Supabase Environment Variables Deployment               ║
║   Africoin Wallet - Vercel Configuration                  ║
╚════════════════════════════════════════════════════════════╝

✅ Vercel CLI installed
✅ Logged into Vercel as: user@example.com
✅ Supabase credentials provided
✅ Selected environment: production
✅ VITE_SUPABASE_URL configured
✅ VITE_SUPABASE_ANON_KEY configured
```

### `setup-deployment.sh`
Initial setup script for deployment environment.

**Usage:**
```bash
./scripts/setup-deployment.sh [--debug]
```

**Options:**
- `--debug` - Enable detailed debug logging with timestamps

**What it does:**
- Checks for Vercel CLI
- Authenticates with Vercel
- Creates environment file
- Links to Vercel project

**Debug Mode:**
When `--debug` is enabled, the script provides:
- Detailed timestamps for each operation
- Duration tracking for each step
- Additional diagnostic information
- Command execution details

**Example:**
```bash
# Normal mode
./scripts/setup-deployment.sh

# Debug mode with detailed logging
./scripts/setup-deployment.sh --debug
```

### `deploy-to-vercel.sh`
Main deployment script with database migration.

**Usage:**
```bash
./scripts/deploy-to-vercel.sh [preview|production] [--debug]
```

**Arguments:**
- `preview` - Deploy to preview environment (default)
- `production` - Deploy to production
- `--debug` - Enable detailed debug logging

**What it does:**
1. Builds the application
2. Deploys to Vercel
3. Prompts for database migration
4. Displays deployment URL

**Debug Mode:**
When `--debug` is enabled:
- Shows detailed timestamps for all operations
- Tracks duration for each deployment step
- Logs all command executions
- Displays additional diagnostic information
- Automatically passes debug flag to migration script

**Example:**
```bash
# Preview deployment
./scripts/deploy-to-vercel.sh preview

# Production deployment
./scripts/deploy-to-vercel.sh production

# Preview deployment with debug logging
./scripts/deploy-to-vercel.sh preview --debug

# Production deployment with debug logging
./scripts/deploy-to-vercel.sh production --debug
```

**Error Codes:**
- `E001` - Vercel CLI not found
- `E002` - Invalid deployment type
- `E003` - Build failed
- `E004` - Deployment failed
- `E005` - Database credentials missing
- `E006` - Database migration failed

### `migrate-database.js`
Database migration script that copies data from Famous.AI to Vercel.

**Usage:**
```bash
node scripts/migrate-database.js [--debug] [--interactive] [--retry-count=N]
```

**Options:**
- `--debug` - Enable detailed debug logging with timestamps
- `--interactive` - Enable step-by-step interactive prompts for manual control
- `--retry-count=N` - Set number of retries for failed operations (default: 3)

**Environment Variables Required:**
```bash
SOURCE_SUPABASE_URL=https://famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=service_role_key
TARGET_SUPABASE_URL=https://vercel-project.supabase.co
TARGET_SUPABASE_KEY=service_role_key
```

**What it does:**
- Fetches data from source database
- Inserts/updates data in target database
- Processes in batches of 100 records
- Provides detailed progress output
- Automatically retries failed operations
- Tracks timing for all operations

**Debug Mode:**
When `--debug` is enabled:
- Shows detailed timestamps for all operations
- Logs configuration details (excluding sensitive data)
- Displays batch-level progress
- Shows retry attempts and wait times
- Tracks duration for each operation
- Logs detailed error information

**Interactive Mode:**
When `--interactive` is enabled:
- Prompts before starting migration
- Asks for confirmation before migrating each table
- Requires user input before inserting data
- Allows manual control over migration flow

**Retry Mechanism:**
- Automatic retry with exponential backoff
- Configurable retry count (default: 3)
- Logs each retry attempt
- Maximum wait time capped at 10 seconds

**Error Codes:**
- `E001` - Missing environment variables
- `E002` - Connection failed
- `E003` - Fetch error
- `E004` - Insert error
- `E005` - Table migration failed
- `E999` - Unknown error

**Example:**
```bash
# Basic migration
node scripts/migrate-database.js

# Migration with debug logging
node scripts/migrate-database.js --debug

# Interactive migration with prompts
node scripts/migrate-database.js --interactive

# Migration with custom retry count
node scripts/migrate-database.js --retry-count=5

# All options combined
node scripts/migrate-database.js --debug --interactive --retry-count=5
```

**Tables Migrated:**
- profiles
- users
- admin_roles
- loyalty_points
- points_transactions
- favorite_posts
- support_tickets

### `verify-migration.js`
**NEW** - Database migration verification script.

**Usage:**
```bash
node scripts/verify-migration.js [--debug] [--detailed]
```

**Options:**
- `--debug` - Enable detailed debug logging with timestamps
- `--detailed` - Perform detailed data comparison including schema validation

**Environment Variables Required:**
```bash
SOURCE_SUPABASE_URL=https://famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=service_role_key
TARGET_SUPABASE_URL=https://vercel-project.supabase.co
TARGET_SUPABASE_KEY=service_role_key
```

**What it does:**
- Verifies row counts match between source and target
- Compares table structures (in detailed mode)
- Generates comprehensive verification report
- Validates data integrity post-migration
- Tracks verification timing

**Verification Report:**
The script generates a detailed report including:
- Row count comparison for each table
- Schema validation results (detailed mode)
- Overall match rate percentage
- List of issues found
- Total verification time

**Example:**
```bash
# Basic verification
npm run verify:migration

# Detailed verification with debug output
node scripts/verify-migration.js --debug --detailed

# Quick count check
node scripts/verify-migration.js
```

**Tables Verified:**
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

### Deploy With Debug Logging

```bash
# Deploy with detailed debug output
./scripts/deploy-to-vercel.sh preview --debug

# Production deployment with debug output
./scripts/deploy-to-vercel.sh production --debug
```

### Migrate Existing Deployment

```bash
# Set environment variables
export SOURCE_SUPABASE_URL="..."
export SOURCE_SUPABASE_KEY="..."
export TARGET_SUPABASE_URL="..."
export TARGET_SUPABASE_KEY="..."

# Run migration
npm run migrate:db

# Run migration with debug logging
node scripts/migrate-database.js --debug

# Run migration with interactive prompts
node scripts/migrate-database.js --interactive

# Run migration with custom retry count
node scripts/migrate-database.js --retry-count=5
```

### Interactive Migration with Manual Control

```bash
# Run migration with step-by-step prompts
node scripts/migrate-database.js --interactive

# Combine interactive mode with debug logging
node scripts/migrate-database.js --interactive --debug
```

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

### Migration fails intermittently

Use retry count option:
```bash
# Increase retry attempts for unreliable connections
node scripts/migrate-database.js --retry-count=10
```

### Debug deployment issues

Enable debug mode to see detailed logs:
```bash
# For deployment script
./scripts/deploy-to-vercel.sh preview --debug

# For migration script
node scripts/migrate-database.js --debug

# For setup script
./scripts/setup-deployment.sh --debug
```

### Understanding Error Codes

**Deployment Script (`deploy-to-vercel.sh`):**
- `E001` - Vercel CLI not installed or not in PATH
- `E002` - Invalid deployment type specified
- `E003` - Application build failed
- `E004` - Vercel deployment failed
- `E005` - Database credentials not set
- `E006` - Database migration failed

**Migration Script (`migrate-database.js`):**
- `E001` - Required environment variables missing
- `E002` - Failed to connect to database
- `E003` - Error fetching data from source
- `E004` - Error inserting data to target
- `E005` - Complete table migration failed
- `E999` - Unknown/unexpected error

**Setup Script (`setup-deployment.sh`):**
- `E001` - Failed to install Vercel CLI
- `E002` - Vercel login failed
- `E003` - Environment setup failed
- `E004` - Project linking failed

### Viewing Detailed Logs

All scripts support detailed logging with timestamps:

```bash
# Save logs to file for later analysis
./scripts/deploy-to-vercel.sh preview --debug 2>&1 | tee deployment.log

# View migration logs with timestamps
node scripts/migrate-database.js --debug 2>&1 | tee migration.log
```

## Automated Database Migration (CI/CD)

### GitHub Actions Workflow

The repository includes an automated database migration workflow that can be triggered manually from the GitHub Actions tab.

**Workflow:** `.github/workflows/database-migration.yml`

**Features:**
- Manual trigger with configurable options
- Pre-migration health checks
- Dry-run mode for testing
- Production migration with verification
- Post-migration verification
- Automated deployment to Vercel
- Artifact upload for logs and reports

**How to Use:**

1. Go to **Actions** tab in GitHub
2. Select **"Database Migration and Verification"** workflow
3. Click **"Run workflow"**
4. Choose options:
   - **Migration Type:** `dry-run` (test) or `production` (actual migration)
   - **Verify Only:** Check to only run verification without migration
5. Click **"Run workflow"** button

**Workflow Steps:**

**Dry-Run Mode:**
1. Pre-migration health check
2. Verification of current state
3. Generates detailed comparison report

**Production Mode:**
1. Pre-migration health check
2. Database migration with retry logic
3. Post-migration verification
4. Build and deploy to Vercel
5. Post-deployment smoke tests

**Verify Only Mode:**
1. Runs comprehensive verification
2. Generates detailed verification report
3. Uploads report as artifact

**Required Secrets:**

Configure these in GitHub Settings → Secrets and variables → Actions:

```bash
# Database credentials
SOURCE_SUPABASE_URL
SOURCE_SUPABASE_KEY
TARGET_SUPABASE_URL
TARGET_SUPABASE_KEY

# Vercel deployment (for production mode)
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_ALCHEMY_API_KEY
```

**Viewing Results:**

- **Workflow Logs:** Click on the workflow run to see detailed logs
- **Artifacts:** Download migration logs and verification reports from the workflow run page
- **Retention:** Logs are kept for 30 days, verification reports for 90 days

**Best Practices:**

1. Always run in **dry-run** mode first
2. Review the verification report before production migration
3. Keep artifacts for audit trail
4. Run verification regularly to ensure data consistency
5. Monitor workflow execution time for performance issues

### Production Database Readiness Check

After migration, verify database is ready:

```bash
# Run migration with interactive mode to review each table
node scripts/migrate-database.js --interactive --debug

# Check migration summary at the end for:
# - Total records migrated
# - Failed records count
# - Duration per table
# - Retry attempts
```

### Viewing Detailed Logs (Local)

All scripts support detailed logging with timestamps:

```bash
# Save logs to file for later analysis
./scripts/deploy-to-vercel.sh preview --debug 2>&1 | tee deployment.log

# View migration logs with timestamps
node scripts/migrate-database.js --debug 2>&1 | tee migration.log

# View verification logs
node scripts/verify-migration.js --debug --detailed 2>&1 | tee verification.log
```

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
