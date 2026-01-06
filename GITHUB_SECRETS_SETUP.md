# GitHub Secrets Setup Guide

## Required GitHub Repository Secrets

To enable database seeding and deployment, add the following secrets to your GitHub repository:

### Navigation
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Required Secrets

#### Supabase Configuration
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
  - **Value:** `https://llvprbmrnjvamjzavmhg.supabase.co`
  - **Description:** Public Supabase project URL

- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
  - **Value:** Your service role key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
  - **Description:** Service role key for admin operations (database seeding)

#### Vercel Configuration (for deployment)
- **Name:** `VERCEL_TOKEN`
  - **Value:** Your Vercel authentication token
  - **Description:** Get from https://vercel.com/account/tokens

- **Name:** `VERCEL_ORG_ID`
  - **Value:** Your Vercel organization ID
  - **Description:** Found in Vercel project settings

- **Name:** `VERCEL_PROJECT_ID`
  - **Value:** Your Vercel project ID
  - **Description:** Found in Vercel project settings

## Security Best Practices

⚠️ **CRITICAL**: The credentials shared in the chat should be rotated immediately:

1. **Rotate Supabase Keys:**
   - Go to https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/settings/api
   - Reset your service role key
   - Update the GitHub secret with the new key

2. **Never Commit Secrets:**
   - Secrets should only exist in:
     - GitHub Secrets (for CI/CD)
     - Local `.env` file (gitignored)
     - Vercel environment variables (for production)

3. **Verify .gitignore:**
   - Ensure `.env` is in `.gitignore`
   - Never commit `.env` files to the repository

## Verification

After adding secrets, trigger a new build:
```bash
git commit --allow-empty -m "Test secrets configuration"
git push origin main
```

The workflow will now:
- ✅ Seed the database with initial data
- ✅ Build the project
- ✅ Deploy to Vercel

## Troubleshooting

If the workflow still fails:
1. Verify all secrets are added correctly (no extra spaces)
2. Check the Actions tab for detailed error messages
3. Ensure the secret names match exactly (case-sensitive)
