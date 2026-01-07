# Capacitor Blank Screen Debugging Guide

**Date:** December 29, 2024  
**Purpose:** Step-by-step guide to debug blank screen issues in Capacitor apps

---

## Real-Time Debugging with Chrome DevTools

### Setup Chrome Remote Debugging

1. **Enable USB Debugging on Android Device:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect Device to Computer:**
   ```bash
   # Verify device is connected
   adb devices
   # Should show: List of devices attached
   #              ABC123XYZ    device
   ```

3. **Open Chrome DevTools:**
   - Open Chrome on your computer
   - Navigate to: `chrome://inspect/#devices`
   - Wait for your device to appear
   - Find "Africoin Wallet" under "Remote Target"
   - Click **"Inspect"**

4. **Check Console for Errors:**
   
   **Common Errors You'll See:**
   
   ❌ **Path Error (Most Common):**
   ```
   Failed to load resource: net::ERR_FILE_NOT_FOUND
   file:///assets/index-abc123.js
   ```
   **Solution:** Change `base: '/'` to `base: './'` in vite.config.ts
   
   ❌ **Router Error:**
   ```
   Cannot GET /signup
   ```
   **Solution:** Switch from BrowserRouter to HashRouter
   
   ❌ **Initialization Error:**
   ```
   TypeError: Cannot read property 'createClient' of undefined
   ```
   **Solution:** Check environment variables are set
   
   ❌ **CORS Error:**
   ```
   Access to fetch at 'https://api.example.com' blocked by CORS
   ```
   **Solution:** Add domain to allowNavigation in capacitor.config.ts

5. **Check Network Tab:**
   - Click "Network" tab in DevTools
   - Reload the app
   - Look for failed requests (red status codes)
   - Check if assets are loading from correct paths

6. **Check Sources Tab:**
   - Click "Sources" tab
   - Verify your JavaScript files are loaded
   - Set breakpoints to debug initialization
   - Check if source maps are working

---

## Verifying Capacitor Sync in Codemagic

### The Critical Sync Step

The `npx cap sync android` command is **crucial** - it copies your built web assets from `dist/` to the Android project. If this fails or is skipped, you'll get a blank screen.

### What `npx cap sync android` Does:

1. **Copies web assets:**
   ```
   dist/ → android/app/src/main/assets/public/
   ```

2. **Updates native configuration:**
   - Reads capacitor.config.ts
   - Updates AndroidManifest.xml
   - Configures WebView settings

3. **Installs Capacitor plugins:**
   - Copies plugin native code
   - Updates Gradle dependencies

### Verification Script

Use this script to verify sync works correctly:

```bash
#!/bin/bash
# Run this locally or in Codemagic

echo "Step 1: Building web app..."
npm run build

echo "Step 2: Syncing to Android..."
npx cap sync android

echo "Step 3: Verifying sync..."
if [ -f "android/app/src/main/assets/public/index.html" ]; then
    echo "✅ SUCCESS: Assets synced"
    ls -lh android/app/src/main/assets/public/
else
    echo "❌ FAILED: Assets not synced"
    exit 1
fi
```

---

## Codemagic Pipeline Best Practices

### Correct Build Order

```yaml
scripts:
  # 1. Install dependencies
  - name: Install dependencies
    script: npm ci

  # 2. Build web app (MUST come first)
  - name: Build web app
    script: |
      npm run build
      # Verify build succeeded
      if [ ! -f "dist/index.html" ]; then
        echo "❌ Build failed"
        exit 1
      fi

  # 3. Install Capacitor (if needed)
  - name: Setup Capacitor
    script: |
      npm install @capacitor/core @capacitor/cli @capacitor/android

  # 4. Sync to Android (CRITICAL STEP)
  - name: Sync Capacitor
    script: |
      npx cap sync android
      # Verify sync succeeded
      if [ ! -f "android/app/src/main/assets/public/index.html" ]; then
        echo "❌ Sync failed"
        exit 1
      fi

  # 5. Build Android APK
  - name: Build APK
    script: |
      cd android
      ./gradlew assembleDebug
```

### Common Mistakes to Avoid

❌ **Wrong Order:**
```yaml
# DON'T DO THIS
- npx cap sync android
- npm run build  # Too late! Sync already happened
- ./gradlew assembleDebug
```

❌ **Missing Sync:**
```yaml
# DON'T DO THIS
- npm run build
- cd android && ./gradlew assembleDebug  # No sync!
```

❌ **No Verification:**
```yaml
# DON'T DO THIS
- npx cap sync android  # Might fail silently
- ./gradlew assembleDebug  # Builds with old/missing assets
```

✅ **Correct Order:**
```yaml
# DO THIS
- npm run build
- npx cap sync android
- cd android && ./gradlew assembleDebug
```

---

## Enhanced Codemagic Script

### Debug Build with Verification

