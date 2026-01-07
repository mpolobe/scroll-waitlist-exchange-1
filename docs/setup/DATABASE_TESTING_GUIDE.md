# Database Migration Testing Guide

This guide explains how to verify that your application is correctly connected to the Vercel Supabase database and not the Famous.ai database.

## Quick Test

Run the automated test suite:

```bash
npm run test:database
```

This will check:
1. ✅ Environment variables point to Vercel endpoints
2. ✅ Source code configuration is correct
3. ✅ Database connectivity
4. ✅ Table schema exists
5. ✅ Records are present

## Setup Required

### Step 1: Configure Environment Variables

You need to set your Vercel Supabase credentials in the `.env` file:

```bash
# Edit .env file
VITE_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
VITE_SUPABASE_ANON_KEY=<your_vercel_anon_key>
```

**Where to get your Vercel Supabase Anon Key:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `supabase-teal-window`
3. Navigate to **Settings** → **API**
4. Copy the **anon/public** key
5. Paste it into your `.env` file

### Step 2: Verify Database Endpoints

The test script will automatically verify:

**✅ Correct (Vercel):**
- URL: `https://llvprbmrnjvamjzavmhg.supabase.co`
- Project Ref: `llvprbmrnjvamjzavmhg`

**❌ Incorrect (Famous.ai):**
- URL: `https://xlbdtzmkncxycaddevnn.supabase.co`
- Project Ref: `xlbdtzmkncxycaddevnn`

## Manual Verification Methods

### Method 1: Check Environment Variables

```bash
# View current configuration
grep VITE_SUPABASE_URL .env

# Should output:
# VITE_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
```

### Method 2: Check Application Code

Verify [src/lib/supabase.ts](src/lib/supabase.ts):

```typescript
// Should have Vercel URL as fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
  'https://llvprbmrnjvamjzavmhg.supabase.co';
```

### Method 3: Test Database Connection

Run a connection test:

```bash
node scripts/test-database-connection.js
```

### Method 4: Check Browser Console

1. Start your dev server: `npm run dev`
2. Open browser console (F12)
3. Run:
   ```javascript
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```
4. Should show: `https://llvprbmrnjvamjzavmhg.supabase.co`

### Method 5: Network Tab Inspection

1. Open your app in browser
2. Open DevTools → Network tab
3. Filter by "supabase"
4. Check request URLs - they should all go to `llvprbmrnjvamjzavmhg.supabase.co`

### Method 6: Test API Query

```bash
# Replace with your actual anon key
curl https://llvprbmrnjvamjzavmhg.supabase.co/rest/v1/profiles \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Verify Migration Completed

After setting up your environment, verify the migration:

```bash
npm run verify:migration
```

This checks:
- Row counts match between source and target
- All tables exist
- Schema structure is correct

## Production Deployment Checklist

Before deploying to production, ensure:

- [ ] `.env` file has Vercel credentials locally
- [ ] Vercel project has environment variables set:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Test suite passes: `npm run test:database`
- [ ] Migration verified: `npm run verify:migration`
- [ ] No hardcoded Famous.ai URLs in code
- [ ] Application successfully queries Vercel database

## Setting Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `VITE_SUPABASE_URL` = `https://llvprbmrnjvamjzavmhg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `<your_anon_key>`
5. Select environments: Production, Preview, Development
6. Click **Save**
7. Redeploy your application

## Common Issues

### Issue 1: Still Connecting to Famous.ai

**Symptoms:**
- Test shows Famous.ai URL
- Network requests go to `xlbdtzmkncxycaddevnn.supabase.co`

**Solution:**
1. Update `.env` file with Vercel URL
2. Restart dev server
3. Clear browser cache
4. Re-run test: `npm run test:database`

### Issue 2: Empty Database

**Symptoms:**
- Connection succeeds
- Tables exist but are empty
- Record count is 0

**Solution:**
Run the migration script:
```bash
npm run migrate:database
```

### Issue 3: Missing Tables

**Symptoms:**
- "relation does not exist" errors
- Schema verification fails

**Solution:**
1. Ensure you have run migrations
2. Check Supabase dashboard for table structure
3. Run database migrations manually if needed

### Issue 4: Authentication Errors

**Symptoms:**
- "Invalid API key" errors
- 401 Unauthorized responses

**Solution:**
1. Verify anon key is correct
2. Check Supabase project settings
3. Ensure key matches the correct project (Vercel, not Famous.ai)

## Database Migration Commands

```bash
# Test migration setup (dry-run)
node scripts/migrate-database.js --dry-run

# Run actual migration
npm run migrate:database

# Verify migration completed
npm run verify:migration

# Test database connection
npm run test:database
```

## Environment Variable Hierarchy

The application checks for Supabase configuration in this order:

1. **Environment variables** (highest priority)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

2. **Fallback in code** (if env vars not set)
   - Hardcoded Vercel URL: `https://llvprbmrnjvamjzavmhg.supabase.co`

This ensures you're always connected to Vercel in production.

## Success Indicators

You know your migration is successful when:

✅ Test suite shows: "All tests passed! Your app is connected to Vercel Supabase."
✅ All network requests go to `llvprbmrnjvamjzavmhg.supabase.co`
✅ Database queries return data
✅ No Famous.ai URLs in environment or code
✅ Migration verification shows matching record counts

## Need Help?

If you encounter issues:

1. Run diagnostic test: `npm run test:database`
2. Check the output for specific failures
3. Follow the suggested fixes in the output
4. Refer to the Common Issues section above
5. Check [DATABASE_MIGRATION_GUIDE.md](DATABASE_MIGRATION_GUIDE.md) for detailed migration steps

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Migration Guide](DATABASE_MIGRATION_GUIDE.md)
- [Migration Runbook](DATABASE_MIGRATION_RUNBOOK.md)
