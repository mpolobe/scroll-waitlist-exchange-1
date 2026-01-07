# Codemagic Setup Checklist

**Project:** Africoin Wallet  
**Repository:** https://github.com/mpolobe/scroll-waitlist-exchange-1.git  
**Date:** December 28, 2024

---

## Overview

This checklist ensures all environment variables and credentials are properly configured in Codemagic for successful builds.

---

## 1. Environment Variable Groups

Codemagic uses environment variable groups to organize credentials. Create these groups:

### Group 1: `africoin_env_vars`

Application environment variables:

| Variable Name | Value | Secure | Required |
|--------------|-------|--------|----------|
| `VITE_ALCHEMY_API_KEY` | Your Alchemy API key | ✅ Yes | ✅ Yes |
| `VITE_ALCHEMY_GAS_POLICY_ID` | Your Gas Manager Policy ID | ✅ Yes | ❌ No |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | ✅ Yes | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Your Gemini API key | ✅ Yes | ✅ Yes |

**How to get:**
- Alchemy: https://dashboard.alchemy.com/
- Supabase: https://app.supabase.com/
- Gemini: https://aistudio.google.com/app/apikey

### Group 2: `browserstack_credentials`

BrowserStack testing credentials:

| Variable Name | Value | Secure | Required |
|--------------|-------|--------|----------|
| `BROWSERSTACK_USERNAME` | `benjaminmpolokos_dzbone` | ❌ No | ✅ Yes |
| `BROWSERSTACK_ACCESS_KEY` | `YkRwgayd5JiTUZWKBCNp` | ✅ Yes | ✅ Yes |
| `BROWSERSTACK_URL` | `http://benjaminmpolokos_dzbone.browserstack.com` | ❌ No | ❌ No |

**How to get:**
- BrowserStack: https://www.browserstack.com/accounts/settings

### Group 3: `android_signing`

Android code signing credentials:

| Variable Name | Type | Value | Secure | Required |
|--------------|------|-------|--------|----------|
| `CM_KEYSTORE` | File | Upload `africoin-release.keystore` | ✅ Yes | ✅ Yes |
| `CM_KEYSTORE_PASSWORD` | Text | Your keystore password | ✅ Yes | ✅ Yes |
| `CM_KEY_ALIAS` | Text | `africoin` | ❌ No | ✅ Yes |
| `CM_KEY_PASSWORD` | Text | Your key password | ✅ Yes | ✅ Yes |
| `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS` | File | Upload service account JSON | ✅ Yes | ✅ Yes |

**How to generate:**
- Keystore: Run `./scripts/generate-keystore.sh`
- Service Account: See [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md)

---

## 2. Code Signing Identities

### Android Signing

1. Go to Codemagic app settings
2. Navigate to **Code signing identities**
3. Click **Android** tab
4. Add signing identity:
   - Name: `africoin_release`
   - Upload keystore file
   - Enter keystore password
   - Enter key alias: `africoin`
   - Enter key password

---

## 3. Workflow Configuration

Verify `codemagic.yaml` references the correct groups:

### Android Debug Workflow

```yaml
environment:
  groups:
    - africoin_env_vars
    - browserstack_credentials
```

### Android Release Workflow

```yaml
environment:
  groups:
    - africoin_env_vars
    - android_signing
    - browserstack_credentials
  android_signing:
    - africoin_release
```

### iOS Workflow

```yaml
environment:
  groups:
    - africoin_env_vars
  ios_signing:
    distribution_type: app_store
    bundle_identifier: com.africoin.wallet
```

---

## 4. Setup Steps

### Step 1: Create Codemagic Account

1. Go to https://codemagic.io/
2. Sign up with GitHub account
3. Authorize Codemagic to access repositories

### Step 2: Add Repository

1. Click **Add application**
2. Select repository: `mpolobe/scroll-waitlist-exchange-1`
3. Choose **Flutter/React Native/Ionic/Cordova**
4. Select **codemagic.yaml** configuration

### Step 3: Configure Environment Variables

1. Go to app settings
2. Click **Environment variables**
3. Create groups as listed above
4. Add all required variables

### Step 4: Add Code Signing

**For Android:**
1. Generate keystore: `./scripts/generate-keystore.sh`
2. Upload to Codemagic code signing identities
3. Add to `android_signing` group

**For iOS:**
1. Connect Apple Developer account
2. Configure automatic code signing
3. Or upload provisioning profiles manually

### Step 5: Test Build

1. Go to **Start new build**
2. Select workflow: `android-debug`
3. Select branch: `main`
4. Click **Start new build**
5. Monitor build logs

---

## 5. Verification Checklist

Before triggering builds, verify:

### Local Files
- [ ] `capacitor.config.ts` exists and is committed
- [ ] `android/variables.gradle` exists
- [ ] `android/build.gradle` exists
- [ ] `android/app/build.gradle` exists
- [ ] `.gitignore` excludes sensitive files
- [ ] `codemagic.yaml` is valid YAML

