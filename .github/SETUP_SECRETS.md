# GitHub Secrets Setup Guide

To enable automatic database seeding during GitHub CI/CD deployments to Vercel, you need to configure the following secrets.

## Required Secrets

Navigate to your GitHub repository:
**Settings → Secrets and variables → Actions → New repository secret**

### 1. Supabase Credentials

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** `https://llvprbmrnjvamjzavmhg.supabase.co`
- **Description:** Your Vercel Supabase project URL
- **Usage:** Public-facing Supabase URL for client connections

#### `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Your Supabase service_role key (secret)
- **Where to find it:**
  1. Go to: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/settings/api-keys
  2. Copy the `service_role` key (NOT the anon key)
  3. This key has admin privileges - keep it secret!
- **Description:** Admin key for database write operations

### 2. Vercel Credentials

#### `VERCEL_TOKEN`
- **Value:** Your Vercel API token
- **Where to find it:**
  1. Go to: https://vercel.com/account/tokens
  2. Create new token or use existing one
  3. Copy the token value
- **Description:** Authentication for Vercel CLI deployments

#### `VERCEL_ORG_ID`
- **Value:** Your Vercel organization/team ID
- **Where to find it:**
  1. Go to: https://vercel.com/account
  2. Find your organization settings
  3. Copy the Organization ID
- **Description:** Identifies your Vercel organization

#### `VERCEL_PROJECT_ID`
- **Value:** `prj_GSeQ0bBsAVvxVLmIctWACvR4Zoch` or `prj_YBvHqDMMB6gX0q7eFSveVW97nQoQ`
- **Where to find it:**
  1. Go to your Vercel project settings
  2. Find "Project ID" in General settings
  3. Copy the ID (starts with `prj_`)
- **Description:** Identifies your specific Vercel project

## Verification

After adding all secrets, verify they're configured:

```bash
# Go to: https://github.com/mpolobe/scroll-waitlist-exchange-1/settings/secrets/actions
```

You should see:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ✅ VERCEL_TOKEN
- ✅ VERCEL_ORG_ID
- ✅ VERCEL_PROJECT_ID

## Testing

After setup, trigger a deployment:

1. **Manual trigger:**
   - Go to Actions tab
   - Select "Deploy to Vercel with Database Seeding"
   - Click "Run workflow"

2. **Automatic trigger:**
   - Push to `main` or `develop` branch
   - Create a pull request

## Workflows

### `deploy-vercel.yml`
Full deployment pipeline that:
1. Seeds database
2. Builds project
3. Deploys to Vercel
4. Comments on PRs with deployment URL

### `seed-database.yml`
Standalone database seeding workflow that can be:
- Run manually via workflow_dispatch
- Called by other workflows
- Scheduled for periodic reseeding

## Security Notes

⚠️ **Never commit these values to your repository!**
- All sensitive credentials must be stored as GitHub Secrets
- Service role keys have full database access
- Vercel tokens can deploy to your projects

✅ **Best Practices:**
- Rotate tokens periodically
- Use separate tokens for different environments
- Monitor workflow runs for unauthorized access
- Enable 2FA on both GitHub and Vercel accounts

## Troubleshooting

### Database seeding fails
- Verify Supabase credentials are correct
- Check if tables exist in Supabase
- Review workflow logs in GitHub Actions

### Vercel deployment fails
- Verify Vercel token has deployment permissions
- Check project ID matches your Vercel project
- Ensure organization ID is correct

### Secrets not found
- Secrets must be added to repository settings (not organization)
- Secret names are case-sensitive
- Restart workflow after adding secrets
