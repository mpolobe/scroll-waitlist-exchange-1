#!/bin/bash

# Gemini API Key Setup Script for Africoin Wallet
# Adds Gemini API key to Codemagic and GitHub

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Gemini API Configuration
# Note: Replace with your actual Gemini API key from https://aistudio.google.com/
GEMINI_API_KEY="${VITE_GEMINI_API_KEY:-your_gemini_api_key_here}"
GEMINI_PROJECT_NAME="AfriCoin-Sovereign-Key"
GEMINI_PROJECT_NUMBER="5780586642"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Gemini API Key Setup for Africoin Wallet                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo "📋 Gemini API Details:"
echo "   Project: $GEMINI_PROJECT_NAME"
echo "   Project Number: $GEMINI_PROJECT_NUMBER"
echo "   API Key: ${GEMINI_API_KEY:0:10}... (provide via VITE_GEMINI_API_KEY environment variable)"
echo ""

# Validate API key is provided
if [ "$GEMINI_API_KEY" = "your_gemini_api_key_here" ] || [ -z "$GEMINI_API_KEY" ]; then
    echo -e "${RED}❌ ERROR: GEMINI_API_KEY not set${NC}"
    echo ""
    echo "Please set your Gemini API key:"
    echo "  export VITE_GEMINI_API_KEY='your_actual_api_key'"
    echo ""
    echo "Or add it to .env.local:"
    echo "  echo 'VITE_GEMINI_API_KEY=your_actual_api_key' >> .env.local"
    echo ""
    echo "Get your API key from: https://aistudio.google.com/"
    exit 1
fi
echo ""

# ============================================================================
# CODEMAGIC SETUP
# ============================================================================

if [ -z "$CODEMAGIC_API_TOKEN" ]; then
    echo -e "${YELLOW}⚠️  CODEMAGIC_API_TOKEN not set${NC}"
    echo ""
    echo "To add to Codemagic automatically:"
    echo "1. Go to https://codemagic.io/user/settings"
    echo "2. Navigate to 'Integrations' → 'Codemagic API'"
    echo "3. Generate a new API token"
    echo "4. Run: export CODEMAGIC_API_TOKEN='your-token-here'"
    echo "5. Run this script again"
    echo ""
    echo "Or add manually at: https://codemagic.io/apps"
    echo ""
    SKIP_CODEMAGIC=true
else
    echo -e "${GREEN}✅ CODEMAGIC_API_TOKEN found${NC}"
    
    # Get app ID (you'll need to set this)
    APP_ID="${CODEMAGIC_APP_ID:-your_app_id_here}"
    
    if [ "$APP_ID" = "your_app_id_here" ]; then
        echo -e "${YELLOW}⚠️  CODEMAGIC_APP_ID not set${NC}"
        echo "Run: export CODEMAGIC_APP_ID='your-app-id'"
        echo ""
        SKIP_CODEMAGIC=true
    else
        echo ""
        echo "Adding Gemini API key to Codemagic environment groups..."
        echo ""
        
        # Add to africoin_env_vars group
        echo "→ Adding VITE_GEMINI_API_KEY to africoin_env_vars group..."
        curl -s -X POST \
            -H "x-auth-token: $CODEMAGIC_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"key\": \"VITE_GEMINI_API_KEY\",
                \"value\": \"$GEMINI_API_KEY\",
                \"group\": \"africoin_env_vars\",
                \"secure\": true
            }" \
            "https://api.codemagic.io/apps/$APP_ID/variables" > /dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}  ✅ Added to africoin_env_vars${NC}"
        else
            echo -e "${RED}  ❌ Failed to add to africoin_env_vars${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}✅ Codemagic credentials configured!${NC}"
    fi
fi

# ============================================================================
# GITHUB SECRETS SETUP
# ============================================================================

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""

if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) not installed${NC}"
    echo ""
    echo "To add to GitHub automatically:"
    echo "1. Install gh CLI: https://cli.github.com/"
    echo "2. Run: gh auth login"
    echo "3. Run this script again"
    echo ""
    echo "Or add manually at:"
    echo "https://github.com/mpolobe/scroll-waitlist-exchange-1/settings/secrets/actions"
    echo ""
    SKIP_GITHUB=true
