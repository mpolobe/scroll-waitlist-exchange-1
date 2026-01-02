# Mobile Build Issues Found and Recommendations

**Date:** December 29, 2024  
**Repository:** scroll-waitlist-exchange-1  
**Status:** Issues Identified - Fixes Recommended

---

## Critical Issues Found

### 1. ❌ CRITICAL: Hardcoded Supabase Credentials in Source Code

**File:** `src/lib/supabase.ts`

**Issue:**
```typescript
const supabaseUrl = "";
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjNiMjY5M2Q3LWEzN2EtNGVmMC1hOGNmLTE2YWRjYTI1YjA1MCJ9...';
```

**Risk:** 
- **SEVERE SECURITY VULNERABILITY**
- Credentials exposed in public repository
- Anyone can access your database
- Potential data breach
- Unauthorized access to user data

**Fix Required:**
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };
```

**Immediate Actions:**
1. ⚠️ **URGENT:** Rotate Supabase credentials immediately
2. Update `src/lib/supabase.ts` to use environment variables
3. Add credentials to Codemagic environment variables
4. Never commit credentials to repository again

---

## High Priority Issues

### 2. ⚠️ Missing Capacitor Dependencies in package.json

**Issue:**
- Capacitor packages are installed during CI/CD build
- Not declared in `package.json`
- Can cause version inconsistencies
- Makes local development difficult

**Current Behavior:**
```yaml
# In codemagic.yaml
- name: Install Capacitor
  script: |
    npm install @capacitor/core @capacitor/cli @capacitor/android
```

**Fix Required:**
Add to `package.json`:
```json
{
  "dependencies": {
    "@capacitor/core": "^6.0.0",
    "@capacitor/android": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0"
  }
}
```

**Benefits:**
- Consistent versions across environments
- Easier local development
- Proper dependency tracking
- Faster CI/CD builds (cached dependencies)

---

### 3. ⚠️ Missing capacitor.build.gradle Reference

**File:** `android/app/build.gradle`

**Issue:**
```gradle
apply from: 'capacitor.build.gradle'
```

This file doesn't exist until Capacitor creates it. If the build fails before this step, it causes errors.

**Fix Required:**
Make the reference conditional:
```gradle
// Apply Capacitor build configuration if it exists
def capacitorBuildFile = file('capacitor.build.gradle')
if (capacitorBuildFile.exists()) {
    apply from: 'capacitor.build.gradle'
} else {
    logger.warn('capacitor.build.gradle not found - will be created by Capacitor')
}
```

---

### 4. ⚠️ Inconsistent Environment Variable Usage

**Issue:**
Some files use environment variables correctly, others don't:

**Correct Usage:**
```typescript
// src/lib/alchemyConfig.ts
apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || "demo-api-key"
```

**Incorrect Usage:**
```typescript
// src/lib/supabase.ts - HARDCODED!
const supabaseUrl = "";
```

**Fix Required:**
Audit all configuration files and ensure consistent use of environment variables.

---

## Medium Priority Issues

### 5. Missing Build Scripts

**Issue:**
No mobile-specific build scripts in `package.json`

**Fix Required:**
Add to `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    
    // Add mobile scripts
    "cap:sync": "cap sync",
    "cap:sync:android": "cap sync android",
    "cap:sync:ios": "cap sync ios",
    "cap:open:android": "cap open android",
    "cap:open:ios": "cap open ios",
    "build:mobile": "npm run build && npm run cap:sync",
    "android:dev": "npm run build:mobile && npm run cap:open:android",
    "ios:dev": "npm run build:mobile && npm run cap:open:ios"
  }
}
```

---

### 6. Missing Capacitor Plugins Configuration

**Issue:**
No plugins configured in `capacitor.config.ts`

**Current:**
```typescript
const config: CapacitorConfig = {
  appId: 'com.africoin.wallet',
  appName: 'Africoin Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};
```

**Recommended:**
```typescript
const config: CapacitorConfig = {
  appId: 'com.africoin.wallet',
  appName: 'Africoin Wallet',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow localhost for development
    allowNavigation: ['*']
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f97316", // Orange brand color
      androidScaleType: "CENTER_CROP",
      showSpinner: false
    }
  }
};
```

---

### 7. Missing Android Permissions

**Issue:**
No AndroidManifest.xml configuration for required permissions

**Fix Required:**
Create `android/app/src/main/AndroidManifest.xml` with:
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Internet permission for API calls -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Network state for connectivity checks -->
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Camera for QR code scanning (if needed) -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@style/AppTheme.NoActionBarLaunch">
            
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

---

## Low Priority Issues

### 8. Missing App Icons and Splash Screens

**Issue:**
No custom app icons or splash screens configured

**Fix Required:**
1. Create app icons in various sizes
2. Add to `android/app/src/main/res/` directories
3. Configure splash screen in Capacitor config

---

### 9. No ProGuard Rules for Release Builds

**Issue:**
`android/app/proguard-rules.pro` doesn't exist

**Fix Required:**
Create `android/app/proguard-rules.pro`:
```proguard
# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Supabase
-keep class io.supabase.** { *; }

