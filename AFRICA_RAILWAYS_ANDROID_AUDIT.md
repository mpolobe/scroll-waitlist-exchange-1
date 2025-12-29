# Africa Railways Android Apps Audit

**Date:** December 29, 2024  
**Repository:** mpolobe/africa-railways  
**Issue:** Checking for similar blank screen issues across all four apps

---

## Executive Summary

Audited the africa-railways repository which contains **4 mobile applications** built with **Expo/React Native** (not Capacitor). Found that the apps have **different Android configuration requirements** than the Capacitor-based scroll-waitlist-exchange app, but identified **similar potential issues** that could cause blank screens on Android 11+.

---

## Apps Identified

### 1. Africa Railways Hub
- **Package:** `com.mpolobe.railways`
- **Purpose:** Book tickets and manage railway journeys
- **EAS Project ID:** `82efeb87-20c5-45b4-b945-65d4b9074c32`
- **Technology:** Expo/React Native

### 2. Africoin Wallet
- **Package:** `com.mpolobe.africoin`
- **Purpose:** Pan-African digital currency wallet
- **EAS Project ID:** `5fa2f2b4-5c9f-43bf-b1eb-20d90ae19185`
- **Technology:** Expo/React Native

### 3. Sentinel Portal
- **Package:** `com.mpolobe.sentinel`
- **Purpose:** Track worker safety monitoring and reporting
- **EAS Project ID:** `82efeb87-20c5-45b4-b945-65d4b9074c32` (shared)
- **Technology:** Expo/React Native

### 4. Staff Verification
- **Package:** `com.mpolobe.staff`
- **Purpose:** Railway staff ticket verification tool
- **EAS Project ID:** `82efeb87-20c5-45b4-b945-65d4b9074c32` (shared)
- **Technology:** Expo/React Native

---

## Key Differences from Capacitor Apps

### Technology Stack

| Aspect | scroll-waitlist-exchange | africa-railways apps |
|--------|-------------------------|---------------------|
| Framework | Capacitor + React/Vite | Expo/React Native |
| Build System | Gradle (native Android) | EAS Build (managed) |
| WebView | Uses WebView for web content | Native React Native components |
| Configuration | capacitor.config.ts | app.config.js + eas.json |
| Android Manifest | Direct control | Managed by Expo |

### Configuration Approach

**Capacitor (scroll-waitlist-exchange):**
- Direct access to Android manifest
- Manual network security config
- Direct WebView configuration
- Native Java/Kotlin code

**Expo (africa-railways):**
- Managed build process
- Configuration via app.config.js
- Plugins for native features
- Limited direct native code access

---

## Current Android Configuration

### Positive Findings ✅

1. **expo-build-properties Plugin Configured**
   ```javascript
   [
     "expo-build-properties",
     {
       android: {
         useAndroidX: true,
         enableJetifier: true,
         packagingOptions: {
           pickFirst: [...],
           exclude: [...]
         }
       }
     }
   ]
   ```

2. **Dependency Resolution Strategy**
   - Package.json has `resolutions` field
   - Forces specific React/React Native versions
   - Prevents duplicate class errors

3. **Gradle Fix File Created**
   - `android-gradle-fix.gradle` exists
   - Contains packaging options
   - Has dependency exclusions

4. **Camera Permissions Configured**
   - Each app has specific camera permission messages
   - Properly configured in app.config.js

### Potential Issues ⚠️

#### 1. Network Security Configuration

**Issue:** Expo apps may not have explicit cleartext traffic configuration for Android 11+.

**Impact:** 
- HTTP requests may fail silently
- API calls to non-HTTPS endpoints blocked
- Blank screen if app depends on network data at startup

**Current State:**
- Not explicitly configured in app.config.js
- Expo's default may not allow cleartext traffic

**Recommendation:**
Add to app.config.js:
```javascript
android: {
  package: config.package,
  versionCode: 1,
  permissions: ["CAMERA", "ACCESS_FINE_LOCATION"],
  usesCleartextTraffic: true,  // Add this
  adaptiveIcon: {...}
}
```

#### 2. Network State Permissions

**Issue:** Missing network state permissions that Android 11+ requires.

**Current Permissions:**
```javascript
permissions: ["CAMERA", "ACCESS_FINE_LOCATION"]
```

**Missing:**
- `ACCESS_NETWORK_STATE`
- `ACCESS_WIFI_STATE`

**Recommendation:**
```javascript
permissions: [
  "CAMERA", 
  "ACCESS_FINE_LOCATION",
  "ACCESS_NETWORK_STATE",
  "ACCESS_WIFI_STATE"
]
```