else
    echo -e "${GREEN}✅ GitHub CLI detected${NC}"
    
    if ! gh auth status &> /dev/null; then
        echo -e "${YELLOW}⚠️  Not authenticated with GitHub${NC}"
        echo "Run: gh auth login"
        echo ""
        SKIP_GITHUB=true
    else
        echo ""
        echo "Adding Gemini API key to GitHub Secrets..."
        echo ""
        
        echo "→ Adding VITE_GEMINI_API_KEY..."
        echo "$GEMINI_API_KEY" | gh secret set VITE_GEMINI_API_KEY
        echo -e "${GREEN}  ✅ VITE_GEMINI_API_KEY added${NC}"
        
        echo ""
        echo -e "${GREEN}✅ GitHub Secrets configured!${NC}"
    fi
fi

# ============================================================================
# LOCAL .ENV SETUP
# ============================================================================

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "Updating local .env.local file..."

if [ -f ".env.local" ]; then
    if grep -q "VITE_GEMINI_API_KEY" .env.local; then
        echo -e "${YELLOW}⚠️  VITE_GEMINI_API_KEY already in .env.local${NC}"
        echo "   Update manually if needed"
    else
        echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" >> .env.local
        echo -e "${GREEN}✅ Added VITE_GEMINI_API_KEY to .env.local${NC}"
    fi
else
    echo "VITE_GEMINI_API_KEY=$GEMINI_API_KEY" > .env.local
    echo -e "${GREEN}✅ Created .env.local with VITE_GEMINI_API_KEY${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Setup Complete!                                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ -z "$SKIP_CODEMAGIC" ]; then
    echo -e "${GREEN}✅ Codemagic:${NC} VITE_GEMINI_API_KEY added to africoin_env_vars"
else
    echo -e "${YELLOW}⚠️  Codemagic:${NC} Manual setup required"
    echo "   → https://codemagic.io/apps"
    echo "   → Add to 'africoin_env_vars' group:"
    echo "   → Variable: VITE_GEMINI_API_KEY (secure)"
    echo "   → Value: $GEMINI_API_KEY"
fi

echo ""

if [ -z "$SKIP_GITHUB" ]; then
    echo -e "${GREEN}✅ GitHub:${NC} VITE_GEMINI_API_KEY added to repository secrets"
else
    echo -e "${YELLOW}⚠️  GitHub:${NC} Manual setup required"
    echo "   → https://github.com/mpolobe/scroll-waitlist-exchange-1/settings/secrets/actions"
    echo "   → Add secret: VITE_GEMINI_API_KEY"
    echo "   → Value: $GEMINI_API_KEY"
fi

echo ""
echo -e "${GREEN}✅ Local:${NC} .env.local updated"

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "📚 Gemini AI Features in Africoin Wallet:"
echo ""
echo "✅ AI-powered chatbot for customer support"
echo "✅ Wallet and transaction assistance"
echo "✅ Blockchain concept explanations"
echo "✅ Railway booking help (Africa Railways integration)"
echo "✅ Security guidance"
echo "✅ 24/7 support"
echo ""
echo "📖 Documentation:"
echo "   - Project: $GEMINI_PROJECT_NAME"
echo "   - Project Number: $GEMINI_PROJECT_NUMBER"
echo "   - Model: gemini-pro"
echo "   - See: GEMINI_INTEGRATION.md"
echo ""
echo "🔗 Resources:"
echo "   - Gemini API Docs: https://ai.google.dev/docs"
echo "   - Google AI Studio: https://aistudio.google.com/"
echo "   - Project Console: https://console.cloud.google.com/apis/dashboard?project=$GEMINI_PROJECT_NUMBER"
echo ""
echo "🧪 Test the chatbot:"
echo "   npm run dev"
echo "   Open app → Click AI Assistant icon"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo -e "${GREEN}🎉 Gemini API integration ready!${NC}"
echo ""
