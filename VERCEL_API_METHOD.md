# Using Vercel API to Get Famous-AI Credentials

If Famous-AI is deployed on Vercel, you can use the Vercel API to retrieve the Supabase keys!

## Step 1: Get Your Vercel Token

1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Give it a name like "Database Migration"
4. Copy the token

## Step 2: List Your Projects (Optional)

```bash
export VERCEL_TOKEN="your-vercel-token-here"
node get-famous-ai-env.js --list-projects
```

This will show all your Vercel projects and their IDs.

## Step 3: Get Environment Variables

```bash
# If Famous-AI is in the same project (scroll-waitlist-exchange-1)
node get-famous-ai-env.js

# Or specify a different Famous-AI project ID
export VERCEL_PROJECT_ID="famous-ai-project-id"
node get-famous-ai-env.js
```

## Step 4: Use the Keys for Migration

Once you find the Supabase keys in the output, export them:

```bash
export FAMOUS_AI_SUPABASE_KEY="the-service-role-key-from-vercel"
bash run-migration.sh
```

Choose option 1 for direct migration.

## Alternative: Check Vercel Dashboard

You can also manually check:
1. Go to: https://vercel.com/dashboard
2. Select your Famous-AI project
3. Go to Settings → Environment Variables
4. Look for SUPABASE_SERVICE_ROLE_KEY or similar
