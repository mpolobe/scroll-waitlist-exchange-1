#!/bin/bash

# BrowserStack Integration Setup Script
# Configures BrowserStack credentials for Africoin Wallet project

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# BrowserStack Credentials
BROWSERSTACK_USERNAME="benjaminmpolokos_dzbone"
BROWSERSTACK_ACCESS_KEY="YkRwgayd5JiTUZWKBCNp"
BROWSERSTACK_URL="http://benjaminmpolokos_dzbone.browserstack.com"

# Developer Information
DEVELOPER_NAME="Africa Railways"
DEVELOPER_EMAIL="ben.mpolokoso@gmail.com"
GOOGLE_PLAY_DEV_ID="8975457855584245860"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   BrowserStack Integration Setup                          ║${NC}"
echo -e "${BLUE}║   Africoin Wallet - Africa Railways                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Developer: $DEVELOPER_NAME"
echo "Google Play ID: $GOOGLE_PLAY_DEV_ID"
echo "Contact: $DEVELOPER_EMAIL"
echo ""

# ============================================================================
# TEST CONNECTION
# ============================================================================

echo -e "${BLUE}Testing BrowserStack connection...${NC}"
echo ""

PLAN_RESPONSE=$(curl -s -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  "https://api.browserstack.com/app-automate/plan.json")

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ BrowserStack connection successful!${NC}"
    echo ""
    echo "Account Plan:"
    echo "$PLAN_RESPONSE" | jq '.' 2>/dev/null || echo "$PLAN_RESPONSE"
    echo ""
else
    echo -e "${RED}❌ Failed to connect to BrowserStack${NC}"
    echo "Please check your credentials and internet connection"
    exit 1
fi

# ============================================================================
# GITHUB SECRETS SETUP
# ============================================================================

echo "─────────────────────────────────────────────────────────────"
echo ""

if ! command -v gh &> /dev/null; then
    echo -e "${YELLOW}⚠️  GitHub CLI (gh) not installed${NC}"
    echo ""
    echo "To add credentials to GitHub automatically:"
    echo "1. Install gh CLI: https://cli.github.com/"
    echo "2. Run: gh auth login"
    echo "3. Run this script again"
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
        echo "Adding BrowserStack credentials to GitHub Secrets..."
        echo ""
        
        echo "→ Adding BROWSERSTACK_USERNAME..."
        echo "$BROWSERSTACK_USERNAME" | gh secret set BROWSERSTACK_USERNAME
        echo -e "${GREEN}  ✅ BROWSERSTACK_USERNAME added${NC}"
        
        echo "→ Adding BROWSERSTACK_ACCESS_KEY..."
        echo "$BROWSERSTACK_ACCESS_KEY" | gh secret set BROWSERSTACK_ACCESS_KEY
        echo -e "${GREEN}  ✅ BROWSERSTACK_ACCESS_KEY added${NC}"
        
        echo "→ Adding BROWSERSTACK_URL..."
        echo "$BROWSERSTACK_URL" | gh secret set BROWSERSTACK_URL
        echo -e "${GREEN}  ✅ BROWSERSTACK_URL added${NC}"
        
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
echo "Updating local .env.example..."

if [ ! -f .env.example ]; then
    echo -e "${RED}❌ .env.example not found${NC}"
else
    if grep -q "BROWSERSTACK" .env.example; then
        echo -e "${YELLOW}⚠️  BrowserStack variables already in .env.example${NC}"
    else
        cat >> .env.example << 'EOF'

# BrowserStack Testing Configuration
# Get credentials from: https://www.browserstack.com/accounts/settings
BROWSERSTACK_USERNAME=benjaminmpolokos_dzbone
BROWSERSTACK_ACCESS_KEY=your_browserstack_access_key_here
BROWSERSTACK_URL=http://benjaminmpolokos_dzbone.browserstack.com
EOF
        echo -e "${GREEN}✅ BrowserStack variables added to .env.example${NC}"
    fi
fi

# ============================================================================
# VERIFY .GITIGNORE
# ============================================================================

echo ""
echo "Verifying .gitignore configuration..."

if [ ! -f .gitignore ]; then
    echo -e "${YELLOW}⚠️  .gitignore not found, creating...${NC}"
    cat > .gitignore << 'EOF'
# Environment variables
.env
.env.*
!.env.example

# Dependencies
node_modules/

# Build outputs
dist/
build/
android/app/build/
ios/build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
EOF
    echo -e "${GREEN}✅ .gitignore created${NC}"
else
    if ! grep -q "^\.env$" .gitignore; then
        echo -e "${YELLOW}⚠️  Adding .env to .gitignore${NC}"
        echo "" >> .gitignore
        echo "# Environment variables" >> .gitignore
        echo ".env" >> .gitignore
        echo ".env.*" >> .gitignore
        echo "!.env.example" >> .gitignore
    fi
    echo -e "${GREEN}✅ .gitignore configured${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Setup Complete!                                          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ BrowserStack:${NC} Connection verified"
echo -e "${GREEN}✅ Local:${NC} .env.example updated"
echo -e "${GREEN}✅ Security:${NC} .gitignore configured"

if [ -z "$SKIP_GITHUB" ]; then
    echo -e "${GREEN}✅ GitHub:${NC} Secrets added to repository"
else
    echo -e "${YELLOW}⚠️  GitHub:${NC} Manual setup required"
    echo "   → Go to: Settings → Secrets and variables → Actions"
    echo "   → Add these secrets:"
    echo "     - BROWSERSTACK_USERNAME: $BROWSERSTACK_USERNAME"
    echo "     - BROWSERSTACK_ACCESS_KEY: $BROWSERSTACK_ACCESS_KEY"
    echo "     - BROWSERSTACK_URL: $BROWSERSTACK_URL"
fi

echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Review the setup guide:"
echo "   → cat BROWSERSTACK_SETUP.md"
echo ""
echo "2. Build your Android APK:"
echo "   → npm run build"
echo "   → npx cap sync android"
echo "   → cd android && ./gradlew assembleDebug"
echo ""
echo "3. Upload APK to BrowserStack:"
echo "   → curl -u \"$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY\" \\"
echo "     -X POST \"https://api-cloud.browserstack.com/app-automate/upload\" \\"
echo "     -F \"file=@android/app/build/outputs/apk/debug/app-debug.apk\""
echo ""
echo "4. Test manually at:"
echo "   → https://app-live.browserstack.com/"
echo ""
echo "5. Update codemagic.yaml to include BrowserStack upload"
echo ""
echo "─────────────────────────────────────────────────────────────"
echo ""
echo -e "${GREEN}🎉 BrowserStack integration ready!${NC}"
echo ""
