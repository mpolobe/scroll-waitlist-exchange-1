#!/bin/bash

# Build Release APK and AAB for Africoin Wallet

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Africoin Wallet - Release Build                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if keystore exists
if [ ! -f "android/app/africoin-release.keystore" ]; then
    echo -e "${RED}❌ Keystore not found!${NC}"
    echo ""
    echo "Generate keystore first:"
    echo "  ./scripts/generate-keystore.sh"
    echo ""
    exit 1
fi

# Check if key.properties exists
if [ ! -f "android/key.properties" ]; then
    echo -e "${RED}❌ key.properties not found!${NC}"
    echo ""
    echo "Create android/key.properties with:"
    echo "  storePassword=YOUR_PASSWORD"
    echo "  keyPassword=YOUR_PASSWORD"
    echo "  keyAlias=africoin"
    echo "  storeFile=./app/africoin-release.keystore"
    echo ""
    exit 1
fi

echo "Building Africoin Wallet..."
echo ""

# Install dependencies
echo "→ Installing dependencies..."
npm install

# Build web app
echo "→ Building web app..."
npm run build

# Check if Capacitor Android is initialized
if [ ! -d "android/app" ]; then
    echo "→ Initializing Capacitor Android..."
    npm install @capacitor/core @capacitor/cli @capacitor/android
    if [ ! -f "capacitor.config.ts" ]; then
        npx cap init "Africoin Wallet" "com.africoin.wallet" --web-dir=dist
    fi
    npx cap add android
fi

# Sync Capacitor
echo "→ Syncing Capacitor..."
npx cap sync android

# Build release APK
echo "→ Building release APK..."
cd android
./gradlew assembleRelease

# Build release AAB
echo "→ Building release AAB (for Play Store)..."
./gradlew bundleRelease

cd ..

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Build Complete!                                          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Find and display outputs
APK_PATH=$(find android/app/build/outputs/apk/release -name "*.apk" | head -1)
AAB_PATH=$(find android/app/build/outputs/bundle/release -name "*.aab" | head -1)

if [ -n "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo -e "${GREEN}✅ APK:${NC} $APK_PATH ($APK_SIZE)"
fi

if [ -n "$AAB_PATH" ]; then
    AAB_SIZE=$(du -h "$AAB_PATH" | cut -f1)
    echo -e "${GREEN}✅ AAB:${NC} $AAB_PATH ($AAB_SIZE)"
fi

echo ""
echo "Next steps:"
echo ""
echo "1. Test APK on device:"
echo "   adb install \"$APK_PATH\""
echo ""
echo "2. Upload to BrowserStack:"
echo "   curl -u \"benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp\" \\"
echo "     -X POST \"https://api-cloud.browserstack.com/app-automate/upload\" \\"
echo "     -F \"file=@$APK_PATH\""
echo ""
echo "3. Upload AAB to Google Play Console:"
echo "   https://play.google.com/console/developers/8975457855584245860"
echo ""
