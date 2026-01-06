# Quick Setup Guide

## 🚨 URGENT: Rotate Your Credentials

The credentials you shared in the chat are now public and should be rotated immediately:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/settings/api)
2. Click "Reset" on the Service Role Key
3. Copy the new key

## 📝 Add GitHub Secrets

Go to: `https://github.com/mpolobe/scroll-waitlist-exchange-1/settings/secrets/actions`

Click **"New repository secret"** and add:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
https://llvprbmrnjvamjzavmhg.supabase.co
```

### 2. SUPABASE_SERVICE_ROLE_KEY
```
[Your NEW service role key after rotation]
```

### 3. VERCEL_TOKEN (if deploying to Vercel)
Get from: https://vercel.com/account/tokens

### 4. VERCEL_ORG_ID (if deploying to Vercel)
Get from: Vercel Project Settings → General

### 5. VERCEL_PROJECT_ID (if deploying to Vercel)
Get from: Vercel Project Settings → General

## ✅ Test the Setup

After adding secrets:
```bash
git commit --allow-empty -m "Test GitHub secrets"
git push origin main
```

Check the Actions tab to see if the build succeeds.

## 🔐 Local Development

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials (never commit this file).

## 📚 More Details

See [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) for detailed instructions.