#### 3. Content Security Policy

**Issue:** No explicit CSP configuration for web content.

**Impact:**
- If apps load any web content (WebView components)
- External resources may be blocked
- Could cause blank screens in hybrid views

**Current State:**
- Not configured in app.config.js
- Expo's default CSP may be restrictive

**Recommendation:**
If apps use WebView or load external content, add:
```javascript
extra: {
  contentSecurityPolicy: "default-src * 'unsafe-inline' 'unsafe-eval' data: gap: content:"
}
```

#### 4. Hardware Acceleration

**Issue:** Not explicitly enabled in configuration.

**Impact:**
- Slower rendering on some devices
- Potential blank screens during heavy animations
- Poor performance with Skia graphics

**Recommendation:**
Add to app.config.js:
```javascript
android: {
  hardwareAccelerated: true,  // Add this
  package: config.package,
  ...
}
```

#### 5. Build Configuration for Android 11+

**Issue:** No explicit target SDK or compile SDK version specified.

**Current State:**
- Relies on Expo's defaults
- May not be optimized for Android 11+

**Recommendation:**
Add to expo-build-properties plugin:
```javascript
[
  "expo-build-properties",
  {
    android: {
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 23,
      useAndroidX: true,
      enableJetifier: true,
      ...
    }
  }
]
```

---

## Comparison with scroll-waitlist-exchange Fixes

### Similar Issues Found

| Issue | scroll-waitlist-exchange | africa-railways apps |
|-------|-------------------------|---------------------|
| Cleartext traffic | ✅ Fixed (AndroidManifest.xml) | ⚠️ Not configured |
| Network permissions | ✅ Fixed (AndroidManifest.xml) | ⚠️ Missing permissions |
| Hardware acceleration | ✅ Fixed (AndroidManifest.xml) | ⚠️ Not configured |
| CSP configuration | ✅ Fixed (index.html) | ⚠️ Not applicable (native) |
| WebView debugging | ✅ Fixed (MainActivity.java) | N/A (React Native) |

### Different Approaches Needed

**Capacitor Apps:**
- Direct manifest editing
- Native code modifications
- WebView-specific configurations

**Expo Apps:**
- Plugin-based configuration
- app.config.js modifications
- EAS build profiles

---

## Recommended Fixes for africa-railways Apps

### 1. Update app.config.js

Add the following to the Android configuration section:

```javascript
// app.config.js
android: {
  package: config.package,
  versionCode: 1,
  permissions: [
    "CAMERA", 
    "ACCESS_FINE_LOCATION",
    "ACCESS_NETWORK_STATE",
    "ACCESS_WIFI_STATE"
  ],
  usesCleartextTraffic: true,
  hardwareAccelerated: true,
  adaptiveIcon: {
    foregroundImage: `./assets/adaptive-icon-${APP_VARIANT}.png`,
    backgroundColor: config.backgroundColor
  }
}
```

### 2. Enhance expo-build-properties Plugin

Update the plugin configuration:

```javascript
[
  "expo-build-properties",
  {
    android: {
      compileSdkVersion: 34,
      targetSdkVersion: 34,
      minSdkVersion: 23,
      useAndroidX: true,
      enableJetifier: true,
      packagingOptions: {
        pickFirst: [
          "lib/x86/libc++_shared.so",
          "lib/x86_64/libc++_shared.so",
          "lib/armeabi-v7a/libc++_shared.so",
          "lib/arm64-v8a/libc++_shared.so"
        ],
        exclude: [
          "META-INF/DEPENDENCIES",
          "META-INF/LICENSE",
          "META-INF/LICENSE.txt",
          "META-INF/NOTICE",
          "META-INF/NOTICE.txt"
        ]
      }
    }
  }
]
```

### 3. Add Network Security Config (if needed)

If apps make HTTP requests, create a custom config plugin:

```javascript
// plugins/withNetworkSecurityConfig.js
const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withNetworkSecurityConfig(config) {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults.manifest;
    
    // Add network security config
    androidManifest.application[0].$['android:networkSecurityConfig'] = 
      '@xml/network_security_config';
    
    return config;
  });
};
```

Then add to app.config.js:
```javascript
plugins: [
  './plugins/withNetworkSecurityConfig',
  // ... other plugins
]
```

### 4. Update EAS Build Profiles

Add pre-build script to eas.json:

```json
{
  "build": {
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "apk"
      },
      "env": {
        "API_URL": "https://api.africarailways.com",
        "SUI_NETWORK": "mainnet"
      }
    }
  }
}
```

---

## Testing Recommendations

