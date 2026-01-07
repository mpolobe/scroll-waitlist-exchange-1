# BrowserStack Credentials Setup

**Date:** December 29, 2024  
**Purpose:** Configure BrowserStack credentials in Codemagic for automatic APK upload  
**Status:** Ready to configure

---

## BrowserStack Credentials

You need to configure your BrowserStack credentials. Get them from your BrowserStack account:

1. Go to: https://www.browserstack.com/accounts/settings
2. Copy your username and access key
3. Set them as environment variables

```bash
# Example format (replace with your actual credentials):
BROWSERSTACK_API_KEY="your_browserstack_access_key"
BROWSERSTACK_URL="http://your_username.browserstack.com"
```

**Note:** Never commit these credentials to the repository. Always use environment variables.

---

## Setup in Codemagic

### Option 1: Using URL and API Key (Recommended)

This is the simplest approach as it extracts the username automatically from the URL.

1. **Go to Codemagic Dashboard**
   - Navigate to your app: Africoin Wallet Android (Debug)
   - Click on "Environment variables"

2. **Add Environment Variables**
   
   **Variable 1:**
   - Name: `BROWSERSTACK_URL`
   - Value: `http://your_username.browserstack.com` (replace with your actual BrowserStack URL)
   - Secure: ✅ (check this box)
   - Group: Leave empty or create "browserstack_credentials"

   **Variable 2:**
   - Name: `BROWSERSTACK_API_KEY`
   - Value: Your actual BrowserStack access key (get from https://www.browserstack.com/accounts/settings)
   - Secure: ✅ (check this box)
   - Group: Leave empty or create "browserstack_credentials"

3. **Save Changes**

### Option 2: Using Username and API Key

If you prefer to set the username explicitly:

1. **Go to Codemagic Dashboard**
   - Navigate to your app
   - Click on "Environment variables"

2. **Add Environment Variables**
   
   **Variable 1:**
   - Name: `BROWSERSTACK_USERNAME`
   - Value: Your BrowserStack username (get from https://www.browserstack.com/accounts/settings)
   - Secure: ✅ (check this box)
   - Group: Leave empty or create "browserstack_credentials"

   **Variable 2:**
   - Name: `BROWSERSTACK_API_KEY`
   - Value: Your actual BrowserStack access key (get from https://www.browserstack.com/accounts/settings)
   - Secure: ✅ (check this box)
   - Group: Leave empty or create "browserstack_credentials"

3. **Save Changes**

---

## How It Works

The updated `codemagic.yaml` now supports both credential formats:

```bash
# Extract username from BROWSERSTACK_URL if available
if [ -n "$BROWSERSTACK_URL" ]; then
  BROWSERSTACK_USERNAME=$(echo "$BROWSERSTACK_URL" | sed -n 's|.*://\([^.]*\)\.browserstack\.com.*|\1|p')
fi

# Support both credential formats
BS_KEY="${BROWSERSTACK_API_KEY:-$BROWSERSTACK_ACCESS_KEY}"

# Upload to BrowserStack
curl -s -u "$BROWSERSTACK_USERNAME:$BS_KEY" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@$APK_PATH"
```

**What this does:**
1. Extracts username from `BROWSERSTACK_URL` if provided
2. Uses `BROWSERSTACK_API_KEY` (or falls back to `BROWSERSTACK_ACCESS_KEY`)
3. Uploads APK to BrowserStack
4. Returns the app URL for testing

---

## Verification

After setting up the credentials, the next build will:

1. ✅ Build the APK successfully
2. ✅ Detect BrowserStack credentials
3. ✅ Upload APK to BrowserStack
4. ✅ Display the app URL in build logs
5. ✅ Provide link to test: `http://benjaminmpolokos_dzbone.browserstack.com`

### Expected Build Output

```
Uploading APK to BrowserStack...
Username: benjaminmpolokos_dzbone
BrowserStack Response:
{
  "app_url": "bs://abc123...",
  "custom_id": "AfricoinWallet",
  "shareable_id": "benjaminmpolokos_dzbone/AfricoinWallet"
}

✅ APK uploaded successfully!
App URL: bs://abc123...
Test at: http://benjaminmpolokos_dzbone.browserstack.com
```

---

## Testing BrowserStack Upload

### Manual Test (Optional)

You can test the credentials locally before setting them in Codemagic:

```bash
# Test credentials (replace with your actual credentials)
curl -u "your_username:your_access_key" \
  https://api-cloud.browserstack.com/app-automate/plan.json

# Expected response: Your BrowserStack plan details
```

### Upload Test APK

```bash
# Upload a test APK (replace with your actual credentials)
curl -u "your_username:your_access_key" \
  -X POST "https://api-cloud.browserstack.com/app-automate/upload" \
  -F "file=@android/app/build/outputs/apk/debug/app-debug.apk"

# Expected response: app_url and shareable_id
```

---

## Accessing Uploaded Apps

### BrowserStack App Live

1. Go to: https://app-live.browserstack.com/
2. Sign in with your BrowserStack account
3. Find your uploaded APK in the list
4. Select a device to test on
5. Install and test the app

### BrowserStack App Automate

If you want to run automated tests:

1. Go to: https://app-automate.browserstack.com/
2. Use the `app_url` from the upload response
3. Configure your test scripts
4. Run automated tests on multiple devices

---

## Troubleshooting

### Upload Fails with Authentication Error

**Error:** `401 Unauthorized`

**Solution:**
- Verify the API key is correct
- Check the username matches your BrowserStack account
- Ensure credentials are marked as "Secure" in Codemagic

### Upload Succeeds but No App URL

**Error:** `app_url: null` in response

**Solution:**
- Check the APK file is valid
- Verify the APK is not corrupted
- Try uploading manually first to test

### Cannot Access BrowserStack URL

**Error:** `404 Not Found` when visiting the URL

**Solution:**
- Ensure you're signed in to BrowserStack
- Use the correct URL format
- Try https://app-live.browserstack.com/ instead

---

## Security Best Practices

### Protect Your Credentials

1. ✅ **Mark as Secure** - Always check "Secure" when adding to Codemagic
2. ✅ **Don't Commit** - Never commit credentials to git
3. ✅ **Rotate Regularly** - Change API keys every 90 days
4. ✅ **Limit Access** - Only share with team members who need it

### Environment Variables

The credentials are only available during build time and are:
- Encrypted at rest
- Not visible in build logs (when marked as secure)
- Not accessible to pull requests from forks
- Automatically injected into the build environment

---

## Alternative: Create Variable Group

For better organization, create a variable group:

1. **Go to Codemagic Teams & Apps**
2. **Click "Variable groups"**
3. **Create new group:** `browserstack_credentials`
4. **Add variables:**
   - `BROWSERSTACK_URL`
   - `BROWSERSTACK_API_KEY`
5. **Update codemagic.yaml:**
   ```yaml
   environment:
     groups:
       - browserstack_credentials
   ```

This approach:
- ✅ Keeps credentials organized
- ✅ Reusable across multiple workflows
- ✅ Easier to manage and update
- ✅ Can be shared across apps

---

## Next Steps

1. **Add credentials to Codemagic**
   - Use Option 1 (URL + API Key) recommended
   - Mark both as "Secure"

2. **Trigger a new build**
   - Push to main branch
   - Or manually trigger in Codemagic

3. **Verify upload works**
   - Check build logs for success message
   - Visit BrowserStack to see uploaded APK
   - Test the app on a device

4. **Test the app**
   - Select Android 11+ device
   - Install the APK
   - Verify no blank screen
   - Test all features

---

## Summary

**Credentials to add:**
```
BROWSERSTACK_URL = http://your_username.browserstack.com
BROWSERSTACK_API_KEY = your_access_key
```

Get these from: https://www.browserstack.com/accounts/settings

**Where to add:** Codemagic → App → Environment variables

**Mark as:** Secure ✅

**Result:** Automatic APK upload to BrowserStack after every successful build

---

**Last Updated:** December 29, 2024  
**Status:** Ready to configure  
**Action Required:** Add credentials to Codemagic UI
