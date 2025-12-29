# Codemagic Build Optimization Guide

**Project:** Africoin Wallet  
**Date:** December 29, 2024  
**Purpose:** Speed up builds, especially after failed rebuilds

---

## Current Build Times (Estimated)

Without caching:
- **npm install**: 2-3 minutes
- **npm run build**: 30-60 seconds
- **Capacitor sync**: 10-20 seconds
- **Gradle build**: 3-5 minutes
- **Total**: ~6-9 minutes per build

With caching (after first build):
- **npm install**: 30-60 seconds (cached)
- **npm run build**: 30-60 seconds
- **Capacitor sync**: 10-20 seconds
- **Gradle build**: 1-2 minutes (cached)
- **Total**: ~2-4 minutes per build

**Potential savings: 50-60% faster builds**

---

## 1. Enable Dependency Caching

### What to Cache

Based on Codemagic documentation, cache these paths:

**Node.js/NPM:**
- `$HOME/.npm` - NPM cache
- `node_modules` - Installed packages (optional, can be large)

**Gradle (Android):**
- `$HOME/.gradle/caches` - Gradle dependencies
- `android/.gradle` - Project-specific Gradle cache

**Capacitor:**
- `android/app/build` - Build outputs (optional)

### Implementation

Add to `codemagic.yaml`:

```yaml
workflows:
  android-debug:
    name: Africoin Wallet Android (Debug)
    max_build_duration: 120
    instance_type: mac_mini_m2
    
    # Add caching configuration
    cache:
      cache_paths:
        - $HOME/.npm
        - $HOME/.gradle/caches
        - node_modules
    
    environment:
      # ... existing environment config
```

### Cache Limits

- **Teams**: 10GB per workflow
- **Personal**: 3GB per workflow
- **Expiration**: 14 days

### How It Works

1. **First build**: Downloads all dependencies, generates cache, uploads to Codemagic
2. **Subsequent builds**: Downloads cache, uses cached dependencies
3. **After 14 days**: Cache expires, regenerates on next build

---

## 2. Optimize Build Scripts

### Current Issues

Our current workflow reinstalls Capacitor and recreates Android platform on every build:

```yaml
- name: Install Capacitor
  script: |
    npm install @capacitor/core @capacitor/cli @capacitor/android
    npx cap add android  # This recreates the entire Android platform
```

**Problem**: `npx cap add android` is slow and unnecessary after first build.

### Optimized Approach

```yaml
- name: Install Capacitor
  script: |
    # Only install if not already in node_modules (when cache is used)
    if [ ! -d "node_modules/@capacitor/core" ]; then
      npm install @capacitor/core @capacitor/cli @capacitor/android
    fi
    
    # Only add Android platform if it doesn't exist
    if [ ! -d "android/app" ]; then
      npx cap add android
    fi

- name: Sync Capacitor
  script: |
    # Sync is fast and safe to run every time
    npx cap sync android
```

**Benefits:**
- Skips reinstalling Capacitor when cached
- Skips recreating Android platform when it exists
- Only syncs web assets (fast operation)

---

## 3. Conditional Build Steps

### Skip Unnecessary Steps on Rebuilds

```yaml
- name: Install system dependencies
  script: |
    # Only install if not cached
    if ! command -v jq &> /dev/null; then
      brew install jq
    fi

- name: Clean Gradle (only on first build)
  script: |
    cd android
    if [ -f "gradlew" ]; then
      chmod +x gradlew
      # Only clean if this is a fresh build
      if [ ! -d ".gradle" ]; then
        ./gradlew clean
      fi
    fi
```

---

## 4. Parallel Builds (Advanced)

### Split Workflows

Instead of one long workflow, split into parallel jobs:

```yaml
workflows:
  # Fast web build
  web-build:
    name: Build Web Assets
    scripts:
      - npm install
      - npm run build
    artifacts:
      - dist/**

  # Android build (depends on web-build)
  android-build:
    name: Build Android APK
    # This would require web-build artifacts
    scripts:
      - npx cap sync android
      - cd android && ./gradlew assembleDebug
```

**Note**: This requires Codemagic's workflow dependencies feature (may need higher tier).

---

## 5. Incremental Builds

### Gradle Incremental Compilation

Already enabled by default in modern Gradle, but ensure it's not disabled:

