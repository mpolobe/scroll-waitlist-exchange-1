# Africoin Wallet - Complete Deployment Guide

**Project:** Africoin Wallet  
**Developer:** Africa Railways  
**Google Play Developer ID:** 8975457855584245860  
**Package Name:** com.africoin.wallet  
**Date:** December 28, 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [BrowserStack Integration](#browserstack-integration)
5. [Android Code Signing](#android-code-signing)
6. [Google Play Store Deployment](#google-play-store-deployment)
7. [CI/CD Automation](#cicd-automation)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the complete deployment pipeline for Africoin Wallet:
- BrowserStack device testing
- Android code signing
- Google Play Store publishing
- Automated CI/CD with Codemagic

---

## Prerequisites

### Required Tools

```bash
# Node.js and npm
node --version  # v20.19.6 or higher
npm --version

# Java Development Kit (for Android)
java -version  # JDK 11 or higher

# Android SDK (via Android Studio or command line tools)
# Set ANDROID_HOME environment variable

# Git
git --version

# Optional: GitHub CLI
gh --version
```

### Required Accounts

- ✅ Google Play Developer Account (ID: 8975457855584245860)
- ✅ BrowserStack Account (benjaminmpolokos_dzbone)
- ✅ Codemagic Account
- ✅ GitHub Account

---

## Quick Start

### 1. Clone and Setup

```bash
# Clone repository
git clone https://github.com/mpolobe/scroll-waitlist-exchange-1.git
cd scroll-waitlist-exchange-1

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 2. Configure BrowserStack

```bash
# Run automated setup
./setup-browserstack.sh

# Or manually add to .env:
BROWSERSTACK_USERNAME=benjaminmpolokos_dzbone
BROWSERSTACK_ACCESS_KEY=YkRwgayd5JiTUZWKBCNp
BROWSERSTACK_URL=http://benjaminmpolokos_dzbone.browserstack.com
```

### 3. Generate Android Keystore

```bash
# Run keystore generation script
./scripts/generate-keystore.sh

# Follow prompts and save passwords securely
# Keystore will be created at: android/app/africoin-release.keystore
```

### 4. Build and Test

```bash
# Build debug APK
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# Or use build script for release
./scripts/build-release.sh
```

---

## BrowserStack Integration

### Setup

**Credentials:**
- Username: `benjaminmpolokos_dzbone`
- Access Key: `YkRwgayd5JiTUZWKBCNp`
- Local Testing URL: [http://benjaminmpolokos_dzbone.browserstack.com](http://benjaminmpolokos_dzbone.browserstack.com)

### Test Connection

```bash
curl -u "benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp" \
  https://api.browserstack.com/app-automate/plan.json
```

**Expected Response:**
```json
{
  "automate_plan": "Free",
  "parallel_sessions_max_allowed": 5,
  "terminal_access": "Public"
}
```

### Upload APK

```bash
# Upload debug APK
curl -u "benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@android/app/build/outputs/apk/debug/app-debug.apk"
```

### Manual Testing

1. Go to [BrowserStack App Live](https://app-live.browserstack.com/)
2. Upload your APK
3. Select device (e.g., Samsung Galaxy S21)
4. Test interactively

### Recommended Test Devices

**Android:**
- Samsung Galaxy S21 (Android 11)
- Google Pixel 6 (Android 12)
- OnePlus 9 (Android 11)
- Samsung Galaxy A52 (Android 11)

**Priority for African Markets:**
- Samsung Galaxy A series
- Tecno Spark series
- Infinix Hot series
- Xiaomi Redmi series

---

## Android Code Signing

### Generate Keystore

```bash
# Using provided script (recommended)
./scripts/generate-keystore.sh

# Or manually
keytool -genkey -v \
  -keystore android/app/africoin-release.keystore \
  -alias africoin \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Save These Credentials:**
- Keystore password
- Key password
- Key alias: `africoin`

### Configure Signing

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=africoin
storeFile=./app/africoin-release.keystore
```

### Update build.gradle

The signing configuration is already set up in `android/app/build.gradle`. It will automatically use `key.properties` if it exists.

### Build Signed APK

```bash
# Using build script (recommended)
./scripts/build-release.sh

# Or manually
cd android
./gradlew assembleRelease  # APK
./gradlew bundleRelease    # AAB for Play Store
```

**Outputs:**
- APK: `android/app/build/outputs/apk/release/app-release.apk`
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Verify Signature

```bash
# Verify APK is signed
jarsigner -verify -verbose -certs \
  android/app/build/outputs/apk/release/app-release.apk

# Should show: "jar verified"
```

---

## Google Play Store Deployment

### Developer Account Details

- **Developer ID:** 8975457855584245860
- **Developer Name:** Africa Railways
- **Legal Name:** Benjamin Mpolokoso
- **Email:** ben.mpolokoso@gmail.com
- **Phone:** +260975190740
- **Website:** [https://www.africarailways.com/](https://www.africarailways.com/)

### Create Service Account

1. Go to [Play Console API Access](https://play.google.com/console/developers/8975457855584245860/api-access)
2. Click **Create new service account**
3. Follow link to Google Cloud Console
4. Create service account:
   - Name: `africoin-wallet-deploy`
   - Role: Service Account User
5. Create JSON key and download
6. Return to Play Console and grant access

### Create App in Play Console

1. Go to [Play Console](https://play.google.com/console/developers/8975457855584245860)
2. Click **Create app**
3. Fill in details:
   - **App name:** Africoin Wallet
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Complete store listing:
   - Short description
   - Full description
   - App icon (512x512 PNG)
   - Feature graphic (1024x500 PNG)
   - Screenshots (at least 2)
5. Set category: **Finance**
6. Add contact details and privacy policy

### Upload First Release

**Internal Testing (Recommended First):**

1. Navigate to **Testing → Internal testing**
2. Click **Create new release**
3. Upload AAB: `android/app/build/outputs/bundle/release/app-release.aab`
4. Add release notes
5. Add testers (email: ben.mpolokoso@gmail.com)
6. Click **Review release** → **Start rollout**

**Production Release:**

1. Navigate to **Production → Releases**
2. Click **Create new release**
3. Upload AAB
4. Add release notes
5. Review and rollout

### Version Management

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1      // Increment for each release
    versionName "1.0.0"  // Semantic version
}
```

**Version Strategy:**
- `versionCode`: Integer, must increase with each release
- `versionName`: String, semantic versioning (MAJOR.MINOR.PATCH)

---

## CI/CD Automation

### Codemagic Setup

**Environment Groups:**

1. **africoin_env_vars**
   - `VITE_ALCHEMY_API_KEY`
   - `VITE_ALCHEMY_GAS_POLICY_ID`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_GEMINI_API_KEY`

2. **browserstack_credentials**
   - `BROWSERSTACK_USERNAME`: `benjaminmpolokos_dzbone`
   - `BROWSERSTACK_ACCESS_KEY`: `YkRwgayd5JiTUZWKBCNp` (secure)
   - `BROWSERSTACK_URL`: `http://benjaminmpolokos_dzbone.browserstack.com`

3. **android_signing**
   - `CM_KEYSTORE`: Upload keystore file (secure)
   - `CM_KEYSTORE_PASSWORD`: Your keystore password (secure)
   - `CM_KEY_ALIAS`: `africoin`
   - `CM_KEY_PASSWORD`: Your key password (secure)
   - `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`: Upload service account JSON (secure)

### Workflows

**Debug Build (on push to main/develop):**
- Builds debug APK
- Uploads to BrowserStack
- Sends email notification

**Release Build (on version tag):**
- Builds signed release APK and AAB
- Uploads to BrowserStack
- Publishes to Play Store (internal track)
- Sends email notification

### Trigger Release Build

```bash
# Tag version
git tag v1.0.0
git push origin v1.0.0

# Codemagic will automatically:
# 1. Build signed APK and AAB
# 2. Upload to BrowserStack
# 3. Publish to Play Store internal track
```

### GitHub Actions (Alternative)

Add secrets to repository:
```bash
gh secret set BROWSERSTACK_USERNAME
gh secret set BROWSERSTACK_ACCESS_KEY
gh secret set ANDROID_KEYSTORE_BASE64
gh secret set KEYSTORE_PASSWORD
gh secret set KEY_PASSWORD
```

---

## Troubleshooting

### BrowserStack Connection Failed

**Problem:** Cannot connect to BrowserStack API

**Solution:**
```bash
# Verify credentials
echo $BROWSERSTACK_USERNAME
echo $BROWSERSTACK_ACCESS_KEY

# Test connection
curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
  https://api.browserstack.com/app-automate/plan.json
```

### Keystore Not Found

**Problem:** `Keystore file not found for signing config 'release'`

**Solution:**
```bash
# Verify keystore exists
ls -la android/app/africoin-release.keystore

# Verify key.properties
cat android/key.properties

# Check path in key.properties
storeFile=./app/africoin-release.keystore  # Relative to android/
```

### Build Failed: Signing Error

**Problem:** `Failed to read key from keystore`

**Solution:**
```bash
# Verify keystore password
keytool -list -v -keystore android/app/africoin-release.keystore

# Check key.properties has correct passwords
# Ensure no extra spaces or special characters
```

### Play Store Upload Failed

**Problem:** `Version code X has already been used`

**Solution:**
```bash
# Increment version code in build.gradle
versionCode 2  # Must be higher than previous

# Rebuild
./scripts/build-release.sh
```

### Service Account Permission Denied

**Problem:** `The caller does not have permission`

**Solution:**
1. Go to Play Console → API access
2. Find service account
3. Click **Grant access**
4. Ensure permissions are checked:
   - Release apps to testing tracks
   - Release apps to production
5. Wait 24 hours for permissions to propagate

### Capacitor Not Initialized

**Problem:** `capacitor.config.ts not found`

**Solution:**
```bash
# Initialize Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Africoin Wallet" "com.africoin.wallet" --web-dir=dist
npx cap add android
```

---

## Security Checklist

### Before Committing

- [ ] `.env` is in `.gitignore`
- [ ] `*.keystore` is in `.gitignore`
- [ ] `key.properties` is in `.gitignore`
- [ ] `google-play-service-account.json` is in `.gitignore`
- [ ] No credentials in code files

### Verify

```bash
# Check what would be committed
git status

# Verify sensitive files are ignored
git check-ignore .env
git check-ignore android/app/africoin-release.keystore
git check-ignore android/key.properties
git check-ignore google-play-service-account.json
```

### Backup

- [ ] Keystore backed up to secure cloud storage
- [ ] Passwords saved in password manager
- [ ] Service account JSON backed up securely
- [ ] Recovery codes saved

---

## Resources

### Documentation
- [BROWSERSTACK_SETUP.md](./BROWSERSTACK_SETUP.md) - BrowserStack integration guide
- [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md) - Detailed signing guide
- [codemagic.yaml](./codemagic.yaml) - CI/CD configuration

### Scripts
- `setup-browserstack.sh` - BrowserStack setup automation
- `scripts/generate-keystore.sh` - Keystore generation
- `scripts/build-release.sh` - Release build automation

### External Links
- [Google Play Console](https://play.google.com/console/developers/8975457855584245860)
- [BrowserStack Dashboard](https://app-live.browserstack.com/)
- [Codemagic Apps](https://codemagic.io/apps)
- [Capacitor Documentation](https://capacitorjs.com/docs)

### Support
- Developer Email: ben.mpolokoso@gmail.com
- Website: [https://www.africarailways.com/](https://www.africarailways.com/)
- Phone: +260975190740

---

## Quick Reference

### Common Commands

```bash
# Setup
npm install
cp .env.example .env
./setup-browserstack.sh

# Development
npm run dev
npm run build

# Android
npx cap sync android
cd android && ./gradlew assembleDebug

# Release
./scripts/generate-keystore.sh
./scripts/build-release.sh

# Deploy
git tag v1.0.0
git push origin v1.0.0
```

### File Locations

```
scroll-waitlist-exchange-1/
├── .env                                    # Environment variables (gitignored)
├── android/
│   ├── app/
│   │   └── africoin-release.keystore      # Release keystore (gitignored)
│   └── key.properties                      # Signing config (gitignored)
├── google-play-service-account.json        # Service account (gitignored)
├── scripts/
│   ├── generate-keystore.sh               # Keystore generation
│   └── build-release.sh                    # Release build
├── setup-browserstack.sh                   # BrowserStack setup
├── BROWSERSTACK_SETUP.md                   # BrowserStack guide
├── ANDROID_SIGNING_SETUP.md                # Signing guide
└── codemagic.yaml                          # CI/CD config
```

---

**Last Updated:** December 28, 2024  
**Status:** ✅ Ready for Deployment
