#!/bin/bash
set -e

# GitHub Secrets Update Script
# This script updates GitHub repository secrets using the GitHub CLI
# Run once to configure all required secrets for CI/CD

echo "=========================================="
echo "🔐 GitHub Secrets Update Script"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo ""
    echo "Install it with:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   See https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: See https://github.com/cli/cli#installation"
    echo ""
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI"
    echo ""
    echo "Run: gh auth login"
    echo ""
    exit 1
fi

# Get repository info
REPO_OWNER="mpolobe"
REPO_NAME="scroll-waitlist-exchange-1"
REPO="$REPO_OWNER/$REPO_NAME"

echo "Repository: $REPO"
echo ""

# Supabase Configuration
echo "📝 Supabase Configuration"
echo "----------------------------------------"

read -p "Enter NEXT_PUBLIC_SUPABASE_URL [https://llvprbmrnjvamjzavmhg.supabase.co]: " SUPABASE_URL
SUPABASE_URL=${SUPABASE_URL:-https://llvprbmrnjvamjzavmhg.supabase.co}

echo ""
echo "⚠️  IMPORTANT: Use your NEW rotated service role key"
echo "    Get it from: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/settings/api"
echo ""
read -sp "Enter SUPABASE_SERVICE_ROLE_KEY (hidden): " SERVICE_ROLE_KEY
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Service role key is required"
    exit 1
fi

# Optional: Vercel Configuration
echo ""
echo "📝 Vercel Configuration (Optional - press Enter to skip)"
echo "----------------------------------------"

read -p "Enter VERCEL_TOKEN (or press Enter to skip): " VERCEL_TOKEN
read -p "Enter VERCEL_ORG_ID (or press Enter to skip): " VERCEL_ORG_ID
read -p "Enter VERCEL_PROJECT_ID (or press Enter to skip): " VERCEL_PROJECT_ID

# Confirm before updating
echo ""
echo "=========================================="
echo "📋 Summary of secrets to update:"
echo "=========================================="
echo "✓ NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL"
echo "✓ SUPABASE_SERVICE_ROLE_KEY: [hidden]"
[ -n "$VERCEL_TOKEN" ] && echo "✓ VERCEL_TOKEN: [hidden]" || echo "⊘ VERCEL_TOKEN: (skipped)"
[ -n "$VERCEL_ORG_ID" ] && echo "✓ VERCEL_ORG_ID: $VERCEL_ORG_ID" || echo "⊘ VERCEL_ORG_ID: (skipped)"
[ -n "$VERCEL_PROJECT_ID" ] && echo "✓ VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID" || echo "⊘ VERCEL_PROJECT_ID: (skipped)"
echo ""

read -p "Continue with updating secrets? (y/N): " CONFIRM
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 0
fi

echo ""
echo "🚀 Updating secrets..."
echo ""

# Update Supabase secrets
echo "Setting NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | gh secret set NEXT_PUBLIC_SUPABASE_URL --repo="$REPO"

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "$SERVICE_ROLE_KEY" | gh secret set SUPABASE_SERVICE_ROLE_KEY --repo="$REPO"

# Update Vercel secrets if provided
if [ -n "$VERCEL_TOKEN" ]; then
    echo "Setting VERCEL_TOKEN..."
    echo "$VERCEL_TOKEN" | gh secret set VERCEL_TOKEN --repo="$REPO"
fi

if [ -n "$VERCEL_ORG_ID" ]; then
    echo "Setting VERCEL_ORG_ID..."
    echo "$VERCEL_ORG_ID" | gh secret set VERCEL_ORG_ID --repo="$REPO"
fi

if [ -n "$VERCEL_PROJECT_ID" ]; then
    echo "Setting VERCEL_PROJECT_ID..."
    echo "$VERCEL_PROJECT_ID" | gh secret set VERCEL_PROJECT_ID --repo="$REPO"
fi

echo ""
echo "=========================================="
echo "✅ Secrets updated successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Trigger a build to test the secrets:"
echo "   git commit --allow-empty -m 'Test secrets configuration'"
echo "   git push origin main"
echo ""
echo "2. Check the Actions tab to verify the build succeeds:"
echo "   https://github.com/$REPO/actions"
echo ""
echo "3. Delete this script for security:"
echo "   rm scripts/update-github-secrets.sh"
echo ""
