# BrowserStack Integration Setup

**Project:** Africoin Wallet  
**Developer:** Africa Railways  
**Google Play Developer ID:** 8975457855584245860  
**Date:** December 28, 2024

---

## Overview

BrowserStack integration enables automated and manual testing of the Africoin Wallet mobile app across real Android and iOS devices.

## Credentials

**BrowserStack Account:**
- Username: `benjaminmpolokos_dzbone`
- Access Key: `YkRwgayd5JiTUZWKBCNp`
- Local Testing URL: [http://benjaminmpolokos_dzbone.browserstack.com](http://benjaminmpolokos_dzbone.browserstack.com)

**Developer Information:**
- Developer Name: Africa Railways
- Legal Name: Benjamin Mpolokoso
- Contact Email: ben.mpolokoso@gmail.com
- Phone: +260975190740
- Website: [https://www.africarailways.com/](https://www.africarailways.com/)
- Location: Portland, OR, USA

---

## Quick Start

### 1. Test BrowserStack Connection

```bash
curl -u "benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp" \
  https://api.browserstack.com/app-automate/plan.json
```

### 2. Upload APK for Testing

```bash
# After building your APK
curl -u "benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@android/app/build/outputs/apk/debug/app-debug.apk"
```

### 3. Manual Testing

1. Go to [BrowserStack App Live](https://app-live.browserstack.com/)
2. Upload your APK
3. Select device and OS version
4. Test your app interactively

---

## CI/CD Integration

### Codemagic Setup

The BrowserStack credentials are configured in the `browserstack_credentials` environment group.

**To add credentials manually:**

1. Go to [Codemagic Settings](https://codemagic.io/apps)
2. Select your app
3. Navigate to Environment variables
4. Create group: `browserstack_credentials`
5. Add variables:
   - `BROWSERSTACK_USERNAME`: `benjaminmpolokos_dzbone`
   - `BROWSERSTACK_ACCESS_KEY`: `YkRwgayd5JiTUZWKBCNp` (mark as secure)
   - `BROWSERSTACK_URL`: `http://benjaminmpolokos_dzbone.browserstack.com`

**Automated Setup:**

```bash
# Set your Codemagic API token
export CODEMAGIC_API_TOKEN="your_token_here"

# Run setup script
./setup-browserstack.sh
```

### GitHub Actions Setup

Add BrowserStack credentials as repository secrets:

1. Go to repository Settings → Secrets and variables → Actions
2. Add secrets:
   - `BROWSERSTACK_USERNAME`
   - `BROWSERSTACK_ACCESS_KEY`
   - `BROWSERSTACK_URL`

**Using GitHub CLI:**

```bash
echo "benjaminmpolokos_dzbone" | gh secret set BROWSERSTACK_USERNAME
echo "YkRwgayd5JiTUZWKBCNp" | gh secret set BROWSERSTACK_ACCESS_KEY
echo "http://benjaminmpolokos_dzbone.browserstack.com" | gh secret set BROWSERSTACK_URL
```

---

## Workflow Examples

### Upload APK After Build (Codemagic)

```yaml
workflows:
  android-browserstack:
    name: Android Build + BrowserStack Upload
    environment:
      groups:
        - africoin_env_vars
        - browserstack_credentials
    scripts:
      - name: Build APK
        script: |
          npm run build
          npx cap sync android
          cd android && ./gradlew assembleDebug
      
      - name: Upload to BrowserStack
        script: |
          APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
          
          RESPONSE=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
            -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
            -F "file=@$APK_PATH")
          
          echo "Upload response: $RESPONSE"
          APP_URL=$(echo $RESPONSE | jq -r '.app_url')
          echo "App URL: $APP_URL"
```

### GitHub Actions Workflow

```yaml
name: BrowserStack Upload

on:
  push:
    branches: [main, develop]

jobs:
  upload:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build APK
        run: |
          npm install
          npm run build
          # Add your build commands
      
      - name: Upload to BrowserStack
        env:
          BROWSERSTACK_USERNAME: ${{ secrets.BROWSERSTACK_USERNAME }}
          BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_ACCESS_KEY }}
        run: |
          curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
            -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
            -F "file=@path/to/app.apk"
```

---

## Testing Strategies

### Manual Testing

**Use Cases:**
- Pre-release QA
- Visual regression testing
- Device-specific bug reproduction
- User acceptance testing

**Process:**
1. Build APK/IPA
2. Upload to BrowserStack
3. Select target devices
4. Test interactively
5. Record issues with screenshots/videos

### Automated Testing

**Use Cases:**
- Regression testing
- Critical path validation
- Multi-device compatibility
- Performance testing

**Setup:**
1. Install testing framework (Appium, Detox, etc.)
2. Write test scripts
3. Configure device matrix
4. Integrate with CI/CD
5. Monitor test results

---

## Device Matrix

### Recommended Test Devices

**Android:**
- Samsung Galaxy S21 (Android 11)
- Google Pixel 6 (Android 12)
- OnePlus 9 (Android 11)
- Samsung Galaxy A52 (Android 11)
- Xiaomi Redmi Note 10 (Android 11)

**iOS:**
- iPhone 13 Pro (iOS 15)
- iPhone 12 (iOS 14)
- iPhone SE 2020 (iOS 14)
- iPad Pro 11" (iOS 15)

### Priority Devices for Africa

Based on market share in African markets:
- Samsung Galaxy A series
- Tecno Spark series
- Infinix Hot series
- Xiaomi Redmi series

---

## Security Best Practices

### Credential Management

**DO:**
- ✅ Store credentials in CI/CD platform secrets
- ✅ Mark sensitive values as secure
- ✅ Rotate credentials every 90 days
- ✅ Use environment-specific credentials
- ✅ Enable 2FA on BrowserStack account

**DON'T:**
- ❌ Commit credentials to repository
- ❌ Log credentials in build output
- ❌ Share credentials via email/chat
- ❌ Use same credentials across projects

### Access Control

1. Enable 2FA on BrowserStack account
2. Use team management for multiple developers
3. Review access logs monthly
4. Rotate credentials when team members leave

---

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to BrowserStack API

**Solution:**
```bash
# Test connection
curl -u "benjaminmpolokos_dzbone:YkRwgayd5JiTUZWKBCNp" \
  https://api.browserstack.com/app-automate/plan.json

# Check credentials
echo $BROWSERSTACK_USERNAME
echo $BROWSERSTACK_ACCESS_KEY
```

### Upload Failures

**Problem:** APK upload fails

**Solutions:**
1. Verify APK exists and is valid
2. Check file size (max 1GB)
3. Ensure credentials are correct
4. Check network connectivity

### Build Not Found

**Problem:** Cannot find built APK

**Solution:**
```bash
# Find APK files
find . -name "*.apk" -type f

# Common locations
ls -la android/app/build/outputs/apk/debug/
ls -la android/app/build/outputs/apk/release/
```

---

## API Reference

### Upload App

```bash
curl -u "USERNAME:ACCESS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@/path/to/app.apk"
```

**Response:**
```json
{
  "app_url": "bs://c8ddcb5649a8280ca800075bfd8f151115bba6b3",
  "custom_id": "MyApp",
  "shareable_id": "username/MyApp"
}
```

### List Recent Apps

```bash
curl -u "USERNAME:ACCESS_KEY" \
  "https://api-cloud.browserstack.com/app-automate/recent_apps"
```

### Get Account Plan

```bash
curl -u "USERNAME:ACCESS_KEY" \
  "https://api.browserstack.com/app-automate/plan.json"
```

### List Devices

```bash
curl -u "USERNAME:ACCESS_KEY" \
  "https://api-cloud.browserstack.com/app-automate/devices.json"
```

---

## Resources

### BrowserStack Documentation
- [App Automate](https://www.browserstack.com/docs/app-automate)
- [App Live](https://www.browserstack.com/docs/app-live)
- [REST API](https://www.browserstack.com/docs/app-automate/api-reference)
- [Appium Integration](https://www.browserstack.com/docs/app-automate/appium)

### Project Documentation
- `setup-browserstack.sh` - Automated setup script
- `codemagic.yaml` - CI/CD configuration
- `.env.example` - Environment variables template

### Support
- BrowserStack Support: [https://www.browserstack.com/support](https://www.browserstack.com/support)
- Developer Email: ben.mpolokoso@gmail.com
- Project Website: [https://www.africarailways.com/](https://www.africarailways.com/)

---

## Next Steps

1. **Immediate:**
   - [ ] Test BrowserStack connection
   - [ ] Upload first APK manually
   - [ ] Test on 3-5 devices via App Live

2. **This Week:**
   - [ ] Add BrowserStack credentials to Codemagic
   - [ ] Update workflows to upload APK after build
   - [ ] Document device testing results

3. **Next 2-4 Weeks:**
   - [ ] Set up automated testing framework
   - [ ] Write critical path tests
   - [ ] Create device compatibility matrix

4. **1-3 Months:**
   - [ ] Expand device coverage
   - [ ] Implement visual regression testing
   - [ ] Optimize parallel test execution

---

**Last Updated:** December 28, 2024  
**Status:** ✅ Ready for Integration
