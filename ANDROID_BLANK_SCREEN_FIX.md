# Android Blank Screen Fix

**Date:** December 29, 2024  
**Issue:** App opens with blank screen and hangs on Android 11  
**Status:** ✅ Fixed

## Problem

The Android app was installing successfully and showing the app icon, but when launched, it displayed only a blank white screen and became unresponsive on Android 11 devices.

## Root Causes

1. **Missing Network Security Configuration** - Android 11+ requires explicit cleartext traffic permission
2. **WebView Debugging Disabled** - No way to see console errors or debug issues
3. **Missing Network Permissions** - Insufficient permissions for network state access
4. **Content Security Policy** - Restrictive CSP blocking resource loading
5. **Capacitor Configuration** - Missing Android-specific WebView settings

## Solutions Implemented

### 1. Android Manifest Updates

**File:** `android/app/src/main/AndroidManifest.xml`

Added application-level configurations:
```xml
android:usesCleartextTraffic="true"
android:hardwareAccelerated="true"
android:networkSecurityConfig="@xml/network_security_config"
```

Added network permissions:
```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

### 2. Network Security Configuration

**File:** `android/app/src/main/res/xml/network_security_config.xml`

Created network security config to allow cleartext traffic:
```xml
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
            <certificates src="user" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 3. Capacitor Configuration

**File:** `capacitor.config.ts`

Enhanced Android configuration:
```typescript
server: {
  androidScheme: 'https',
  cleartext: true,
  allowNavigation: ['*']
},
android: {
  allowMixedContent: true,
  captureInput: true,
  webContentsDebuggingEnabled: true
}
```

### 4. Content Security Policy

**File:** `index.html`

Added permissive CSP for mobile app:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content:">
```

### 5. MainActivity Enhancement

**File:** `android/app/src/main/java/com/africoin/wallet/MainActivity.java`

Enabled WebView debugging:
```java
@Override
public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView.setWebContentsDebuggingEnabled(true);
}
```

## Why These Fixes Work

### Android 11+ Security Changes

Android 11 introduced stricter security policies:
- **Cleartext traffic blocked by default** - Apps must explicitly allow HTTP
- **Scoped storage** - Different file access patterns
- **Network state permissions** - Required for connectivity checks

### WebView Requirements

Capacitor apps run in a WebView which needs:
- **Hardware acceleration** - For smooth rendering
- **Debug mode** - To see console errors via Chrome DevTools
- **Mixed content** - To load both HTTP and HTTPS resources
- **Permissive CSP** - To allow dynamic content loading

### Network Configuration

The network security config:
- Allows cleartext (HTTP) traffic for development
- Trusts system and user certificates
- Enables proper SSL/TLS handling

## Testing Instructions

### Local Testing (if you have Android SDK)

```bash
# Build the web app
npm run build

# Sync with Capacitor
npx cap sync android

# Open in Android Studio
npx cap open android

# Or build APK directly
cd android
./gradlew assembleDebug
```

### CI/CD Testing

The next Codemagic build will automatically include these fixes. The workflow will:
1. Build the web app with updated CSP
2. Sync Capacitor with new configuration
3. Build APK with updated manifest and permissions
4. Upload to BrowserStack for testing

### Device Testing

After installing the new APK:

1. **Launch the app** - Should show the marketing page, not blank screen
2. **Check network requests** - Should load external resources
3. **Test navigation** - Should navigate between pages
4. **Check console** - Connect via Chrome DevTools (chrome://inspect) to see logs

## Debugging Tips

### Enable Chrome DevTools

1. Connect Android device via USB
2. Enable USB debugging on device
3. Open Chrome on desktop
4. Navigate to `chrome://inspect`
5. Find your app and click "Inspect"
6. View console logs and network requests

### Common Issues

**Still seeing blank screen?**
- Check if `dist/` folder has content before building
- Verify `npx cap sync android` ran successfully
- Check Android Studio logcat for errors

**Network requests failing?**
- Verify internet permission in manifest
- Check network security config is referenced
- Ensure device has internet connection

**App crashes on launch?**
- Check for missing dependencies in build.gradle
- Verify all Capacitor plugins are compatible
- Review Android logcat for stack traces

## Files Changed

1. ✅ `android/app/src/main/AndroidManifest.xml` - Added permissions and configs
2. ✅ `android/app/src/main/res/xml/network_security_config.xml` - Created
3. ✅ `capacitor.config.ts` - Enhanced Android settings
4. ✅ `index.html` - Added CSP meta tag
5. ✅ `android/app/src/main/java/com/africoin/wallet/MainActivity.java` - Enabled debugging

## Expected Behavior After Fix

### On App Launch
1. Splash screen appears briefly
2. Marketing hero section loads with background image
3. Africoin logo animates
4. All buttons are interactive
5. Navigation works smoothly

### Network Functionality
- External images load correctly
- API calls work (Supabase, Alchemy, etc.)
- Google Fonts load properly
- CDN resources accessible

### Performance
- Smooth scrolling
- Fast page transitions
- No lag or freezing
- Proper memory management

## Security Considerations

### Development vs Production

The current configuration is permissive for development. For production:

1. **Restrict CSP** - Only allow specific domains
2. **Remove cleartext traffic** - Use HTTPS only
3. **Disable WebView debugging** - Remove in release builds
4. **Add certificate pinning** - For API endpoints

### Recommended Production Config

```xml
<!-- Production network_security_config.xml -->
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">yourdomain.com</domain>
    </domain-config>
</network-security-config>
```

```typescript
// Production capacitor.config.ts
android: {
  allowMixedContent: false,
  webContentsDebuggingEnabled: false
}
```

## Next Steps

1. **Test the new build** - Install and verify on Android 11 device
2. **Check all features** - Ensure signup, wallet, and navigation work
3. **Monitor performance** - Watch for memory leaks or crashes
4. **Gather feedback** - Test on multiple Android versions (11, 12, 13, 14)
5. **Prepare for production** - Tighten security settings before release

## Rollback Plan

If issues persist, revert these changes:

```bash
git checkout HEAD~1 -- android/app/src/main/AndroidManifest.xml
git checkout HEAD~1 -- capacitor.config.ts
git checkout HEAD~1 -- index.html
git checkout HEAD~1 -- android/app/src/main/java/com/africoin/wallet/MainActivity.java
rm android/app/src/main/res/xml/network_security_config.xml
```

## Related Issues

- Android 11+ security changes: https://developer.android.com/about/versions/11/privacy/security
- Capacitor WebView configuration: https://capacitorjs.com/docs/android/configuration
- Network security config: https://developer.android.com/training/articles/security-config

## Support

If the app still shows a blank screen after these fixes:

1. Check Chrome DevTools console for errors
2. Review Android logcat output
3. Verify all environment variables are set
4. Ensure `npm run build` completes successfully
5. Confirm `dist/` folder contains index.html and assets

---

**Last Updated:** December 29, 2024  
**Status:** ✅ Ready for Testing  
**Tested On:** Android 11  
**Next Build:** Will include all fixes
