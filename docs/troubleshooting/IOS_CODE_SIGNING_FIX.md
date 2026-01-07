# iOS Code Signing Error - Fix Guide

**Error:** `No matching profiles found for bundle identifier "com.africoin.wallet" and distribution type "app_store"`

**Date:** December 29, 2024  
**Status:** Requires Apple Developer Account Setup

---

## Problem

The iOS workflow is trying to build and sign an iOS app for App Store distribution, but:

1. **No provisioning profile exists** for bundle ID `com.africoin.wallet`
2. **No App Store Connect integration** is configured in Codemagic
3. **No Apple Developer account** is connected

This is expected since we've been focusing on Android development.

---

## Understanding iOS Code Signing

### What You Need

To build iOS apps, you need:

1. **Apple Developer Account** ($99/year)
   - Individual or Organization account
   - Required for App Store distribution

2. **App ID** registered in Apple Developer Portal
   - Bundle ID: `com.africoin.wallet`
   - Must match your app's bundle identifier

3. **Provisioning Profile**
   - Links your App ID, certificates, and devices
   - Types:
     - **Development**: For testing on your devices
     - **Ad Hoc**: For testing on specific devices
     - **App Store**: For App Store distribution
     - **Enterprise**: For internal distribution (requires Enterprise account)

4. **Signing Certificate**
   - iOS Distribution Certificate (for App Store)
   - iOS Development Certificate (for testing)

5. **App Store Connect Integration**
   - API key from App Store Connect
   - Required for automatic signing and TestFlight

---

## Solutions

### Option 1: Disable iOS Workflow (Recommended for Now)

Since you're focusing on Android, disable the iOS workflow until you're ready for iOS development.

**Update `codemagic.yaml`:**

```yaml
# iOS Build Workflow
ios-workflow:
  name: Africoin Wallet iOS
  max_build_duration: 120
  instance_type: mac_mini_m2
  
  # Disable this workflow until iOS setup is complete
  triggering:
    events: []  # Empty array = workflow won't trigger
    
  # OR comment out the entire workflow
```

**Alternative - Remove iOS workflow entirely:**

Simply delete or comment out the entire `ios-workflow` section from `codemagic.yaml`.

---

### Option 2: Set Up iOS Code Signing (When Ready)

Follow these steps when you're ready to build iOS apps:

#### Step 1: Apple Developer Account

