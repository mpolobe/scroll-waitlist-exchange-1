# Deployment Guide

This guide covers deploying Africoin to Vercel with database migration from Famous.AI.

## Prerequisites

1. **Vercel CLI** - Install globally:
   ```bash
   npm install -g vercel
   ```

2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)

3. **Database Credentials** - You need:
   - Source database (Famous.AI) credentials
   - Target database (Vercel deployment) credentials

## Quick Start

### 1. Login to Vercel

```bash
vercel login
```

### 2. Set Environment Variables

Create a `.env.local` file with your credentials:

```bash
# Source Database (Famous.AI)
SOURCE_SUPABASE_URL=https://your-famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=your-famous-ai-service-role-key

# Target Database (Vercel Deployment)
TARGET_SUPABASE_URL=https://your-vercel-project.supabase.co
TARGET_SUPABASE_KEY=your-vercel-service-role-key

# Application Environment Variables
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
VITE_SUPABASE_URL=https://your-vercel-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_vercel_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Deploy to Vercel

**Preview Deployment:**
```bash
./scripts/deploy-to-vercel.sh preview
```

**Production Deployment:**
```bash
./scripts/deploy-to-vercel.sh production
```

The script will:
1. Build the application
2. Deploy to Vercel
3. Prompt for database migration
4. Display deployment URL

## Manual Deployment

### Deploy Application Only

```bash
# Preview
vercel

# Production
vercel --prod
```

### Migrate Database Only

```bash
# Set environment variables
export SOURCE_SUPABASE_URL="https://your-famous-ai-project.supabase.co"
export SOURCE_SUPABASE_KEY="your-famous-ai-service-role-key"
export TARGET_SUPABASE_URL="https://your-vercel-project.supabase.co"
export TARGET_SUPABASE_KEY="your-vercel-service-role-key"

# Run migration
node scripts/migrate-database.js
```

## Database Migration Details

### Tables Migrated

The migration script copies the following tables:
- `profiles` - User profile information
- `users` - User accounts
- `admin_roles` - Admin role assignments
- `loyalty_points` - User loyalty points
- `points_transactions` - Points transaction history
- `favorite_posts` - User favorite posts
- `support_tickets` - Support ticket records

### Migration Process

1. **Fetch Data**: Retrieves all records from source database in batches
2. **Insert Data**: Upserts records into target database (updates existing, inserts new)
3. **Conflict Resolution**: Uses `id` field for conflict detection
4. **Batch Processing**: Processes 100 records at a time to avoid timeouts

### Migration Options

**Dry Run** (check without migrating):
```bash
DRY_RUN=true node scripts/migrate-database.js
```

**Specific Tables Only**:
Edit `scripts/migrate-database.js` and modify the `TABLES_TO_MIGRATE` array.

## Vercel Configuration

### Environment Variables

Set these in Vercel Dashboard (Settings → Environment Variables):

**Required:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ALCHEMY_API_KEY`

**Optional:**
- `VITE_ALCHEMY_GAS_POLICY_ID`
- `VITE_GEMINI_API_KEY`
- `BROWSERSTACK_USERNAME`
- `BROWSERSTACK_ACCESS_KEY`

### Build Settings

The project uses these build settings (configured in `vercel.json`):

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`

## Troubleshooting

### Build Fails

**Issue:** Build fails with dependency errors  
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Migration Fails

**Issue:** Database migration fails with permission errors  
**Solution:** Ensure you're using the **service role key**, not the anon key.

**Issue:** Migration times out  
**Solution:** Reduce `BATCH_SIZE` in `scripts/migrate-database.js`

### Deployment URL Not Working

**Issue:** Deployment succeeds but site doesn't load  
**Solution:** 
1. Check environment variables in Vercel dashboard
2. Verify build output in deployment logs
3. Check browser console for errors

### Database Connection Errors

**Issue:** Application can't connect to database  
**Solution:**
1. Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
2. Check Supabase project is active
3. Verify API keys are correct

## Post-Deployment Checklist

- [ ] Test authentication (email, phone, OAuth)
- [ ] Verify wallet connection works
- [ ] Check database queries return data
- [ ] Test payment flows
- [ ] Verify railway booking integration
- [ ] Test mobile responsiveness
- [ ] Check all legal pages load
- [ ] Verify social media links work
- [ ] Test contact form
- [ ] Check analytics tracking

## Custom Domain Setup

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for DNS propagation (up to 48 hours)

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:
- **Main branch** → Production deployment
- **Other branches** → Preview deployments

### Disable Auto-Deploy

In Vercel Dashboard:
1. Go to Settings → Git
2. Disable "Production Branch"
3. Deploy manually using CLI

## Monitoring

### Vercel Analytics

Enable in Vercel Dashboard → Analytics to track:
- Page views
- Performance metrics
- User demographics
- Traffic sources

### Error Tracking

Check deployment logs:
```bash
vercel logs [deployment-url]
```

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the working deployment
3. Click "..." → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Support

For issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review deployment logs
- Contact support at support@africoin.com

## Security Notes

⚠️ **Important:**
- Never commit `.env` files
- Use service role keys only in secure environments
- Rotate API keys regularly
- Enable 2FA on Vercel account
- Review access logs periodically
