# Android Code Signing & Google Play Store Setup

**Project:** Africoin Wallet  
**Developer:** Africa Railways  
**Google Play Developer ID:** 8975457855584245860  
**Package Name:** com.africoin.wallet  
**Date:** December 28, 2024

---

## Overview

This guide covers Android app signing and Google Play Store deployment for the Africoin Wallet application.

## Developer Information

**Google Play Console:**
- Developer ID: `8975457855584245860`
- Developer Name: Africa Railways
- Account Type: Personal
- Legal Name: Benjamin Mpolokoso
- Email: ben.mpolokoso@gmail.com
- Phone: +260975190740
- Address: 2709 N Hayden Island Dr 976942, Portland, OR 97217-8254, USA
- Website: [https://www.africarailways.com/](https://www.africarailways.com/)

---

## Part 1: Generate Release Keystore

### Step 1: Generate Keystore

```bash
# Navigate to android/app directory
mkdir -p android/app

# Generate release keystore
keytool -genkey -v \
  -keystore android/app/africoin-release.keystore \
  -alias africoin \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You will be prompted for:
# - Keystore password (save this securely!)
# - Key password (can be same as keystore password)
# - Your name: Benjamin Mpolokoso
# - Organization: Africa Railways
# - City: Portland
# - State: Oregon
# - Country: US
```

**Important:** Save these credentials securely:
- Keystore password
- Key alias: `africoin`
- Key password

### Step 2: Verify Keystore

```bash
# List keystore contents
keytool -list -v -keystore android/app/africoin-release.keystore

# You should see:
# - Alias name: africoin
# - Creation date
# - Entry type: PrivateKeyEntry
# - Certificate fingerprints (SHA1, SHA256)
```

### Step 3: Secure Keystore

```bash
# Add to .gitignore (already configured)
echo "*.keystore" >> android/.gitignore
echo "*.jks" >> android/.gitignore

# Backup keystore securely
# Store in password manager or secure cloud storage
# NEVER commit to git repository
```

---

## Part 2: Configure Gradle for Signing

### Step 1: Create Signing Configuration

Create `android/key.properties`:

```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=africoin
storeFile=./app/africoin-release.keystore
```

**Add to .gitignore:**
```bash
echo "key.properties" >> android/.gitignore
```

### Step 2: Update build.gradle

Edit `android/app/build.gradle`:

```gradle
android {
    namespace "com.africoin.wallet"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    defaultConfig {
        applicationId "com.africoin.wallet"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
    
    // Load signing configuration
    def keystorePropertiesFile = rootProject.file("key.properties")
    def keystoreProperties = new Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 3: Test Release Build

```bash
cd android
./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
```

---

## Part 3: Google Play Store Setup

### Step 1: Create Service Account

1. Go to [Google Play Console](https://play.google.com/console/developers/8975457855584245860)
2. Navigate to: **Setup → API access**
3. Click **Create new service account**
4. Follow link to Google Cloud Console
5. Create service account:
   - Name: `africoin-wallet-deploy`
   - Description: `Service account for Africoin Wallet CI/CD deployment`
6. Grant permissions:
   - Role: **Service Account User**
7. Create JSON key:
   - Click on service account
   - Keys → Add Key → Create new key
   - Type: JSON
   - Download: `google-play-service-account.json`

### Step 2: Grant Play Console Access

1. Return to Play Console → API access
2. Find your service account
3. Click **Grant access**
4. Permissions:
   - ✅ View app information and download bulk reports
   - ✅ Create and edit draft apps
   - ✅ Release apps to testing tracks
   - ✅ Release apps to production
   - ✅ Manage testing tracks and edit tester lists
5. Click **Invite user**

### Step 3: Secure Service Account Key

```bash
# Move to secure location
mv ~/Downloads/google-play-service-account.json ./google-play-service-account.json

# Add to .gitignore
echo "google-play-service-account.json" >> .gitignore

# Verify it's ignored
git check-ignore google-play-service-account.json
# Should output: google-play-service-account.json
```

---

## Part 4: Codemagic Configuration

### Step 1: Add Signing Credentials to Codemagic

1. Go to [Codemagic Apps](https://codemagic.io/apps)
2. Select your app
3. Navigate to **Environment variables**
4. Create group: `android_signing`
5. Add variables:

**Keystore File:**
- Key: `CM_KEYSTORE`
- Type: File
- Upload: `android/app/africoin-release.keystore`
- Secure: ✅

**Keystore Password:**
- Key: `CM_KEYSTORE_PASSWORD`
- Value: Your keystore password
- Secure: ✅

**Key Alias:**
- Key: `CM_KEY_ALIAS`
- Value: `africoin`
- Secure: ❌

**Key Password:**
- Key: `CM_KEY_PASSWORD`
- Value: Your key password
- Secure: ✅

**Google Play Service Account:**
- Key: `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`
- Type: File
- Upload: `google-play-service-account.json`
- Secure: ✅

### Step 2: Update codemagic.yaml

```yaml
workflows:
  android-release:
    name: Android Release Build
    max_build_duration: 120
    instance_type: mac_mini_m2
    environment:
      groups:
        - africoin_env_vars
        - android_signing
        - browserstack_credentials
      vars:
        PACKAGE_NAME: "com.africoin.wallet"
        APP_NAME: "Africoin Wallet"
      android_signing:
        - africoin_release
      node: 20.19.6
    triggering:
      events:
        - tag
      tag_patterns:
        - pattern: 'v*.*.*'
          include: true
    scripts:
      - name: Install dependencies
        script: |
          npm install
      
      - name: Build web app
        script: |
          npm run build
      
      - name: Install Capacitor
        script: |
          if [ ! -f "capacitor.config.ts" ]; then
            npm install @capacitor/core @capacitor/cli @capacitor/android
            npx cap init "$APP_NAME" "$PACKAGE_NAME" --web-dir=dist
            npx cap add android
          fi
      
      - name: Sync Capacitor
        script: |
          npx cap sync android
      
      - name: Set up keystore
        script: |
          echo $CM_KEYSTORE | base64 --decode > $CM_KEYSTORE_PATH
          cat >> android/key.properties <<EOF
          storePassword=$CM_KEYSTORE_PASSWORD
          keyPassword=$CM_KEY_PASSWORD
          keyAlias=$CM_KEY_ALIAS
          storeFile=$CM_KEYSTORE_PATH
          EOF
      
      - name: Build release APK
        script: |
          cd android
          ./gradlew assembleRelease
      
      - name: Build release AAB
        script: |
          cd android
          ./gradlew bundleRelease
      
      - name: Upload to BrowserStack
        script: |
          APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
          
          if [ -f "$APK_PATH" ]; then
            RESPONSE=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
              -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
              -F "file=@$APK_PATH")
            
            echo "BrowserStack upload: $RESPONSE"
          fi
    
    artifacts:
      - android/app/build/outputs/**/*.apk
      - android/app/build/outputs/**/*.aab
    
    publishing:
      email:
        recipients:
          - ben.mpolokoso@gmail.com
        notify:
          success: true
          failure: true
      
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal
        submit_as_draft: true
