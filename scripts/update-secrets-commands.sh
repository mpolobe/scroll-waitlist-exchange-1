#!/bin/bash

# GitHub Secrets Update Commands
# This script generates the commands you need to run to update GitHub secrets
# Copy and paste the output commands into your terminal

echo "=========================================="
echo "🔐 GitHub Secrets Update Commands"
echo "=========================================="
echo ""
echo "⚠️  IMPORTANT: First, rotate your Supabase service role key at:"
echo "   https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/settings/api"
echo ""
echo "Then run these commands in your terminal:"
echo ""
echo "=========================================="
echo "📋 Commands to Copy & Run"
echo "=========================================="
echo ""

cat << 'EOF'
# 1. Set Supabase URL
gh secret set NEXT_PUBLIC_SUPABASE_URL \
  --repo="mpolobe/scroll-waitlist-exchange-1" \
  --body="https://llvprbmrnjvamjzavmhg.supabase.co"

# 2. Set Supabase Service Role Key (replace with your NEW rotated key)
gh secret set SUPABASE_SERVICE_ROLE_KEY \
  --repo="mpolobe/scroll-waitlist-exchange-1" \
  --body="YOUR_NEW_SERVICE_ROLE_KEY_HERE"

# 3. (Optional) Set Vercel Token
gh secret set VERCEL_TOKEN \
  --repo="mpolobe/scroll-waitlist-exchange-1" \
  --body="YOUR_VERCEL_TOKEN_HERE"

# 4. (Optional) Set Vercel Org ID
gh secret set VERCEL_ORG_ID \
  --repo="mpolobe/scroll-waitlist-exchange-1" \
  --body="YOUR_VERCEL_ORG_ID_HERE"

# 5. (Optional) Set Vercel Project ID
gh secret set VERCEL_PROJECT_ID \
  --repo="mpolobe/scroll-waitlist-exchange-1" \
  --body="YOUR_VERCEL_PROJECT_ID_HERE"

EOF

echo ""
echo "=========================================="
echo "📝 Alternative: Use GitHub Web UI"
echo "=========================================="
echo ""
echo "Go to: https://github.com/mpolobe/scroll-waitlist-exchange-1/settings/secrets/actions"
echo ""
echo "Click 'New repository secret' and add:"
echo ""
echo "1. Name: NEXT_PUBLIC_SUPABASE_URL"
echo "   Value: https://llvprbmrnjvamjzavmhg.supabase.co"
echo ""
echo "2. Name: SUPABASE_SERVICE_ROLE_KEY"
echo "   Value: [Your NEW rotated service role key]"
echo ""
echo "3. (Optional) Name: VERCEL_TOKEN"
echo "   Value: [Your Vercel token from https://vercel.com/account/tokens]"
echo ""
echo "4. (Optional) Name: VERCEL_ORG_ID"
echo "   Value: [From Vercel project settings]"
echo ""
echo "5. (Optional) Name: VERCEL_PROJECT_ID"
echo "   Value: [From Vercel project settings]"
echo ""
echo "=========================================="
echo "✅ After Adding Secrets"
echo "=========================================="
echo ""
echo "Test the configuration:"
echo "  git commit --allow-empty -m 'Test secrets'"
echo "  git push origin main"
echo ""
echo "Check build status:"
echo "  https://github.com/mpolobe/scroll-waitlist-exchange-1/actions"
echo ""