1. Go to [Apple Developer](https://developer.apple.com/)
2. Enroll in Apple Developer Program ($99/year)
3. Complete enrollment (can take 24-48 hours)

#### Step 2: Register App ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (Add)
4. Select **App IDs** → **Continue**
5. Configure:
   - **Description**: Africoin Wallet
   - **Bundle ID**: `com.africoin.wallet` (Explicit)
   - **Capabilities**: Select required capabilities (e.g., Push Notifications, In-App Purchase)
6. Click **Continue** → **Register**

#### Step 3: Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: Africoin Wallet
   - **Primary Language**: English
   - **Bundle ID**: Select `com.africoin.wallet`
   - **SKU**: `com.africoin.wallet` (or any unique identifier)
4. Click **Create**

#### Step 4: Generate App Store Connect API Key

1. In App Store Connect, go to **Users and Access**
2. Click **Integrations** → **App Store Connect API**
3. Click **+** to generate a new key
4. Configure:
   - **Name**: Codemagic
   - **Access**: App Manager or Developer
5. Click **Generate**
6. **Download the API key** (`.p8` file) - you can only download it once!
7. Note the:
   - **Key ID** (e.g., `ABC123DEF4`)
   - **Issuer ID** (e.g., `12345678-1234-1234-1234-123456789012`)

#### Step 5: Configure Codemagic

1. Go to [Codemagic](https://codemagic.io/apps)
2. Select your app
3. Go to **Settings** → **Integrations**
4. Click **App Store Connect**
5. Add integration:
   - **Issuer ID**: From Step 4
   - **Key ID**: From Step 4
   - **API Key**: Upload the `.p8` file from Step 4
6. Save

#### Step 6: Update codemagic.yaml

Update the iOS workflow configuration:

```yaml
ios-workflow:
  name: Africoin Wallet iOS
  max_build_duration: 120
  instance_type: mac_mini_m2
  
  environment:
    ios_signing:
      distribution_type: app_store
      bundle_identifier: com.africoin.wallet
    
    # Add App Store Connect integration
    integrations:
      app_store_connect: YOUR_INTEGRATION_NAME  # Name from Codemagic UI
    
    groups:
      - africoin_env_vars
    
    vars:
      PACKAGE_NAME: "com.africoin.wallet"
      APP_NAME: "Africoin Wallet"
      # ... other vars
    
    node: 20.19.6
    xcode: 15.0
    cocoapods: default
  
  triggering:
    events:
      - push
      - tag
    branch_patterns:
      - pattern: 'main'
        include: true
        source: true
  
  scripts:
    # ... existing scripts
    
    - name: Set up code signing
      script: |
        keychain initialize
        app-store-connect fetch-signing-files "$PACKAGE_NAME" \
          --type IOS_APP_STORE \
          --create
        keychain add-certificates
        xcode-project use-profiles
    
    # ... rest of scripts
  
  publishing:
    app_store_connect:
      # Use the integration configured in Codemagic UI
      auth: integration
      
      # Submit to TestFlight
      submit_to_testflight: true
      beta_groups:
        - Internal Testers
      
      # Don't submit to App Store automatically
      submit_to_app_store: false
```

---

### Option 3: Use Development Signing (For Testing Only)

If you just want to test iOS builds without App Store distribution:

```yaml
ios-workflow:
  environment:
    ios_signing:
      distribution_type: development  # Change from app_store
      bundle_identifier: com.africoin.wallet
```

**Note:** Development builds:
- Can only run on registered test devices
- Cannot be distributed via TestFlight or App Store
- Require device UDIDs to be registered in Apple Developer Portal

---

## Current Workflow Analysis

### What's Configured

```yaml
ios_signing:
  distribution_type: app_store
  bundle_identifier: com.africoin.wallet
```

This tells Codemagic to:
1. Fetch an App Store provisioning profile
2. Sign the app for App Store distribution
3. Prepare for TestFlight/App Store submission

### What's Missing

1. ❌ **Apple Developer Account** - Not enrolled
2. ❌ **App ID Registration** - `com.africoin.wallet` not registered
3. ❌ **App Store Connect Integration** - No API key configured
4. ❌ **Provisioning Profile** - Doesn't exist yet
5. ❌ **Signing Certificate** - Not generated

### Why It's Failing

The workflow script runs:

```bash
app-store-connect fetch-signing-files "$PACKAGE_NAME" \
  --type IOS_APP_STORE \
  --create
```

This tries to:
1. Connect to App Store Connect (fails - no integration)
2. Fetch provisioning profile for `com.africoin.wallet` (fails - doesn't exist)
3. Create profile if missing (fails - no permissions)

---

## Recommended Action Plan

### Immediate (Today)

**Disable iOS workflow** to prevent build failures:

```yaml
# Option A: Disable triggering
ios-workflow:
  triggering:
    events: []

# Option B: Comment out entire workflow
# ios-workflow:
#   name: Africoin Wallet iOS
#   ...
```

### Short Term (When Ready for iOS)

1. **Week 1**: Enroll in Apple Developer Program
2. **Week 2**: Register App ID and create app in App Store Connect
3. **Week 3**: Generate API key and configure Codemagic integration
4. **Week 4**: Test iOS build and TestFlight distribution

### Long Term

1. Set up iOS development environment locally
2. Test on physical iOS devices
3. Submit to TestFlight for beta testing
4. Submit to App Store for review

---

## Cost Considerations

### Apple Developer Program

- **Individual**: $99/year
- **Organization**: $99/year
- **Enterprise**: $299/year (for internal distribution only)

### Codemagic Build Minutes

iOS builds typically take longer than Android:
- **Android**: 6-9 minutes (2-4 with caching)
- **iOS**: 10-15 minutes (5-8 with caching)

With caching enabled, iOS builds are manageable.

---

## Alternative: Focus on Android First

### Why This Makes Sense

1. **Lower barrier to entry**: No $99/year fee
2. **Faster iteration**: Android builds are faster
3. **Easier testing**: Can test on any Android device
4. **Larger market in Africa**: Android has 80%+ market share
5. **Google Play**: Easier submission process

### When to Add iOS

Consider iOS when:
- Android app is stable and successful
- You have budget for Apple Developer Program
- You have iOS devices for testing
- You have users requesting iOS version
- You're ready for App Store review process

---

## Quick Fix Commands

### Disable iOS Workflow

```bash
# Edit codemagic.yaml
# Find ios-workflow section
# Change triggering to:
triggering:
  events: []
```

### Or Remove iOS Workflow

```bash
# Simply delete or comment out the entire ios-workflow section
# from line ~270 to end of file
```

---

## Testing the Fix

After disabling iOS workflow:

1. **Commit changes**:
   ```bash
   git add codemagic.yaml
   git commit -m "fix: Disable iOS workflow until Apple Developer account is set up"
   git push origin main
   ```

2. **Trigger Android build**:
   - Push to `main` or `develop` branch
   - Only Android workflows should run
   - iOS workflow should be skipped

3. **Verify**:
   - Check Codemagic dashboard
   - Only `android-debug` or `android-release` should appear
   - No iOS build errors

---

## Resources

### Apple Documentation
- [Apple Developer Program](https://developer.apple.com/programs/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/certificates/list)

### Codemagic Documentation
- [iOS Code Signing](https://docs.codemagic.io/yaml-code-signing/signing-ios/)
- [App Store Connect Integration](https://docs.codemagic.io/yaml-publishing/app-store-connect/)
- [iOS Quick Start](https://docs.codemagic.io/yaml-quick-start/building-a-native-ios-app/)

### Capacitor Documentation
- [iOS Development](https://capacitorjs.com/docs/ios)
- [iOS Configuration](https://capacitorjs.com/docs/ios/configuration)

---

## Summary

**Problem**: iOS workflow fails because no Apple Developer account or provisioning profile exists.

**Immediate Solution**: Disable iOS workflow in `codemagic.yaml`

**Long-term Solution**: 
1. Enroll in Apple Developer Program ($99/year)
2. Register App ID
3. Configure App Store Connect integration
4. Enable iOS workflow

**Recommendation**: Focus on Android first, add iOS later when ready.

---

**Last Updated:** December 29, 2024  
**Status:** iOS workflow should be disabled until Apple Developer setup is complete  
**Priority:** Low (Android is working and is the primary target market)