```

---

## Part 5: Manual Upload to Play Store

### Step 1: Create App in Play Console

1. Go to [Play Console](https://play.google.com/console/developers/8975457855584245860)
2. Click **Create app**
3. Fill in details:
   - App name: **Africoin Wallet**
   - Default language: **English (United States)**
   - App or game: **App**
   - Free or paid: **Free**
4. Accept declarations
5. Click **Create app**

### Step 2: Complete Store Listing

**Main store listing:**
- App name: Africoin Wallet
- Short description: Secure cryptocurrency wallet for African markets
- Full description: (Detailed description of features)
- App icon: 512x512 PNG
- Feature graphic: 1024x500 PNG
- Screenshots: At least 2 phone screenshots

**Categorization:**
- App category: Finance
- Tags: cryptocurrency, wallet, blockchain

**Contact details:**
- Email: ben.mpolokoso@gmail.com
- Phone: +260975190740
- Website: https://www.africarailways.com/

**Privacy policy:**
- URL: https://www.africarailways.com/privacy-policy

### Step 3: Upload First Release

1. Navigate to **Production → Releases**
2. Click **Create new release**
3. Upload AAB:
   - File: `android/app/build/outputs/bundle/release/app-release.aab`
4. Release name: `1.0.0 (1)`
5. Release notes:
   ```
   Initial release of Africoin Wallet
   - Secure wallet management
   - Multi-currency support
   - Transaction history
   - QR code scanning
   ```
6. Click **Save**
7. Click **Review release**
8. Click **Start rollout to Production**

---

## Part 6: Version Management

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH (BUILD)`

**Example:**
- Version Name: `1.0.0`
- Version Code: `1`

### Update Version

Edit `android/app/build.gradle`:

```gradle
defaultConfig {
    applicationId "com.africoin.wallet"
    versionCode 2  // Increment for each release
    versionName "1.0.1"  // Semantic version
}
```

### Automated Versioning

Add to `codemagic.yaml`:

```yaml
scripts:
  - name: Increment version
    script: |
      # Extract version from git tag
      VERSION_NAME=${CM_TAG#v}  # Remove 'v' prefix
      VERSION_CODE=$((BUILD_NUMBER))
      
      # Update build.gradle
      sed -i '' "s/versionCode .*/versionCode $VERSION_CODE/" android/app/build.gradle
      sed -i '' "s/versionName .*/versionName \"$VERSION_NAME\"/" android/app/build.gradle
```

---

## Part 7: Testing Tracks

### Internal Testing

**Purpose:** Quick testing with small team

**Setup:**
1. Go to **Testing → Internal testing**
2. Create release
3. Add testers:
   - Create email list
   - Add: ben.mpolokoso@gmail.com
4. Upload AAB
5. Rollout to internal testing

**Access:**
- Testers receive email with opt-in link
- Install via Play Store

### Closed Testing (Alpha/Beta)

