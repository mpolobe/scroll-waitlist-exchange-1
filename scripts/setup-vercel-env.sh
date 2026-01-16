#!/bin/bash
# Setup Vercel Environment Variables for Africoin
# Run this script once to configure all required environment variables
#
# Prerequisites:
# 1. Create a .env.local file with your secrets (see .env.example)
# 2. Or set environment variables before running this script

set -e

echo "🚀 Setting up Vercel environment variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please log in to Vercel..."
    vercel login
fi

# Link project if not already linked
if [ ! -d ".vercel" ]; then
    echo "🔗 Linking Vercel project..."
    vercel link
fi

# Load from .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📂 Loading secrets from .env.local..."
    export $(grep -v '^#' .env.local | xargs)
elif [ -f ".env" ]; then
    echo "📂 Loading secrets from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Validate required variables
REQUIRED_VARS=(
    "VITE_AFRICAS_TALKING_API_KEY"
    "VITE_AFRICAS_TALKING_USERNAME"
    "VITE_TWILIO_ACCOUNT_SID"
    "VITE_TWILIO_AUTH_TOKEN"
    "VITE_TWILIO_PHONE_NUMBER"
)

MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "   - $VAR"
    done
    echo ""
    echo "Please set these in .env.local or as environment variables."
    echo "See .env.example for reference."
    exit 1
fi

echo "📝 Adding environment variables to Vercel..."

# Function to set env var (removes if exists, then adds)
set_vercel_env() {
    local name=$1
    local value=$2
    echo "  → $name"
    # Try to remove existing, ignore errors
    vercel env rm "$name" production -y 2>/dev/null || true
    # Add new value
    echo "$value" | vercel env add "$name" production
}

# Africa's Talking SMS (Primary)
set_vercel_env "VITE_AFRICAS_TALKING_API_KEY" "$VITE_AFRICAS_TALKING_API_KEY"
set_vercel_env "VITE_AFRICAS_TALKING_USERNAME" "$VITE_AFRICAS_TALKING_USERNAME"

# Twilio SMS (Fallback)
set_vercel_env "VITE_TWILIO_ACCOUNT_SID" "$VITE_TWILIO_ACCOUNT_SID"
set_vercel_env "VITE_TWILIO_AUTH_TOKEN" "$VITE_TWILIO_AUTH_TOKEN"
set_vercel_env "VITE_TWILIO_PHONE_NUMBER" "$VITE_TWILIO_PHONE_NUMBER"

echo ""
echo "✅ Environment variables configured!"
echo ""
echo "📋 Summary:"
echo "   - VITE_AFRICAS_TALKING_API_KEY (production)"
echo "   - VITE_AFRICAS_TALKING_USERNAME (production)"
echo "   - VITE_TWILIO_ACCOUNT_SID (production)"
echo "   - VITE_TWILIO_AUTH_TOKEN (production)"
echo "   - VITE_TWILIO_PHONE_NUMBER (production)"
echo ""

read -p "🔄 Deploy to production now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo ""
    echo "🎉 Done! Your app is deployed with SMS providers enabled."
else
    echo "ℹ️  Run 'vercel --prod' when ready to deploy."
fi
