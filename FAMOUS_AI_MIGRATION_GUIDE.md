# Famous.AI Database Migration Guide

## Overview

This guide provides step-by-step instructions for migrating data from your **Famous.AI Supabase database** to your **Vercel deployment Supabase database** (project: superbase-teal-window / llvprbmrnjvamjzavmhg).

## Problem Statement

If you're experiencing:
- Only 6 requests in the last 24 hours
- No tables populated in your Vercel Supabase database
- Empty database after deployment

This is because the **database migration has not been executed yet**. This guide will help you complete the migration.

## Quick Setup (Fastest Way)

Run the automated setup script:

```bash
./scripts/setup-migration.sh
```

This will:
- Create `src/lib/supabase.ts` from template (if needed)
- Create `.env.local` from example (if needed)
- Install dependencies (if needed)
- Show you next steps

Then follow the on-screen instructions to add your credentials and run the migration.

## Prerequisites

### 1. Famous.AI Supabase Credentials

You need the following from your Famous.AI Supabase project:

- **Project URL**: Format: `https://your-project-id.supabase.co`
- **Service Role Key**: (NOT the anon key)

#### How to Get Famous.AI Credentials

1. **Log in to Famous.AI** (or your source Supabase project)
2. **Navigate to Project Settings** → **API**
3. **Copy the following:**
   - Project URL (e.g., `https://abc123xyz.supabase.co`)
   - Service Role Key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - ⚠️ **IMPORTANT**: Use the **service_role** key, not the **anon** key

### 2. Target Supabase Credentials

You need credentials for your Vercel deployment Supabase database:

- **Project URL**: `https://llvprbmrnjvamjzavmhg.supabase.co`
- **Service Role Key**: Get from your Vercel Supabase project settings

#### How to Get Target Credentials

1. **Log in to Supabase**
2. **Select your project** (ID: llvprbmrnjvamjzavmhg, Name: superbase-teal-window)
3. **Navigate to Project Settings** → **API**
4. **Copy the Service Role Key**

### 3. Required Tools

- Node.js v18 or higher
- npm installed
- Git access to this repository

## Step-by-Step Migration

### Step 1: Verify Setup

First, check if your environment is properly configured:

```bash
# Run the setup checker
node scripts/check-migration-setup.js
```

This will verify:
- Node.js version
- Required dependencies
- Environment variables
- Migration scripts

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
# Source Database (Famous.AI)
SOURCE_SUPABASE_URL=https://YOUR-FAMOUS-AI-PROJECT-ID.supabase.co
SOURCE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-SERVICE-ROLE-KEY

# Target Database (Vercel - superbase-teal-window)
TARGET_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
TARGET_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR-SERVICE-ROLE-KEY
```

⚠️ **Security Notes:**
- Never commit `.env.local` to Git (already in .gitignore)
- Use **service_role** keys, not anon keys
- Keep these credentials secure

### Step 3: Load Environment Variables

```bash
# Load the environment variables into your shell
export $(cat .env.local | xargs)
```

Or on Windows PowerShell:
```powershell
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2])
    }
}
```

### Step 4: Verify Configuration

Run the setup checker again to confirm everything is configured:

```bash
node scripts/check-migration-setup.js
```

You should see: ✅ Setup is COMPLETE!

### Step 5: Test Connection (Dry Run)

Before migrating data, test that both databases are accessible:

```bash
# This will connect to both databases and show record counts
# without making any changes
node scripts/migrate-database.js --dry-run --debug
```

Expected output:
- Connection to source database successful
- Connection to target database successful
- Record counts from source database

### Step 6: Verify Current State

Check the current state of both databases:

```bash
npm run verify:migration
```

This will show:
- Row counts in source (Famous.AI) database
- Row counts in target (Vercel) database
- Any discrepancies

### Step 7: Run the Migration

Now you're ready to migrate the data:

```bash
# Run migration with enhanced retry logic
node scripts/migrate-database.js --debug --retry-count=5
```

The script will:
1. Connect to both databases
2. Fetch data from Famous.AI (source)
3. Insert data into Vercel database (target)
4. Verify the migration
5. Show a summary report

### Step 8: Verify Migration Success

After migration completes, verify the data integrity:

```bash
# Detailed verification with schema comparison
node scripts/verify-migration.js --detailed --debug
```

Look for:
- ✅ All table counts match
- ✅ No schema mismatches
- ✅ Verification report shows 100% match

### Step 9: Update GitHub Secrets (Optional - For CI/CD)

If you want to use GitHub Actions for future migrations:

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `SOURCE_SUPABASE_URL`
   - `SOURCE_SUPABASE_KEY`
   - `TARGET_SUPABASE_URL`
   - `TARGET_SUPABASE_KEY`

Then you can use the GitHub Actions workflow:
1. Go to Actions tab
2. Select "Database Migration and Verification"
3. Click "Run workflow"
4. Choose "dry-run" first, then "production"

## Tables Migrated

The migration will copy these tables from Famous.AI to Vercel Supabase:

1. **profiles** - User profile information
2. **users** - User account data
3. **admin_roles** - Administrative role assignments
4. **loyalty_points** - Loyalty program data
5. **points_transactions** - Points transaction history
6. **favorite_posts** - User favorites
7. **support_tickets** - Customer support tickets

## Troubleshooting

### Error: "Missing required environment variables"

**Solution:**
- Verify `.env.local` file exists and has correct format
- Ensure you've loaded the environment variables: `export $(cat .env.local | xargs)`
- Run `node scripts/check-migration-setup.js` to diagnose

### Error: "Connection failed" or timeout errors

**Solution:**
- Verify Supabase project IDs are correct
- Check that service role keys are valid (not anon keys)
- Ensure your IP is not blocked by Supabase
- Try increasing retry count: `--retry-count=10`

### Error: "Table not found" or "Permission denied"

**Solution:**
- Ensure tables exist in the source database
- Verify service role key has proper permissions
- Check that Row Level Security (RLS) policies allow service role access

### Count Mismatch After Migration

**Solution:**
- Check migration logs for errors
- Ensure no data was added during migration
- Re-run migration (upsert strategy is safe)
- Verify with: `npm run verify:migration --detailed`

### Still Seeing "Only 6 requests in last 24 hours"

This likely means:
1. Migration hasn't been run yet → Follow this guide
2. Application isn't configured to use target database → Check `VITE_SUPABASE_URL` in Vercel environment
3. Frontend cache needs to be cleared → Redeploy application

**Solution:**
```bash
# After successful migration, redeploy to Vercel
vercel --prod