### Codemagic Configuration
- [ ] Repository connected
- [ ] `africoin_env_vars` group created with all variables
- [ ] `browserstack_credentials` group created
- [ ] `android_signing` group created (for release builds)
- [ ] Android signing identity `africoin_release` added
- [ ] Workflows are visible in Codemagic UI

### Credentials
- [ ] Alchemy API key is valid
- [ ] Supabase URL and key are correct
- [ ] Gemini API key is valid
- [ ] BrowserStack credentials tested
- [ ] Android keystore generated and backed up
- [ ] Google Play service account created

---

## 6. Build Triggers

### Debug Builds

Triggered automatically on:
- Push to `main` branch
- Push to `develop` branch
- Pull requests to `main` or `develop`

### Release Builds

Triggered on version tags:
```bash
git tag v1.0.0
git push origin v1.0.0
```

Tag pattern: `v*.*.*` (e.g., v1.0.0, v1.2.3)

---

## 7. Build Outputs

### Debug Build Artifacts
- `android/app/build/outputs/apk/debug/app-debug.apk`
- Uploaded to BrowserStack automatically
- Email notification sent

### Release Build Artifacts
- `android/app/build/outputs/apk/release/app-release.apk`
- `android/app/build/outputs/bundle/release/app-release.aab`
- Uploaded to BrowserStack automatically
- Published to Google Play (internal track, draft)
- Email notification sent

---

## 8. Troubleshooting

### Build Fails: Missing Environment Variable

**Error:** `VITE_ALCHEMY_API_KEY is not set`

**Solution:**
1. Go to Codemagic app settings
2. Environment variables
3. Check `africoin_env_vars` group
4. Ensure variable is added and not empty

### Build Fails: Keystore Not Found

**Error:** `CM_KEYSTORE not found`

**Solution:**
1. Generate keystore: `./scripts/generate-keystore.sh`
2. Go to Codemagic → Code signing identities → Android
3. Upload keystore file
4. Ensure signing identity name matches `codemagic.yaml`

### Build Fails: BrowserStack Upload

**Error:** `curl: (22) The requested URL returned error: 401`

**Solution:**
1. Verify BrowserStack credentials
2. Test locally:
   ```bash
   curl -u "benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp" \
     https://api.browserstack.com/app-automate/plan.json
   ```
3. Update credentials in Codemagic if needed

### Build Fails: Gradle Dependency Conflict

**Error:** `checkDebugDuplicateClasses FAILED`

**Solution:**
- This should be fixed by the pre-configured Android build files
- If still occurs, check `android/build.gradle` has dependency resolution strategy
- Run `./gradlew clean` before building

### Build Fails: Google Play Upload

**Error:** `The caller does not have permission`

**Solution:**
1. Go to Play Console → API access
2. Find service account
3. Grant required permissions
4. Wait 24 hours for permissions to propagate

---

## 9. Security Best Practices

### DO:
- ✅ Mark all API keys and passwords as **Secure** in Codemagic
- ✅ Use environment variable groups to organize credentials
- ✅ Rotate credentials every 90 days
- ✅ Backup keystore to multiple secure locations
- ✅ Use strong passwords (16+ characters)
- ✅ Enable 2FA on all accounts

### DON'T:
- ❌ Commit credentials to repository
- ❌ Share credentials via email or chat
- ❌ Use same credentials across projects
- ❌ Log credentials in build output
- ❌ Store credentials in plain text locally

---

## 10. Quick Reference

### Codemagic URLs
- Dashboard: https://codemagic.io/apps
- App Settings: https://codemagic.io/app/{app-id}/settings
- Build History: https://codemagic.io/app/{app-id}/builds

### External Services
- Alchemy: https://dashboard.alchemy.com/
- Supabase: https://app.supabase.com/
- Gemini: https://aistudio.google.com/
- BrowserStack: https://app-live.browserstack.com/
- Google Play: https://play.google.com/console/developers/8975457855584245860

### Documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md) - Android signing details
- [BROWSERSTACK_SETUP.md](./BROWSERSTACK_SETUP.md) - BrowserStack integration
- [codemagic.yaml](./codemagic.yaml) - CI/CD configuration

### Support
- Developer: ben.mpolokoso@gmail.com
- Website: https://www.africarailways.com/
- Repository: https://github.com/mpolobe/scroll-waitlist-exchange-1

---

## 11. Next Steps

After completing this checklist:

1. **Test Debug Build:**
   - Push to `main` branch
   - Monitor build in Codemagic
   - Verify APK is uploaded to BrowserStack
   - Test APK on real devices

2. **Test Release Build:**
   - Create version tag: `git tag v0.1.0`
   - Push tag: `git push origin v0.1.0`
   - Monitor build in Codemagic
   - Verify AAB is created
   - Check Google Play Console for draft release

3. **Production Release:**
   - Test thoroughly on multiple devices
   - Update version in `android/app/build.gradle`
   - Create production tag: `git tag v1.0.0`
   - Monitor rollout in Play Console

---

**Last Updated:** December 28, 2024  
**Status:** ✅ Ready for Configuration