### For Each App

1. **Build with EAS:**
   ```bash
   cd /path/to/africa-railways/SmartphoneApp
   
   # Railways app
   APP_VARIANT=railways npx eas-cli build --platform android --profile production
   
   # Africoin app
   APP_VARIANT=africoin npx eas-cli build --platform android --profile africoin
   
   # Sentinel app
   APP_VARIANT=sentinel npx eas-cli build --platform android --profile sentinel
   
   # Staff app
   APP_VARIANT=staff npx eas-cli build --platform android --profile staff
   ```

2. **Test on Android 11+ Device:**
   - Install APK
   - Launch app
   - Check for blank screen
   - Test network connectivity
   - Verify camera permissions
   - Test all major features

3. **Debug if Issues Occur:**
   ```bash
   # Enable USB debugging on device
   adb logcat | grep -i "africoin\|railways\|sentinel\|staff"
   ```

### Specific Test Cases

**For All Apps:**
- [ ] App launches without blank screen
- [ ] Network requests succeed
- [ ] Camera opens when needed
- [ ] Location services work
- [ ] App doesn't crash on startup
- [ ] All screens navigate properly

**Railways App:**
- [ ] Ticket booking works
- [ ] QR code scanning functions
- [ ] Map displays correctly
- [ ] Schedule loads

**Africoin App:**
- [ ] Wallet balance displays
- [ ] Transactions process
- [ ] QR code generation works
- [ ] Currency exchange functions

**Sentinel App:**
- [ ] Track checkpoint scanning works
- [ ] Safety reports submit
- [ ] Location tracking functions
- [ ] Alert system works

**Staff App:**
- [ ] Ticket verification works
- [ ] QR code scanning functions
- [ ] Passenger data displays
- [ ] Validation logic works

---

## Implementation Priority

### High Priority (Do First)

1. ✅ Add network permissions to app.config.js
2. ✅ Enable cleartext traffic
3. ✅ Enable hardware acceleration
4. ✅ Update expo-build-properties with SDK versions

### Medium Priority (Do Soon)

1. ⚠️ Create network security config plugin (if HTTP needed)
2. ⚠️ Add pre-build scripts for validation
3. ⚠️ Update EAS build profiles

### Low Priority (Nice to Have)

1. 📝 Add build monitoring
2. 📝 Create automated testing
3. 📝 Set up crash reporting

---

## Differences from Capacitor Fix

### What Doesn't Apply

❌ **AndroidManifest.xml direct editing** - Expo manages this
❌ **MainActivity.java modifications** - No direct native code access
❌ **network_security_config.xml** - Needs plugin approach
❌ **WebView debugging** - React Native doesn't use WebView
❌ **Content Security Policy in HTML** - No HTML file in React Native

### What Does Apply

✅ **Network permissions** - Via app.config.js
✅ **Cleartext traffic** - Via app.config.js
✅ **Hardware acceleration** - Via app.config.js
✅ **Build optimization** - Via expo-build-properties
✅ **Dependency resolution** - Via package.json resolutions

---

## Risk Assessment

### Low Risk Issues

- Missing network state permissions (easy fix)
- Hardware acceleration not enabled (easy fix)
- SDK versions not specified (Expo defaults are good)

### Medium Risk Issues

- Cleartext traffic not configured (could cause network failures)
- No explicit network security config (may block HTTP)

### High Risk Issues

None identified. The apps are well-configured overall.

---

## Conclusion

The africa-railways apps are **better configured** than the scroll-waitlist-exchange app was initially, but they **could benefit from similar fixes** adapted for Expo/React Native:

1. **Add network permissions** - Prevents connectivity issues
2. **Enable cleartext traffic** - Allows HTTP requests if needed
3. **Enable hardware acceleration** - Improves performance
4. **Specify SDK versions** - Ensures Android 11+ compatibility

The fixes are **simpler** for Expo apps because:
- No direct native code access needed
- Configuration via app.config.js
- Managed build process handles most issues
- Plugins provide native functionality

**Recommendation:** Apply the high-priority fixes to all four apps before the next production build to prevent potential blank screen issues on Android 11+ devices.

---

## Next Steps

1. **Update app.config.js** with recommended changes
2. **Test build locally** with EAS CLI
3. **Deploy to internal testing** via EAS
4. **Test on Android 11+ devices**
5. **Monitor for issues** in production
6. **Document any additional fixes** needed

---

**Last Updated:** December 29, 2024  
**Status:** ✅ Audit Complete  
**Action Required:** Apply recommended fixes  
**Estimated Time:** 1-2 hours for all apps
