# BrowserStack Integration Guide

This document provides guidance for integrating BrowserStack device testing into the Africoin Wallet mobile app builds.

## Overview

BrowserStack enables testing the Capacitor-based Android and iOS apps on real devices before releasing to app stores.

## Prerequisites

- BrowserStack account with App Automate access
- Codemagic builds generating APK/IPA files
- BrowserStack credentials (username and access key)

## Setup

### 1. Get BrowserStack Credentials

1. Sign up at [BrowserStack](https://www.browserstack.com/)
2. Go to Account Settings → Access Key
3. Copy your username and access key

### 2. Add to Codemagic

Add credentials to Codemagic environment variables:

1. Go to Codemagic app settings
2. Create environment group: `browserstack_credentials`
3. Add variables:
   - `BROWSERSTACK_USERNAME`: Your BrowserStack username
   - `BROWSERSTACK_ACCESS_KEY`: Your access key (mark as secure)
   - `BROWSERSTACK_URL`: Your local testing URL (optional)

### 3. Update Workflow

Add BrowserStack upload step to `codemagic.yaml`:

```yaml
environment:
  groups:
    - africoin_env_vars
    - browserstack_credentials  # Add this line

scripts:
  # ... existing build steps ...
  
  - name: Upload to BrowserStack
    script: |
      APK_PATH=$(find android/app/build/outputs -name "*.apk" | head -1)
      
      if [ -n "$APK_PATH" ]; then
        echo "Uploading $APK_PATH to BrowserStack..."
        
        UPLOAD_RESPONSE=$(curl -u "$BROWSERSTACK_USERNAME:$BROWSERSTACK_ACCESS_KEY" \
          -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
          -F "file=@$APK_PATH")
        
        echo "Upload response: $UPLOAD_RESPONSE"
        APP_URL=$(echo $UPLOAD_RESPONSE | jq -r '.app_url')
        echo "App URL: $APP_URL"
        
        echo "Test manually at: https://app-live.browserstack.com/"
      else
        echo "No APK found to upload"
      fi
```

## Testing Workflows

### Manual Testing

1. Build APK via Codemagic
2. Upload to BrowserStack (automated in workflow)
3. Go to [BrowserStack Live](https://app-live.browserstack.com/)
4. Select device and OS version
5. Install and test your app

### Automated Testing

For automated testing with Appium:

1. Write Appium test scripts
2. Upload APK via API
3. Run tests on device matrix
4. Review results in BrowserStack dashboard

Example test configuration:

```javascript
const capabilities = {
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
  'app': 'bs://your-app-url',
  'device': 'Samsung Galaxy S21',
  'os_version': '11.0',
  'project': 'Africoin Wallet',
  'build': 'Android Build 1',
  'name': 'Smoke Test'
};
```

## Device Matrix

Recommended devices for testing:

**Android:**
- Samsung Galaxy S21 (Android 11)
- Google Pixel 6 (Android 12)
- OnePlus 9 (Android 11)
- Samsung Galaxy A52 (Android 11)

**iOS:**
- iPhone 13 (iOS 15)
- iPhone 12 (iOS 14)
- iPhone SE (iOS 15)
- iPad Pro 12.9 (iOS 15)

## Cost Considerations

BrowserStack pricing:
- **App Live**: $39-99/month for manual testing
- **App Automate**: $99-249/month for automated testing
- **Free Trial**: Available for evaluation

## Security

- Never commit BrowserStack credentials to repository
- Use Codemagic environment variables (marked as secure)
- Rotate access keys periodically
- Review access logs regularly

## Resources

- [BrowserStack App Automate Docs](https://www.browserstack.com/docs/app-automate)
- [Capacitor Testing Guide](https://capacitorjs.com/docs/guides/testing)
- [Appium Documentation](https://appium.io/docs/en/latest/)

## Related Files

- `codemagic.yaml` - CI/CD configuration
- `.env.example` - Environment variable template
- `capacitor.config.ts` - Capacitor configuration (generated during build)

## Support

For issues or questions:
- BrowserStack Support: https://www.browserstack.com/support
- Codemagic Docs: https://docs.codemagic.io/
- Project Issues: https://github.com/mpolobe/scroll-waitlist-exchange-1/issues
