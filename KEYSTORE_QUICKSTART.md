# Android Keystore Quick Start

Quick reference for setting up Android code signing for Africoin Wallet.

## 1. Generate Keystore (One-Time Setup)

```bash
keytool -genkey -v -keystore africoin-wallet.keystore \
  -alias africoin-wallet \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Save these details securely:**
- Keystore file: `africoin-wallet.keystore`
- Keystore password: [your password]
- Key alias: `africoin-wallet`
- Key password: [your password]

## 2. Upload to Codemagic

### Via UI (Recommended)
1. Go to https://codemagic.io/apps
2. Select your app → **Settings** → **Code signing identities**
3. Click **Android** tab → **Upload keystore**
4. Fill in:
   - Upload `africoin-wallet.keystore`
   - Keystore password
   - Key alias: `africoin-wallet`
   - Key password
   - Reference name: `africoin_wallet_keystore`

### Via API
```bash
export CODEMAGIC_API_TOKEN="your_token"
export APP_ID="your_app_id"

curl -X POST \
  -H "x-auth-token: $CODEMAGIC_API_TOKEN" \
  -F "certificate=@africoin-wallet.keystore" \
  -F "certificate_password=your_password" \
  "https://api.codemagic.io/apps/$APP_ID/android-keystore"
```

## 3. Configuration Already Done ✅

The `codemagic.yaml` has been updated with:
- Android signing reference: `africoin_wallet_keystore`
- Release build steps (APK + AAB)
- Google Play publishing template (commented out)

## 4. Build Signed App

### Trigger Build
```bash
# Via Git tag
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Or via Codemagic UI
# Go to app → Start new build
```

### Build Outputs
- **APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **AAB:** `android/app/build/outputs/bundle/release/app-release.aab`

Use AAB for Google Play Store.

## 5. Verify Signed APK

```bash
# Download APK from Codemagic artifacts
jarsigner -verify -verbose -certs app-release.apk
```

Expected: `jar verified.`

## 6. Upload to Google Play

1. Go to [Google Play Console](https://play.google.com/console)
2. Create app (if first time)
3. **Production** → **Create new release**
4. Upload `app-release.aab`
5. Fill in release notes
6. Review and rollout

## Important Notes

⚠️ **Backup your keystore!** If lost, you cannot update your app.

**Backup locations:**
- Password manager (1Password, LastPass)
- Encrypted cloud storage
- Physical secure location

⚠️ **Never commit keystore to Git!**

Check `.gitignore` includes:
```
*.keystore
*.jks
```

## Troubleshooting

**Build fails: "Keystore not found"**
- Verify reference name in Codemagic matches: `africoin_wallet_keystore`

**Build fails: "Wrong password"**
- Double-check passwords in Codemagic settings

**Google Play rejects: "Signature mismatch"**
- Must use same keystore for all updates
- If lost, need to create new app listing

## Resources

- Full guide: `ANDROID_SIGNING_SETUP.md`
- [Codemagic Docs](https://docs.codemagic.io/yaml-code-signing/signing-android/)
- [Android Developer Guide](https://developer.android.com/studio/publish/app-signing)

---

**Status:** Configuration complete, ready for keystore upload  
**Next Step:** Generate keystore and upload to Codemagic
