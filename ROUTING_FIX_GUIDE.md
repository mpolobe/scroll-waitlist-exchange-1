# Routing Fix Guide

## Issue Summary

Several routes (Blog, Merchant, Book Ticket, Wallet) were redirecting to the home page due to:
1. **Missing AuthProvider** - Pages using `useAuth()` hook failed without the provider
2. **Empty Database Tables** - Pages fetching data from Supabase showed no content
3. **Database Migration** - Data needs to be migrated from Famous-AI Supabase to Vercel Supabase

---

## Fixes Applied

### 1. Added AuthProvider to App.tsx ✅

**Problem:** Pages using `useAuth()` hook (WalletDashboard, AdminDashboard, WalletAuth) threw errors because AuthProvider was not wrapped around the app.

**Solution:** Wrapped the app with `<AuthProvider>` in `src/App.tsx`

```tsx
// Before
const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
        <SmartWalletProvider>
          ...
        </SmartWalletProvider>
      </AlchemyAccountProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

// After
const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>  {/* ✅ Added */}
        <AlchemyAccountProvider config={alchemyConfig} queryClient={queryClient}>
          <SmartWalletProvider>
            ...
          </SmartWalletProvider>
        </AlchemyAccountProvider>
      </AuthProvider>  {/* ✅ Added */}
    </QueryClientProvider>
  </ThemeProvider>
);
```

---

## Remaining Issues

### 2. Database Tables Need Seeding ⚠️

**Problem:** The Vercel Supabase database (`llvprbmrnjvamjzavmhg.supabase.co`) is empty or missing tables.

**Pages Affected:**
- `/blog` - Fetches from `blog_posts` table
- `/merchant` - May need merchant data
- `/railway-booking` - Fetches from `routes` table
- Other pages fetching from Supabase

**Solution Options:**

#### Option A: Run SQL Scripts Manually in Supabase Dashboard

1. Go to Vercel Supabase Dashboard: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select project: `llvprbmrnjvamjzavmhg`
3. Go to SQL Editor
4. Run these scripts in order:

```bash
# 1. Create schema
database-schema.sql

# 2. Create blog posts table with data
create-blog-posts-table.sql

# 3. Create routes table
create-routes-table.sql

# 4. Create missing tables
create-missing-tables.sql

# 5. Ensure all tables exist
ensure-tables.sql
```

#### Option B: Use Migration Script

Run the database migration script to copy data from Famous-AI to Vercel Supabase:

```bash
# Set environment variables
export SOURCE_SUPABASE_URL="https://famous-ai-project.supabase.co"
export SOURCE_SUPABASE_KEY="your_famous_ai_service_role_key"
export TARGET_SUPABASE_URL="https://llvprbmrnjvamjzavmhg.supabase.co"
export TARGET_SUPABASE_KEY="your_vercel_service_role_key"

# Run migration
node scripts/migrate-database.js
```

#### Option C: Use GitHub Actions Workflow

The repository has a database seeding workflow that runs automatically:

1. Ensure these secrets are set in GitHub:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. The workflow `.github/workflows/deploy-vercel.yml` includes:
   ```yaml
   - name: Seed database
     if: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL != '' && secrets.SUPABASE_SERVICE_ROLE_KEY != '' }}
     env:
       NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
       SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
     run: |
       echo "🌱 Seeding database with initial data..."
       npm run seed:db
   ```

3. Push to trigger the workflow

---

## Verification Steps

### 1. Check AuthProvider Fix

Visit these pages and verify no errors in console:
- `/wallet` - Should show wallet dashboard (requires login)
- `/admin` - Should show admin dashboard (requires admin role)

### 2. Check Database Tables

Run this query in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check blog posts
SELECT COUNT(*) FROM blog_posts;

-- Check routes
SELECT COUNT(*) FROM routes;
```

Expected results:
- `blog_posts` table should have 5+ rows
- `routes` table should have data
- Other tables should exist

### 3. Test Routes

Visit each route and verify:
- ✅ `/` - Home page loads
- ✅ `/blog` - Shows blog posts (not empty)
- ✅ `/merchant` - Shows merchant portal
- ✅ `/railway-booking` - Shows booking form
- ✅ `/wallet` - Shows wallet dashboard (after login)

---

## Environment Variables

Verify these are set in Vercel:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
VITE_SUPABASE_ANON_KEY=<your_anon_key>

# For database seeding (GitHub Actions)
NEXT_PUBLIC_SUPABASE_URL=https://llvprbmrnjvamjzavmhg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```

Check in Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Verify all variables are set for Production

---

## Quick Fix Checklist

- [x] Add AuthProvider to App.tsx
- [ ] Run database schema scripts in Supabase
- [ ] Seed blog_posts table
- [ ] Seed routes table
- [ ] Verify environment variables in Vercel
- [ ] Test all routes after deployment
- [ ] Check browser console for errors

---

## Next Steps

1. **Immediate:** Deploy the AuthProvider fix
2. **Database:** Run SQL scripts in Supabase dashboard
3. **Verify:** Test all routes after deployment
4. **Monitor:** Check Vercel deployment logs for errors

---

## Support

If issues persist:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify Supabase connection in Network tab
4. Check GitHub Actions logs for seeding errors
