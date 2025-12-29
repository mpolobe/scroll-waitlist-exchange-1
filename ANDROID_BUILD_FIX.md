# Android Build Dependency Conflict Fix

## Problem
The Android build was failing with `checkDebugDuplicateClasses` error due to conflicting dependency versions, particularly:
- Multiple Kotlin stdlib versions
- AndroidX library conflicts
- Capacitor plugin dependency overlaps

## Solution

### 1. Pre-configured Android Build Files
Created Android build configuration files that will be used when Capacitor initializes:

- `android/variables.gradle` - Centralized version management
- `android/build.gradle` - Root build file with dependency resolution strategy
- `android/app/build.gradle` - App-level build configuration
- `android/gradle.properties` - Gradle build settings
- `android/settings.gradle` - Project structure definition

### 2. Key Changes

#### Dependency Resolution Strategy
The root `build.gradle` now forces consistent versions:
```gradle
configurations.all {
    resolutionStrategy {
        force "org.jetbrains.kotlin:kotlin-stdlib:$kotlinVersion"
        force "androidx.core:core:$androidxCoreVersion"
        force "androidx.appcompat:appcompat:$androidxAppCompatVersion"
        // ... other dependencies
    }
}
```

#### Single Kotlin Version
All Kotlin dependencies now use version 1.9.22 defined in `variables.gradle`

#### AndroidX Consistency
All AndroidX libraries use versions defined in `variables.gradle`

### 3. CI/CD Updates
Updated `codemagic.yaml` to:
- Always install Capacitor dependencies fresh
- Run `./gradlew clean` before building to clear cached conflicts
- Check for existing android directory before running `cap add android`

## Testing
The next CI/CD build should:
1. Install Capacitor dependencies
2. Use the pre-configured build files
3. Sync with `npx cap sync android`
4. Clean any cached builds
5. Build successfully without duplicate class errors

## Local Testing
To test locally:
```bash
npm install
npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android  # Only if android/ doesn't exist
npx cap sync android
cd android
./gradlew clean
./gradlew assembleDebug
```

## Maintenance
When updating Capacitor or Android dependencies:
1. Update version numbers in `android/variables.gradle`
2. Ensure all plugins use compatible versions
3. Test build locally before pushing