```gradle
// android/gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### Vite Build Optimization

Already optimized in `vite.config.ts`, but can add:

```typescript
export default defineConfig({
  build: {
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable minification
    minify: 'esbuild',
    // Faster source maps for debug builds
    sourcemap: false,
  }
})
```

---

## 6. Skip BrowserStack Upload on Failed Builds

### Current Behavior

BrowserStack upload runs even if build succeeds but you want to skip it during testing.

### Conditional Upload

```yaml
- name: Upload to BrowserStack
  script: |
    # Only upload if explicitly enabled
    if [ "$UPLOAD_TO_BROWSERSTACK" = "true" ]; then
      APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
      
      if [ -f "$APK_PATH" ]; then
        echo "Uploading APK to BrowserStack..."
        RESPONSE=$(curl -s -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
          -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
          -F "file=@$APK_PATH")
        
        echo "$RESPONSE" | jq '.'
      fi
    else
      echo "Skipping BrowserStack upload (set UPLOAD_TO_BROWSERSTACK=true to enable)"
    fi
```

Add to environment variables:
```yaml
environment:
  vars:
    UPLOAD_TO_BROWSERSTACK: "false"  # Set to "true" when needed
```

---

## 7. Use Build Machine Efficiently

### Current Setup

```yaml
instance_type: mac_mini_m2
```

**Good choice** - M2 is fast and cost-effective.

### Alternative Options

- `mac_mini_m1` - Slightly cheaper, still fast
- `linux_x2` - Much cheaper for Android-only builds (no iOS support)

**Recommendation**: Keep `mac_mini_m2` for now, consider `linux_x2` for Android-only workflows.

---

## 8. Optimize npm install

### Use npm ci Instead of npm install

```yaml
- name: Install dependencies
  script: |
    # npm ci is faster and more reliable for CI/CD
    # It uses package-lock.json exactly and cleans node_modules first
    npm ci
```

**Benefits:**
- Faster than `npm install`
- More reliable (uses exact versions from package-lock.json)
- Automatically removes extraneous packages

### Alternative: Use pnpm

```yaml
- name: Install dependencies
  script: |
    npm install -g pnpm
    pnpm install --frozen-lockfile
```

**Benefits:**
- Much faster than npm
- Uses less disk space (shared dependencies)
- Better for monorepos

---

## 9. Reduce Build Output

### Minimize Logging

```yaml
- name: Build Android APK (Debug)
  script: |
    cd android
    # Reduce Gradle output
    ./gradlew assembleDebug --quiet
```

### Skip Unnecessary Artifacts

Only collect artifacts you need:

```yaml
artifacts:
  - android/app/build/outputs/apk/debug/app-debug.apk
  # Don't collect everything:
  # - android/app/build/outputs/**/*.apk
```

---

## 10. Clear Cache When Needed

### When to Clear Cache

- After major dependency updates
- When builds fail with cache-related errors
- When switching Node.js or Java versions

### How to Clear

**Via Codemagic UI:**
1. Go to app settings
2. Navigate to "Dependency caching"
3. Click "Clear cache"

**Via API:**
```bash
curl -X DELETE \
  -H "x-auth-token: YOUR_API_TOKEN" \
  "https://api.codemagic.io/apps/APP_ID/workflows/WORKFLOW_ID/cache"
```

---

## Recommended Configuration

### Updated codemagic.yaml (android-debug workflow)

```yaml
workflows:
  android-debug:
    name: Africoin Wallet Android (Debug)
    max_build_duration: 120
    instance_type: mac_mini_m2
    
    # Enable caching
    cache:
      cache_paths:
        - $HOME/.npm
        - $HOME/.gradle/caches
        - node_modules
    
    environment:
      groups:
        - africoin_env_vars
        - browserstack_credentials
      vars:
        PACKAGE_NAME: "com.africoin.wallet"
        APP_NAME: "Africoin Wallet"
        VITE_ALCHEMY_API_KEY: $VITE_ALCHEMY_API_KEY
        VITE_ALCHEMY_GAS_POLICY_ID: $VITE_ALCHEMY_GAS_POLICY_ID
        VITE_SUPABASE_URL: $VITE_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY: $VITE_SUPABASE_ANON_KEY
        VITE_GEMINI_API_KEY: $VITE_GEMINI_API_KEY
        UPLOAD_TO_BROWSERSTACK: "true"  # Set to false to skip upload
      node: 20.19.6
      java: 21
    
    triggering:
      events:
        - push
        - pull_request
      branch_patterns:
        - pattern: 'main'
          include: true
          source: true
        - pattern: 'develop'
          include: true
          source: true
    
    scripts:
      - name: Install system dependencies
        script: |
          if ! command -v jq &> /dev/null; then
            brew install jq
          fi
      
      - name: Install dependencies
        script: |
          # Use npm ci for faster, more reliable installs
          npm ci
      
      - name: Build web app
        script: |
          npm run build
      
      - name: Setup Capacitor
        script: |
          # Only install if not cached
          if [ ! -d "node_modules/@capacitor/core" ]; then
            npm install @capacitor/core @capacitor/cli @capacitor/android
          fi
          
          # Only add Android if it doesn't exist
          if [ ! -d "android/app" ]; then
            npx cap add android
          fi
      
      - name: Sync Capacitor
        script: |
          npx cap sync android
      
      - name: Prepare Gradle
        script: |
          cd android
          if [ -f "gradlew" ]; then
            chmod +x gradlew
          fi
      
      - name: Build Android APK (Debug)
        script: |
          cd android
          ./gradlew assembleDebug --quiet
      
      - name: Upload to BrowserStack
        script: |
          if [ "$UPLOAD_TO_BROWSERSTACK" = "true" ]; then
            APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
            
            if [ -f "$APK_PATH" ]; then
              echo "Uploading APK to BrowserStack..."
              RESPONSE=$(curl -s -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
                -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
                -F "file=@$APK_PATH")
              
              if command -v jq &> /dev/null; then
                echo "$RESPONSE" | jq '.'
                APP_URL=$(echo "$RESPONSE" | jq -r '.app_url')
              else
                echo "$RESPONSE"
                APP_URL=$(echo "$RESPONSE" | grep -o '"app_url":"[^"]*"' | cut -d'"' -f4)
              fi
              
              echo ""
              echo "✅ APK uploaded successfully!"
              echo "App URL: $APP_URL"
              echo "Test at: https://app-live.browserstack.com/"
            else
              echo "⚠️  APK not found at $APK_PATH"
              exit 1
            fi
          else
            echo "ℹ️  Skipping BrowserStack upload (UPLOAD_TO_BROWSERSTACK not set to true)"
          fi
    
    artifacts:
      - android/app/build/outputs/apk/debug/app-debug.apk
    
    publishing:
      email:
        recipients:
          - ben.mpolokoso@gmail.com
        notify:
          success: true
          failure: true