**Purpose:** Larger testing group before production

**Setup:**
1. Go to **Testing → Closed testing**
2. Create track (e.g., "beta")
3. Add testers or create open link
4. Upload AAB
5. Rollout to closed testing

### Open Testing

**Purpose:** Public beta testing

**Setup:**
1. Go to **Testing → Open testing**
2. Create release
3. Upload AAB
4. Anyone can join via Play Store

---

## Part 8: Security Best Practices

### Keystore Security

**DO:**
- ✅ Store keystore in secure location
- ✅ Use strong passwords (16+ characters)
- ✅ Backup keystore to multiple secure locations
- ✅ Use password manager for credentials
- ✅ Restrict access to keystore file

**DON'T:**
- ❌ Commit keystore to git
- ❌ Share keystore via email/chat
- ❌ Use weak passwords
- ❌ Store passwords in plain text
- ❌ Lose keystore (cannot recover!)

### Service Account Security

**DO:**
- ✅ Use service account for CI/CD only
- ✅ Grant minimum required permissions
- ✅ Rotate keys annually
- ✅ Monitor API usage
- ✅ Revoke unused keys

**DON'T:**
- ❌ Commit service account JSON to git
- ❌ Share service account credentials
- ❌ Grant excessive permissions
- ❌ Use personal account for automation

---

## Part 9: Troubleshooting

### Build Fails: Keystore Not Found

**Problem:** `Keystore file not found`

**Solution:**
```bash
# Verify keystore exists
ls -la android/app/africoin-release.keystore

# Check key.properties
cat android/key.properties

# Verify path is correct
storeFile=./app/africoin-release.keystore  # Relative to android/
```

### Upload Fails: Invalid Signature

**Problem:** `Upload failed: APK signature verification failed`

**Solution:**
```bash
# Verify APK is signed
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk

# Check signing config in build.gradle
# Ensure release buildType uses signingConfig
```

### Play Console: Version Code Conflict

**Problem:** `Version code X has already been used`

**Solution:**
```bash
# Increment version code in build.gradle
versionCode 2  # Must be higher than previous

# Or use build number
versionCode $BUILD_NUMBER
```

### Service Account: Permission Denied

**Problem:** `The caller does not have permission`

**Solution:**
1. Go to Play Console → API access
2. Find service account
3. Verify permissions are granted
4. Wait 24 hours for permissions to propagate

---

## Part 10: Automation Scripts

### Build and Sign Script

Create `scripts/build-release.sh`:

```bash
#!/bin/bash
set -e

echo "Building Africoin Wallet release..."

# Build web app
npm run build

# Sync Capacitor
npx cap sync android

# Build release
cd android
./gradlew assembleRelease
./gradlew bundleRelease

echo "✅ Build complete!"
echo "APK: android/app/build/outputs/apk/release/app-release.apk"
echo "AAB: android/app/build/outputs/bundle/release/app-release.aab"
```

### Upload to Play Store Script

Create `scripts/upload-playstore.sh`:

```bash
#!/bin/bash
set -e

AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"

if [ ! -f "$AAB_PATH" ]; then
    echo "❌ AAB not found: $AAB_PATH"
    exit 1
fi

echo "Uploading to Google Play Store..."

# Using fastlane or gradle-play-publisher
# Or manual upload via Play Console

echo "✅ Upload complete!"
```

---

## Resources

### Google Play Console
- Developer Console: [https://play.google.com/console/developers/8975457855584245860](https://play.google.com/console/developers/8975457855584245860)
- API Access: [https://play.google.com/console/developers/8975457855584245860/api-access](https://play.google.com/console/developers/8975457855584245860/api-access)
- App Dashboard: (After app creation)

### Documentation
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [Play Console Help](https://support.google.com/googleplay/android-developer)
- [Codemagic Android Signing](https://docs.codemagic.io/yaml-code-signing/signing-android/)
- [Capacitor Android](https://capacitorjs.com/docs/android)

### Tools
- [keytool](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html) - Keystore management
- [jarsigner](https://docs.oracle.com/javase/8/docs/technotes/tools/windows/jarsigner.html) - APK verification
- [bundletool](https://developer.android.com/studio/command-line/bundletool) - AAB testing

---

## Next Steps

1. **Immediate:**
   - [ ] Generate release keystore
   - [ ] Configure Gradle signing
   - [ ] Test release build locally
   - [ ] Backup keystore securely

2. **This Week:**
   - [ ] Create Google Play service account
   - [ ] Add signing credentials to Codemagic
   - [ ] Create app in Play Console
   - [ ] Complete store listing

3. **Before Launch:**
   - [ ] Upload to internal testing
   - [ ] Test on multiple devices
   - [ ] Gather feedback
   - [ ] Prepare marketing materials

4. **Launch:**
   - [ ] Upload to production
   - [ ] Monitor crash reports
   - [ ] Respond to user reviews
   - [ ] Plan updates

---

**Last Updated:** December 28, 2024  
**Status:** ✅ Ready for Implementation
