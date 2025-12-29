#!/bin/bash
# Filename: scripts/debug_blank_page.sh
# Purpose: Analyze build output for Capacitor compatibility issues

set -e

echo "=========================================="
echo "Capacitor Blank Page Debug Analysis"
echo "=========================================="
echo ""

# 1. Run the build
echo "Step 1: Building React app..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ ERROR: dist/ folder not created"
  exit 1
fi

echo "✅ Build completed"
echo ""

# 2. Check for absolute paths in index.html
echo "Step 2: Checking for absolute paths in index.html..."
if grep -q 'src="/' dist/index.html || grep -q 'href="/' dist/index.html; then
  echo "❌ ERROR: Found absolute paths in dist/index.html"
  echo ""
  echo "Examples found:"
  grep -E 'src="|href="' dist/index.html | head -3
  echo ""
  echo "Fix: Change 'base' in vite.config.ts to './'"
  echo "Current vite.config.ts:"
  grep -A 2 "base:" vite.config.ts
  exit 1
else
  echo "✅ SUCCESS: All paths are relative"
  echo ""
  echo "Sample paths:"
  grep -E 'src="|href="' dist/index.html | head -3
fi

echo ""

# 3. Check for HashRouter vs BrowserRouter
echo "Step 3: Checking router implementation..."
if grep -q "BrowserRouter" src/App.tsx; then
  echo "❌ ERROR: BrowserRouter detected in src/App.tsx"
  echo "   BrowserRouter requires server-side routing"
  echo "   Fix: Switch to HashRouter for Capacitor"
  exit 1
elif grep -q "HashRouter" src/App.tsx; then
  echo "✅ SUCCESS: HashRouter detected"
else
  echo "⚠️  WARNING: Could not detect router type"
fi

# Check compiled output for history API usage
if grep -q "history" dist/assets/*.js 2>/dev/null; then
  echo "⚠️  WARNING: History API detected in compiled code"
  echo "   This may indicate BrowserRouter usage"
  echo "   If page is blank, verify HashRouter is being used"
fi

echo ""

# 4. Check Capacitor configuration
echo "Step 4: Verifying Capacitor configuration..."
if grep -q 'webDir.*"dist"' capacitor.config.ts || grep -q "webDir.*'dist'" capacitor.config.ts; then
  echo "✅ SUCCESS: capacitor.config.ts has webDir: 'dist'"
else
  echo "❌ ERROR: capacitor.config.ts webDir mismatch"
  echo "Current config:"
  grep -A 2 "webDir" capacitor.config.ts
  exit 1
fi

if grep -q 'bundledWebRuntime.*false' capacitor.config.ts; then
  echo "✅ SUCCESS: bundledWebRuntime is false"
else
  echo "⚠️  WARNING: bundledWebRuntime not explicitly set to false"
fi

echo ""

# 5. Check for common issues
echo "Step 5: Checking for common issues..."

# Check if assets directory exists
if [ -d "dist/assets" ]; then
  ASSET_COUNT=$(find dist/assets -type f | wc -l)
  echo "✅ Found $ASSET_COUNT files in dist/assets/"
else
  echo "⚠️  WARNING: dist/assets/ directory not found"
fi

# Check for index.html
if [ -f "dist/index.html" ]; then
  FILE_SIZE=$(wc -c < dist/index.html)
  echo "✅ dist/index.html exists (${FILE_SIZE} bytes)"
else
  echo "❌ ERROR: dist/index.html not found"
  exit 1
fi

# Check for source maps (optional but helpful for debugging)
if ls dist/assets/*.map 1> /dev/null 2>&1; then
  echo "✅ Source maps generated (helpful for debugging)"
else
  echo "ℹ️  No source maps found (optional)"
fi

echo ""

# 6. Simulate Capacitor sync check
echo "Step 6: Simulating Capacitor sync..."
echo "   Would copy: dist/ → android/app/src/main/assets/public/"

if [ -d "android/app/src/main/assets/public" ]; then
  echo "   Target directory exists"
  if [ -f "android/app/src/main/assets/public/index.html" ]; then
    echo "   ⚠️  Old assets found - will be replaced on sync"
  fi
else
  echo "   ℹ️  Target directory will be created on first sync"
fi

echo ""

# 7. Summary
echo "=========================================="
echo "Analysis Summary"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# Count errors and warnings from above checks
if grep -q 'src="/' dist/index.html || grep -q 'href="/' dist/index.html; then
  ERRORS=$((ERRORS + 1))
fi

if grep -q "BrowserRouter" src/App.tsx; then
  ERRORS=$((ERRORS + 1))
fi

if ! grep -q 'webDir.*"dist"' capacitor.config.ts && ! grep -q "webDir.*'dist'" capacitor.config.ts; then
  ERRORS=$((ERRORS + 1))
fi

if grep -q "history" dist/assets/*.js 2>/dev/null; then
  WARNINGS=$((WARNINGS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ No critical errors found"
  echo "✅ Build is Capacitor-ready"
  echo ""
  echo "Next steps:"
  echo "  1. Run: npx cap sync android"
  echo "  2. Run: cd android && ./gradlew assembleDebug"
  echo "  3. Test APK on device"
else
  echo "❌ Found $ERRORS critical error(s)"
  echo "   Fix the errors above before building APK"
  exit 1
fi

if [ $WARNINGS -gt 0 ]; then
  echo ""
  echo "⚠️  Found $WARNINGS warning(s)"
  echo "   Review warnings above - may cause issues"
fi

echo ""
echo "=========================================="
echo "Debug analysis complete!"
echo "=========================================="