```

---

## Expected Results

### First Build (No Cache)
- Duration: ~6-9 minutes
- Generates cache for future builds

### Subsequent Builds (With Cache)
- Duration: ~2-4 minutes
- **50-60% faster**

### After Failed Build
- Rebuilds use cache
- Only re-runs failed steps
- Much faster recovery

---

## Implementation Checklist

### Immediate (High Impact)
- [ ] Add `cache` section to workflows
- [ ] Change `npm install` to `npm ci`
- [ ] Add conditional Capacitor installation
- [ ] Skip unnecessary `cap add android` on rebuilds

### Short Term (Medium Impact)
- [ ] Add conditional BrowserStack upload
- [ ] Optimize Gradle settings
- [ ] Reduce build logging with `--quiet`
- [ ] Only collect necessary artifacts

### Long Term (Advanced)
- [ ] Consider splitting workflows for parallel builds
- [ ] Evaluate switching to pnpm
- [ ] Consider Linux machines for Android-only builds
- [ ] Implement incremental build strategies

---

## Monitoring Build Performance

### Check Build Times

1. Go to Codemagic dashboard
2. View build history
3. Compare build times before/after caching

### Cache Hit Rate

Look for these in build logs:
```
Downloading cache...
Cache restored successfully
```

Or:
```
No cache found, generating new cache...
```

### Troubleshooting Slow Builds

1. **Check cache size**: Should be under 3GB (personal) or 10GB (team)
2. **Verify cache paths**: Ensure paths are correct
3. **Clear cache if corrupted**: Use Codemagic UI
4. **Check for network issues**: Slow downloads can affect build time

---

## Cost Savings

### Build Minutes

With caching:
- **50-60% faster builds** = 50-60% fewer build minutes used
- More builds within free tier limits
- Lower costs for paid plans

### Example

Without caching:
- 10 builds/day × 8 minutes = 80 minutes/day
- 80 minutes × 30 days = 2,400 minutes/month

With caching:
- 10 builds/day × 3 minutes = 30 minutes/day
- 30 minutes × 30 days = 900 minutes/month

**Savings: 1,500 minutes/month (62.5%)**

---

## References

- [Codemagic Caching Documentation](https://docs.codemagic.io/knowledge-codemagic/caching/)
- [React Native Build Guide](https://docs.codemagic.io/yaml-quick-start/building-a-react-native-app/)
- [Gradle Build Cache](https://docs.gradle.org/current/userguide/build_cache.html)
- [npm ci Documentation](https://docs.npmjs.com/cli/v8/commands/npm-ci)

---

## Next Steps

1. **Review** this optimization guide
2. **Update** codemagic.yaml with caching configuration
3. **Test** with a build to generate initial cache
4. **Monitor** build times and cache effectiveness
5. **Iterate** based on results

---

**Last Updated:** December 29, 2024  
**Status:** Ready to Implement  
**Expected Impact:** 50-60% faster builds after first cached build
