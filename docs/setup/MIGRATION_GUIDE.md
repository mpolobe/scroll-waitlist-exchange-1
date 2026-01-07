# Database Migration Guide: Famous.AI to Supabase (Vercel)

This guide provides step-by-step instructions for migrating the database from Famous.AI to the Supabase project on Vercel.

## Overview

**Source Database:** Famous.AI (https://famous.ai/project/6928d753085881c25b2cb3fb/s)  
**Target Database:** Supabase on Vercel (https://llvprbmrnjvamjzavmhg.supabase.co)  
**Project Name:** supabase-teal-window  
**Famous.AI Edge Configuration:** Famous-AI  
**Token:** fd6b6ddc-e56a-441f-9b24-abca65e9eb37

## Prerequisites

### 1. Verify Supabase Project Status

Before starting the migration, ensure the target Supabase project is active:

1. Navigate to: https://llvprbmrnjvamjzavmhg.supabase.co
2. Confirm the project is **not paused**
3. Verify you can access the Supabase dashboard

### 2. Gather Required Credentials

You will need:

- **Source Database (Famous.AI):**
  - Supabase URL
  - Service Role Key (not the anon key)

- **Target Database (Vercel):**
  - Supabase URL: `https://llvprbmrnjvamjzavmhg.supabase.co`
  - Service Role Key (from Supabase project settings)
  - Anon Key (for application configuration)

**How to get Supabase keys:**
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the "service_role" key (secret) and "anon" key (public)

### 3. Install Dependencies

Ensure you have Node.js installed and all dependencies:

```bash
npm install
```

## Migration Steps

### Step 1: Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Source Database (Famous.AI)
SOURCE_SUPABASE_URL=https://your-famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=your_famous_ai_service_role_key

# Target Database (Vercel - supabase-teal-window)
TARGET_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
TARGET_SUPABASE_KEY=your_vercel_service_role_key

# Application Configuration (for Vercel deployment)
VITE_SUPABASE_ANON_KEY=your_vercel_anon_key
```

**Important:** 
- Use **service role keys** for migration (they have full database access)
- Use **anon keys** only for application configuration
- Never commit these files to version control

### Step 2: Verify Database Connectivity

The migration script includes built-in connection validation. Run a test:

```bash
node scripts/migrate-database.js
```

The script will:
1. Validate environment variables are set
2. Test connection to source database
3. Test connection to target database
4. Proceed with migration if connections are successful

If connection fails, you'll see detailed error messages indicating the issue.

### Step 3: Run the Migration

Execute the migration script:

```bash
npm run migrate:db
```

Or directly:

```bash
node scripts/migrate-database.js
```

### Step 4: Monitor Migration Progress

The script will display:
- Real-time progress for each table
- Number of records fetched and inserted
- Success/failure status for each table
- Final summary with totals

Expected output:
```
🚀 Starting database migration...

Source: https://your-famous-ai-project.supabase.co
Target: https://llvprbmrnjvamjzavmhg.supabase.co

🔍 Validating database connections...

Testing source database connection...
✅ Source database connection successful

Testing target database connection...
Target URL: https://llvprbmrnjvamjzavmhg.supabase.co
✅ Target database connection successful

🔄 Migrating table: profiles
──────────────────────────────────────────────────
📥 Fetching data from profiles...
   Fetched 150 records...
✅ Fetched 150 total records from profiles
📤 Inserting 150 records into profiles...
   Inserted 150/150 records...
✅ Inserted 150 records into profiles

... (continues for each table)

==================================================
📊 Migration Summary
==================================================
✅ profiles: 150 records
✅ users: 200 records
✅ admin_roles: 5 records
✅ loyalty_points: 180 records
✅ points_transactions: 350 records
✅ favorite_posts: 75 records
✅ support_tickets: 42 records
──────────────────────────────────────────────────
Total records migrated: 1002
Successful tables: 7/7
Failed tables: 0/7
==================================================

🎉 Migration completed successfully!
```

## Tables Migrated

The following tables will be migrated:

1. **profiles** - User profile information
2. **users** - User authentication data
3. **admin_roles** - Administrator role assignments
4. **loyalty_points** - User loyalty points balances
5. **points_transactions** - Points transaction history
6. **favorite_posts** - User favorited content
7. **support_tickets** - Customer support tickets

## Migration Features

### Batch Processing
- Processes records in batches of 100
- Prevents timeouts on large tables
- Provides progress updates per batch

### Upsert Strategy
- Uses `upsert` with conflict resolution on `id` field
- Updates existing records if they already exist
- Inserts new records if they don't exist
- Safe to run multiple times

### Error Handling
- Detailed error messages for each failure
- Continues with remaining tables if one fails
- Provides complete summary at the end

## Post-Migration Steps

### Step 5: Update Vercel Environment Variables

After successful migration, configure your Vercel deployment:

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Navigate to your project
3. Go to Settings → Environment Variables
4. Add/Update the following:

```
VITE_SUPABASE_ANON_KEY=your_vercel_anon_key
```

5. Redeploy the application to apply changes

### Step 6: Verify Application Integration

Test the application to ensure database integration works:

1. **Authentication:**
   - Sign up with email
   - Sign in with existing account
   - Test password reset

2. **User Profile:**
   - View profile information
   - Update profile details
   - Check loyalty points display

3. **Data Access:**
   - View transaction history
   - Check favorite posts
   - Test support ticket creation

4. **Admin Functions (if applicable):**
   - Admin dashboard access
   - User management
   - Analytics display

### Step 7: Run Automated Tests

If your project has tests, run them:

```bash
npm run test
```

Or if using specific test commands:
```bash
npm run test:e2e
npm run test:integration
```

## Troubleshooting

### Connection Failures

**Issue:** Cannot connect to source database  
**Solution:**
- Verify Famous.AI credentials are correct
- Check Famous.AI project is accessible
- Ensure network/firewall allows connections

**Issue:** Cannot connect to target database  
**Solution:**
- Confirm Supabase project is unpaused: https://llvprbmrnjvamjzavmhg.supabase.co
- Verify service role key is correct (not anon key)
- Check Supabase project settings for API restrictions

### Migration Errors

**Issue:** "Missing required environment variables"  
**Solution:**
- Ensure `.env.local` file exists in project root
- Verify all four required variables are set
- Check for typos in variable names

**Issue:** "Permission denied" errors during migration  
**Solution:**
- Confirm you're using **service role keys**, not anon keys
- Check database table permissions in Supabase dashboard
- Verify RLS (Row Level Security) policies allow service role access

**Issue:** Migration times out  
**Solution:**
- Reduce `BATCH_SIZE` in `scripts/migrate-database.js` (default: 100)
- Check internet connection stability
- Run migration during off-peak hours

**Issue:** Some tables fail to migrate  
**Solution:**
- Check table exists in target database with same schema
- Verify data types match between source and target
- Review error messages for specific issues
- Manually create missing tables if needed

### Data Validation

**Issue:** Record counts don't match  
**Solution:**
- Re-run the migration (upsert is safe to repeat)
- Check source database for changes during migration
- Verify no filters are applied in queries

**Issue:** Missing relationships/foreign keys  
**Solution:**
- Ensure tables are migrated in correct order
- Verify foreign key constraints in target database
- Check migration script includes all dependent tables

## Rollback Procedure

If migration fails or causes issues:

1. **Stop Application:** Prevent further data writes
2. **Review Logs:** Check migration output for errors
3. **Restore Backup:** If you created a backup, restore it
4. **Fix Issues:** Address the root cause
5. **Re-run Migration:** Execute migration again

**Note:** The upsert strategy means you can safely re-run the migration without duplicating data.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit credentials** to version control
2. **Use service role keys** only in secure environments
3. **Rotate API keys** after migration is complete
4. **Delete `.env.local`** from production servers
5. **Review Supabase logs** for unauthorized access
6. **Enable RLS policies** after migration
7. **Limit service role key** usage to migrations only

## Verification Checklist

After migration, verify:

- [ ] All tables migrated successfully
- [ ] Record counts match source database
- [ ] Application can connect to new database
- [ ] Authentication works correctly
- [ ] User data displays properly
- [ ] Admin functions work (if applicable)
- [ ] No console errors in browser
- [ ] API calls succeed
- [ ] Transactions can be created
- [ ] Vercel deployment uses new database

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment guidance
3. Check [Supabase Documentation](https://supabase.com/docs)
4. Review migration script logs for details
5. Contact your project administrator or open an issue on GitHub

## Additional Resources

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Database Schema Documentation](./DEPLOYMENT.md)
- [Migration Script Source](./scripts/migrate-database.js)
- [Environment Configuration Guide](./.env.example)

---

**Last Updated:** 2026-01-01  
**Migration Target:** https://llvprbmrnjvamjzavmhg.supabase.co  
**Project:** supabase-teal-window