# Or use GitHub Actions deploy workflow
```

## Verifying Application Is Using Correct Database

After migration, ensure your application is using the target database:

1. Check Vercel environment variables:
   ```bash
   vercel env ls
   ```

2. Verify these are set:
   - `VITE_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=<your-anon-key-for-llvprbmrnjvamjzavmhg>`

3. If missing or incorrect, update them:
   ```bash
   vercel env add VITE_SUPABASE_URL production
   # Enter: https://llvprbmrnjvamjzavmhg.supabase.co
   
   vercel env add VITE_SUPABASE_ANON_KEY production
   # Enter: <your-anon-key>
   ```

4. Redeploy the application:
   ```bash
   vercel --prod
   ```

## Quick Reference Commands

```bash
# 1. Check setup
node scripts/check-migration-setup.js

# 2. Load environment variables
export $(cat .env.local | xargs)

# 3. Test connection (dry-run)
node scripts/migrate-database.js --dry-run --debug

# 4. Verify current state
npm run verify:migration

# 5. Run migration
npm run migrate:db

# 6. Verify success
npm run verify:migration --detailed

# 7. Redeploy application
vercel --prod
```

## Success Criteria

Migration is successful when:
- ✅ All tables migrated without errors
- ✅ Row counts match between source and target
- ✅ Verification report shows 100% match
- ✅ Application can access data from target database
- ✅ Request count increases in Supabase dashboard
- ✅ No errors in application logs

## Support

For additional help:
- Review `DATABASE_MIGRATION_RUNBOOK.md` for detailed procedures
- Check `scripts/README.md` for script documentation
- See `DATABASE_MIGRATION_VERIFICATION_REPORT.md` for verification details

## Security Best Practices

1. ✅ Never commit credentials to Git
2. ✅ Use service role keys for migration (not anon keys)
3. ✅ Rotate keys after migration if needed
4. ✅ Enable Row Level Security (RLS) on all tables
5. ✅ Use anon keys in frontend, service role keys in backend only
6. ✅ Monitor Supabase dashboard for suspicious activity
7. ✅ Keep migration logs for audit trail

## Next Steps After Migration

Once migration is complete:

1. **Test the application** thoroughly
2. **Monitor database usage** in Supabase dashboard
3. **Set up regular backups** for the target database
4. **Document any custom RLS policies** needed
5. **Update team on new database location**
6. **Archive Famous.AI project** (if no longer needed)

---

**Need Help?**

If you're still experiencing issues after following this guide:
1. Run `node scripts/check-migration-setup.js` and share the output
2. Check migration logs for specific errors
3. Verify Supabase dashboard shows expected data
4. Create an issue in the GitHub repository with details