```yaml
- name: Build web app
  script: |
    echo "=========================================="
    echo "Building React app with Vite"
    echo "=========================================="
    npm run build
    
    # Verify build output exists
    if [ ! -d "dist" ]; then
      echo "❌ ERROR: dist/ folder not created"
      exit 1
    fi
    
    if [ ! -f "dist/index.html" ]; then
      echo "❌ ERROR: dist/index.html not found"
      exit 1
    fi
    
    echo "✅ Build completed"
    echo "Files in dist/:"
    ls -lh dist/
    
    # Check for relative paths
    echo ""
    echo "Checking asset paths..."
    if grep -q 'src="./' dist/index.html; then
      echo "✅ Assets use relative paths (./ prefix)"
    else
      echo "⚠️  WARNING: Assets may use absolute paths"
      echo "First script tag:"
      grep -m 1 'src=' dist/index.html
    fi

- name: Sync Capacitor to Android
  script: |
    echo "=========================================="
    echo "Syncing web assets to Android"
    echo "=========================================="
    
    # Run sync
    npx cap sync android
    
    # Verify sync succeeded
    echo ""
    echo "Verifying sync..."
    
    if [ ! -f "android/app/src/main/assets/public/index.html" ]; then
      echo "❌ ERROR: Assets not synced to Android"
      echo "Expected location: android/app/src/main/assets/public/"
      echo ""
      echo "Checking capacitor.config.ts:"
      grep -A 2 "webDir" capacitor.config.ts
      exit 1
    fi
    
    echo "✅ Assets synced successfully"
    echo ""
    echo "Synced files:"
    ls -lh android/app/src/main/assets/public/
    
    if [ -d "android/app/src/main/assets/public/assets" ]; then
      ASSET_COUNT=$(find android/app/src/main/assets/public/assets -type f | wc -l)
      echo "✅ Found $ASSET_COUNT asset files"
    fi
    
    echo ""
    echo "Checking index.html in Android:"
    if grep -q 'src="./' android/app/src/main/assets/public/index.html; then
      echo "✅ Android assets use relative paths"
    else
      echo "⚠️  WARNING: Android assets may use absolute paths"
    fi

- name: Build Android APK
  script: |
    echo "=========================================="
    echo "Building Android APK"
    echo "=========================================="
    cd android
    ./gradlew clean
    ./gradlew assembleDebug
    
    # Verify APK was created
    if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
      echo "✅ APK built successfully"
      ls -lh app/build/outputs/apk/debug/app-debug.apk
    else
      echo "❌ ERROR: APK not found"
      exit 1
    fi
```

---

## Local Testing Before Pushing

### Test the Full Build Process Locally

```bash
# 1. Clean everything
rm -rf dist/ android/app/src/main/assets/public/

# 2. Build web app
npm run build

# 3. Verify build
ls -la dist/
cat dist/index.html | grep -E "src=|href="

# 4. Sync to Android
npx cap sync android

# 5. Verify sync
ls -la android/app/src/main/assets/public/
cat android/app/src/main/assets/public/index.html | grep -E "src=|href="

# 6. Build APK
cd android
./gradlew clean assembleDebug

# 7. Install and test
adb install app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.africoin.wallet/.MainActivity
```

### Quick Verification Script

```bash
#!/bin/bash
# scripts/quick-verify.sh

echo "Quick Capacitor Build Verification"
echo "==================================="

# Check Vite config
echo "1. Checking vite.config.ts..."
if grep -q "base.*'./'.*" vite.config.ts; then
  echo "   ✅ Base path is relative"
else
  echo "   ❌ Base path may be absolute"
fi

# Check Capacitor config
echo "2. Checking capacitor.config.ts..."
if grep -q "webDir.*'dist'" capacitor.config.ts; then
  echo "   ✅ webDir is 'dist'"
else
  echo "   ❌ webDir mismatch"
fi

# Check Router
echo "3. Checking router..."
if grep -q "HashRouter" src/App.tsx; then
  echo "   ✅ Using HashRouter"
else
  echo "   ⚠️  May be using BrowserRouter"
fi

# Build and sync
echo "4. Building and syncing..."
npm run build > /dev/null 2>&1
npx cap sync android > /dev/null 2>&1

# Verify
if [ -f "android/app/src/main/assets/public/index.html" ]; then
  echo "   ✅ Assets synced to Android"
else
  echo "   ❌ Assets NOT synced"
fi

echo ""
echo "Verification complete!"
```

---

## Troubleshooting Checklist

### If Blank Screen Persists After Fixes

- [ ] **Verify vite.config.ts has `base: './'`**
  ```bash
  grep "base" vite.config.ts
  ```

- [ ] **Verify using HashRouter not BrowserRouter**
  ```bash
  grep "Router" src/App.tsx
  ```

- [ ] **Verify dist/ folder exists after build**
  ```bash
  ls -la dist/
  ```

- [ ] **Verify assets use relative paths**
  ```bash
  grep 'src=' dist/index.html | head -1
  ```

- [ ] **Verify sync copied files to Android**
  ```bash
  ls -la android/app/src/main/assets/public/
  ```

- [ ] **Verify Android assets use relative paths**
  ```bash
  grep 'src=' android/app/src/main/assets/public/index.html | head -1
  ```

- [ ] **Check Chrome DevTools for errors**
  ```
  chrome://inspect/#devices
  ```

- [ ] **Verify environment variables (if needed)**
  ```bash
  # In Chrome DevTools Console:
  console.log(import.meta.env)
  ```

---

## Summary

**Critical Steps for Capacitor Builds:**

1. ✅ Set `base: './'` in vite.config.ts
2. ✅ Use HashRouter instead of BrowserRouter
3. ✅ Run `npm run build` first
4. ✅ Run `npx cap sync android` second
5. ✅ Verify sync succeeded before building APK
6. ✅ Use Chrome DevTools to debug runtime errors

**Common Causes of Blank Screen:**

1. ❌ Absolute paths (`base: '/'`) - Assets can't be found
2. ❌ BrowserRouter - Routing fails without server
3. ❌ Missing sync - Old or no assets in Android
4. ❌ Wrong sync order - Building before syncing
5. ❌ Initialization errors - Missing environment variables

**Debugging Tools:**

- Chrome DevTools (`chrome://inspect`)
- Verification scripts
- Build logs
- ADB logcat

---

**Last Updated:** December 29, 2024  
**Status:** Complete debugging guide  
**Next Action:** Apply fixes and test with Chrome DevTools
