# Troubleshooting: Empty Database (superbase-teal-window)

## Problem

You're experiencing:
- Database name: **superbase-teal-window** (Supabase project ID: llvprbmrnjvamjzavmhg)
- Only **6 requests** in the last 24 hours
- **No tables populated** from famous.ai
- Application shows no data or empty states

## Root Cause

The database is empty because the **migration from Famous.AI has not been executed**. The migration scripts and infrastructure exist in this repository, but they require manual configuration and execution.

## Solution Overview

You need to:
1. ✅ Get credentials from Famous.AI Supabase project (source)
2. ✅ Configure environment variables
3. ✅ Run database migration script
4. ✅ Verify migration success
5. ✅ Redeploy application to use populated database

## Detailed Solution

### Option 1: Quick Fix (Recommended)

Follow the comprehensive migration guide:

📖 **[FAMOUS_AI_MIGRATION_GUIDE.md](./FAMOUS_AI_MIGRATION_GUIDE.md)**

This guide includes:
- Step-by-step instructions
- How to get Famous.AI credentials
- Environment setup
- Migration execution
- Troubleshooting tips

### Option 2: Quick Commands

If you already have credentials:

```bash
# 1. Check if everything is configured
npm run check:migration

# 2. If setup incomplete, create .env.local:
cat > .env.local << EOF
SOURCE_SUPABASE_URL=https://your-famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=your_famous_ai_service_role_key
TARGET_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
TARGET_SUPABASE_KEY=your_target_service_role_key
EOF

# 3. Load environment variables
export $(cat .env.local | xargs)

# 4. Test connection (dry-run)
node scripts/migrate-database.js --dry-run --debug

# 5. Run actual migration
npm run migrate:db

# 6. Verify success
npm run verify:migration

# 7. Redeploy application
vercel --prod
```

## Understanding the Database IDs

| Name | Purpose | Supabase Project ID |
|------|---------|---------------------|
| **superbase-teal-window** | Friendly name for target database | llvprbmrnjvamjzavmhg |
| **Famous.AI** | Source database (your original data) | (your project ID) |

The target URL is: `https://llvprbmrnjvamjzavmhg.supabase.co`

## Why Only 6 Requests?

The "6 requests" are likely from:
1. Initial setup checks
2. Test connections during deployment
3. Application health checks
4. Developer testing

This low number confirms no real data operations are happening because the tables are empty.

## Getting Famous.AI Credentials

### If You Have Access to Famous.AI:

1. **Log in to Famous.AI** (or your source Supabase project)
2. **Go to**: Project Settings → API
3. **Copy**:
   - Project URL (format: `https://xxxxx.supabase.co`)
   - Service Role Key (NOT anon key)

### If You Don't Have Access:

You need to:
1. **Contact the person who created the Famous.AI project**
2. **Ask for**:
   - Supabase project URL
   - Service role key
3. **Alternatively**: Export data manually from Famous.AI and import to target database

### If Famous.AI Project No Longer Exists:

You have two options:

**Option A: Start Fresh**
- Skip migration
- Let users recreate their data
- This is only viable if data volume is low

**Option B: Restore from Backup**
- Check if Famous.AI project has backups
- Restore backup to a temporary project
- Run migration from restored project

## What Tables Will Be Populated?

The migration will populate these tables:

1. **profiles** - User profile information
2. **users** - User account data  
3. **admin_roles** - Admin permissions
4. **loyalty_points** - Loyalty rewards data
5. **points_transactions** - Transaction history
6. **favorite_posts** - User favorites
7. **support_tickets** - Support requests

After migration, you should see:
- ✅ Increased request count in Supabase dashboard
- ✅ Data visible in table editor
- ✅ Application showing user data
- ✅ Authentication working with existing users

## Verifying Application Uses Correct Database

After migration, verify your Vercel application is configured correctly:

```bash
# Check Vercel environment variables
vercel env ls

# Should show:
# VITE_SUPABASE_URL = https://llvprbmrnjvamjzavmhg.supabase.co
# VITE_SUPABASE_ANON_KEY = (your anon key for llvprbmrnjvamjzavmhg)
```

If these are missing or wrong:

```bash
# Set correct values
vercel env add VITE_SUPABASE_URL production
# Enter: https://llvprbmrnjvamjzavmhg.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Enter: (your anon key - NOT service role key)

# Redeploy
vercel --prod
```

## Common Mistakes to Avoid

❌ **Using anon key instead of service role key for migration**
- Migration needs service role key
- Frontend needs anon key

❌ **Not loading environment variables**
- Must run: `export $(cat .env.local | xargs)`
- Or set in CI/CD secrets

❌ **Mixing up source and target**
- Source = Famous.AI (where data comes FROM)
- Target = llvprbmrnjvamjzavmhg (where data goes TO)

❌ **Committing credentials to Git**
- .env.local is in .gitignore
- Never commit credentials

❌ **Forgetting to redeploy after migration**
- Migration populates database
- Application needs redeploy to clear cache

## Verification Checklist

After migration, verify:

- [ ] All tables show data in Supabase table editor
- [ ] Request count increased significantly (hundreds/thousands)
- [ ] Verification script shows 100% match: `npm run verify:migration`
- [ ] Application shows user data when logged in
- [ ] Authentication works with existing user accounts
- [ ] No errors in browser console or Vercel logs

## Still Having Issues?

### 1. Run Diagnostic Check

```bash
node scripts/check-migration-setup.js
```

This will tell you exactly what's missing.

### 2. Check Migration Logs

```bash
# Run migration with debug output
node scripts/migrate-database.js --debug --retry-count=5

# Check for specific errors
# Common errors:
# - "Missing required environment variables" → Configure .env.local
# - "Connection failed" → Check credentials
# - "Table not found" → Verify source database has data
# - "Permission denied" → Use service role key, not anon key
```

### 3. Manual Verification

```bash
# Check source database has data
node scripts/verify-migration.js --debug

# Should show record counts > 0 for source
# If source shows 0 records, Famous.AI database might be empty
```

### 4. Get Help

If you're still stuck:

1. ✅ Run `npm run check:migration` and save output
2. ✅ Run migration with `--debug` and save logs
3. ✅ Check Supabase dashboard for any error messages
4. ✅ Create GitHub issue with:
   - Output from check-migration script
   - Migration error messages (redact credentials!)
   - Supabase dashboard screenshot (showing request count)

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run check:migration` | Verify setup is complete |
| `npm run migrate:db` | Run migration |
| `npm run verify:migration` | Verify migration success |
| `node scripts/migrate-database.js --dry-run` | Test without making changes |
| `node scripts/migrate-database.js --debug` | Run with detailed logging |
| `vercel --prod` | Redeploy application |

## Success Indicators

You'll know it's working when:

✅ Supabase dashboard shows:
- Thousands of requests (not 6)
- Tables populated with data
- Active connections

✅ Application shows:
- User profiles loading
- Transaction history
- Loyalty points
- Support tickets

✅ Verification script reports:
- 100% table match rate
- All row counts match source

## Timeline

The migration typically takes:
- **Setup**: 5-10 minutes (getting credentials, configuring)
- **Migration**: 5-30 minutes (depending on data volume)
- **Verification**: 2-5 minutes
- **Redeployment**: 3-5 minutes

**Total**: 15-50 minutes from start to finish

---

**Ready to start?** → [FAMOUS_AI_MIGRATION_GUIDE.md](./FAMOUS_AI_MIGRATION_GUIDE.md)
