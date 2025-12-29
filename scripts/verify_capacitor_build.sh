#!/bin/bash
# Filename: scripts/verify_capacitor_build.sh
# Purpose: Verify Capacitor build process and asset syncing

set -e  # Exit on error

echo "=========================================="
echo "Capacitor Build Verification"
echo "=========================================="
echo ""

# 1. Build React web assets
echo "Step 1: Building React web assets..."
npm run build 

if [ ! -d "dist" ]; then
    echo "❌ ERROR: dist/ folder not created by Vite build"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: dist/index.html not found"
    exit 1
fi

echo "✅ SUCCESS: Vite build completed"
echo "   - dist/ folder exists"
echo "   - dist/index.html exists"
echo ""

# Check for relative paths in index.html
echo "Step 2: Verifying asset paths in index.html..."
if grep -q 'src="./' dist/index.html && grep -q 'href="./' dist/index.html; then
    echo "✅ SUCCESS: Assets use relative paths (./ prefix)"
else
    echo "⚠️  WARNING: Assets may be using absolute paths"
    echo "   Check vite.config.ts has base: './'"
fi
echo ""

# 2. Sync to Android (Crucial step)
echo "Step 3: Syncing web assets to Android..."
npx cap sync android

# 3. Check if index.html exists in the native project
echo "Step 4: Verifying assets in Android project..."
if [ -f "android/app/src/main/assets/public/index.html" ]; then
    echo "✅ SUCCESS: Web assets synced to Android"
    echo "   Location: android/app/src/main/assets/public/"
else
    echo "❌ ERROR: Capacitor didn't sync assets to Android"
    echo "   Expected: android/app/src/main/assets/public/index.html"
    echo "   Check capacitor.config.ts webDir matches Vite outDir"
    exit 1
fi

# 4. Verify assets folder
if [ -d "android/app/src/main/assets/public/assets" ]; then
    echo "✅ SUCCESS: Assets folder synced"
    ASSET_COUNT=$(find android/app/src/main/assets/public/assets -type f | wc -l)
    echo "   Found $ASSET_COUNT asset files"
else
    echo "⚠️  WARNING: Assets folder not found"
fi
echo ""

# 5. Check capacitor.config.ts
echo "Step 5: Verifying Capacitor configuration..."
if grep -q 'webDir.*dist' capacitor.config.ts; then
    echo "✅ SUCCESS: capacitor.config.ts has webDir: 'dist'"
else
    echo "❌ ERROR: capacitor.config.ts webDir mismatch"
    exit 1
fi

if grep -q "base.*'./'.*" vite.config.ts; then
    echo "✅ SUCCESS: vite.config.ts has base: './'"
else
    echo "⚠️  WARNING: vite.config.ts may not have relative base path"
fi
echo ""

# 6. Summary
echo "=========================================="
echo "Build Verification Summary"
echo "=========================================="
echo "✅ Vite build completed"
echo "✅ Assets synced to Android"
echo "✅ Configuration verified"
echo ""
echo "Ready to build APK with:"
echo "  cd android && ./gradlew assembleDebug"
echo ""