# Keep Alchemy SDK
-keep class com.alchemy.** { *; }
```

---

### 10. Missing Error Boundary for Mobile

**Issue:**
No error boundary component for catching React errors in mobile app

**Fix Required:**
Create `src/components/ErrorBoundary.tsx`:
```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-600 text-white rounded"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## Summary of Required Fixes

### Immediate (Critical)
1. ✅ **DONE:** Fix gradlew creation issue
2. ❌ **TODO:** Fix hardcoded Supabase credentials
3. ❌ **TODO:** Rotate Supabase credentials

### High Priority
4. ❌ **TODO:** Add Capacitor dependencies to package.json
5. ❌ **TODO:** Make capacitor.build.gradle reference conditional
6. ❌ **TODO:** Audit and fix all environment variable usage

### Medium Priority
7. ❌ **TODO:** Add mobile build scripts
8. ❌ **TODO:** Configure Capacitor plugins
9. ❌ **TODO:** Add Android permissions

### Low Priority
10. ❌ **TODO:** Add app icons and splash screens
11. ❌ **TODO:** Create ProGuard rules
12. ❌ **TODO:** Add error boundary component

---

## Recommended Next Steps

1. **Immediate Security Fix:**
   ```bash
   # Fix Supabase credentials
   # Update src/lib/supabase.ts
   # Rotate credentials in Supabase dashboard
   # Add to Codemagic environment variables
   ```

2. **Add Capacitor Dependencies:**
   ```bash
   npm install --save @capacitor/core @capacitor/android
   npm install --save-dev @capacitor/cli
   ```

3. **Update Build Configuration:**
   - Fix capacitor.build.gradle reference
   - Add mobile build scripts
   - Configure plugins

4. **Test Build:**
   ```bash
   npm run build
   npx cap sync android
   cd android && ./gradlew assembleDebug
   ```

---

## Files That Need Updates

### Critical
- [ ] `src/lib/supabase.ts` - Remove hardcoded credentials
- [ ] Supabase Dashboard - Rotate credentials
- [ ] Codemagic - Add VITE_SUPABASE_* variables

### High Priority
- [ ] `package.json` - Add Capacitor dependencies
- [ ] `android/app/build.gradle` - Conditional capacitor.build.gradle
- [ ] `capacitor.config.ts` - Add plugins configuration

### Medium Priority
- [ ] `android/app/src/main/AndroidManifest.xml` - Create with permissions
- [ ] `android/app/proguard-rules.pro` - Create ProGuard rules
- [ ] `src/components/ErrorBoundary.tsx` - Create error boundary

---

## Testing Checklist

After applying fixes:

- [ ] Local build completes: `npm run build`
- [ ] Capacitor sync works: `npx cap sync android`
- [ ] Android build succeeds: `cd android && ./gradlew assembleDebug`
- [ ] APK installs on device
- [ ] App launches without crashes
- [ ] Environment variables load correctly
- [ ] No hardcoded credentials in source
- [ ] Supabase connection works with new credentials

---

**Last Updated:** December 29, 2024  
**Status:** ⚠️ Critical security issue found - immediate action required
