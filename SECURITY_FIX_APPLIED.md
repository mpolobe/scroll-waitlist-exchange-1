# Security Fix Applied - Supabase Credentials

**Date:** December 29, 2025  
**Status:** ✅ Fixed  
**Severity:** CRITICAL

---

## Issue

Hardcoded Supabase credentials were found in `src/lib/supabase.ts`:

```typescript
// ❌ BEFORE (INSECURE)
const supabaseUrl = 'https://xlbdtzmkncxycaddevnn.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNiMjY5M2Q3LWEzN2EtNGVmMC1hOGNmLTE2YWRjYTI1YjA1MCJ9...';
```

**Risk:**
- Credentials exposed in public repository
- Anyone can access your database
- Potential data breach
- Unauthorized access to user data

---

## Fix Applied

Updated `src/lib/supabase.ts` to use environment variables:

```typescript
// ✅ AFTER (SECURE)
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
}

const supabase = createClient(supabaseUrl, supabaseKey);
```

---

## Required Actions

### 1. ⚠️ URGENT: Rotate Supabase Credentials

The exposed credentials should be rotated immediately:

1. Go to your Supabase dashboard
2. Navigate to Settings > API
3. Generate new anon/public key
4. Update your environment variables
5. The old key should be revoked

### 2. Set Environment Variables

#### For Local Development

Create a `.env` file (already in .gitignore):

```bash
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

#### For Codemagic CI/CD

Add to Codemagic environment variables:

1. Go to Codemagic app settings
2. Navigate to Environment variables
3. Add to `supabase_credentials` group:
   - `VITE_SUPABASE_ANON_KEY`

#### For Production Deployment

Add to your hosting platform (Vercel, Netlify, etc.):

```bash
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

### 3. Verify Git History

The old credentials are still in git history. Consider:

1. Using `git filter-branch` or `BFG Repo-Cleaner` to remove from history
2. Or accept that they're compromised and rotate them (recommended)

---

## Verification

After setting environment variables, verify the app works:

```bash
# Local development
npm run dev

# Build
npm run build

# Check console for errors
# Should NOT see: "Missing Supabase configuration"
```

---

## Prevention

To prevent this in the future:

1. ✅ Never commit credentials to git
2. ✅ Always use environment variables
3. ✅ Keep `.env` in `.gitignore`
4. ✅ Use `.env.example` for documentation
5. ✅ Review code before committing
6. ✅ Use pre-commit hooks to scan for secrets

---

## Status

- ✅ Code updated to use environment variables
- ✅ .env.example already has correct variables
- ✅ .gitignore already excludes .env
- ⚠️ **ACTION REQUIRED:** Rotate Supabase credentials
- ⚠️ **ACTION REQUIRED:** Set environment variables in all environments

---

**Next Steps:**

1. Rotate Supabase credentials immediately
2. Set new credentials in all environments
3. Test the application
4. Commit and push this fix

Co-authored-by: Ona <no-reply@ona.com>
