# Google Cloud Project Configuration

**Project Name:** Africoin  
**Project ID:** gen-lang-client-0453426956  
**Project Number:** 834148498046  
**Full Project Name:** projects/834148498046  
**Date:** December 28, 2024

---

## Overview

This document contains the Google Cloud Platform (GCP) project details for the Africoin Wallet application.

## Project Details

```
Name:           Africoin
Project ID:     gen-lang-client-0453426956
Project Number: 834148498046
Full Name:      projects/834148498046
```

---

## Service Account Configuration

### For Google Play Store Deployment

When creating a service account for Play Store deployment:

1. **Go to Google Cloud Console:**
   - URL: [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Select project: `gen-lang-client-0453426956`

2. **Create Service Account:**
   - Navigate to: IAM & Admin → Service Accounts
   - Click: **Create Service Account**
   - Name: `africoin-wallet-deploy`
   - Description: `Service account for Africoin Wallet CI/CD deployment to Google Play Store`
   - Click: **Create and Continue**

3. **Grant Permissions:**
   - Role: **Service Account User**
   - Click: **Continue**
   - Click: **Done**

4. **Create JSON Key:**
   - Click on the service account
   - Go to: **Keys** tab
   - Click: **Add Key** → **Create new key**
   - Type: **JSON**
   - Click: **Create**
   - Save as: `google-play-service-account.json`

5. **Link to Play Console:**
   - Go to [Play Console API Access](https://play.google.com/console/developers/8975457855584245860/api-access)
   - Find your service account
   - Click: **Grant access**
   - Select permissions:
     - ✅ View app information and download bulk reports
     - ✅ Create and edit draft apps
     - ✅ Release apps to testing tracks
     - ✅ Release apps to production
     - ✅ Manage testing tracks and edit tester lists
   - Click: **Invite user**

---

## Environment Variables

### Local Development

Add to `.env`:

```bash
# Google Cloud Project
GOOGLE_CLOUD_PROJECT_ID=gen-lang-client-0453426956
GOOGLE_CLOUD_PROJECT_NUMBER=834148498046

# Service Account (for Play Store deployment)
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=./google-play-service-account.json
```

### Codemagic Configuration

Add to `android_signing` environment group:

```yaml
GOOGLE_CLOUD_PROJECT_ID: gen-lang-client-0453426956
GOOGLE_CLOUD_PROJECT_NUMBER: 834148498046
GCLOUD_SERVICE_ACCOUNT_CREDENTIALS: <upload JSON file>
```

### GitHub Secrets

```bash
# Add to repository secrets
gh secret set GOOGLE_CLOUD_PROJECT_ID --body "gen-lang-client-0453426956"
gh secret set GOOGLE_CLOUD_PROJECT_NUMBER --body "834148498046"
gh secret set GCLOUD_SERVICE_ACCOUNT_CREDENTIALS < google-play-service-account.json
```

---

## Firebase Configuration (if applicable)

If using Firebase services:

1. **Go to Firebase Console:**
   - URL: [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Select project: `Africoin` (gen-lang-client-0453426956)

2. **Add Android App:**
   - Click: **Add app** → **Android**
   - Package name: `com.africoin.wallet`
   - App nickname: `Africoin Wallet`
   - Download: `google-services.json`
   - Place in: `android/app/google-services.json`

3. **Add to .gitignore:**
   ```bash
   echo "google-services.json" >> android/app/.gitignore
   ```

---

## API Services

### Enable Required APIs

```bash
# Set project
gcloud config set project gen-lang-client-0453426956

# Enable Google Play Android Developer API
gcloud services enable androidpublisher.googleapis.com

# Enable Cloud Build (if using)
gcloud services enable cloudbuild.googleapis.com

# Enable Container Registry (if using)
gcloud services enable containerregistry.googleapis.com
```

---

## IAM Roles

### Service Account Roles

For Play Store deployment, the service account needs:

- **Service Account User** - To act as a service account
- **Google Play Android Developer** - To publish to Play Store (granted in Play Console)

### Additional Roles (if needed)

```bash
# Grant roles via gcloud
gcloud projects add-iam-policy-binding gen-lang-client-0453426956 \
  --member="serviceAccount:africoin-wallet-deploy@gen-lang-client-0453426956.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

---

## Billing

**Important:** Ensure billing is enabled for the project:

1. Go to: [Billing](https://console.cloud.google.com/billing)
2. Select project: `gen-lang-client-0453426956`
3. Link to billing account if not already linked

**Note:** Google Play API access requires an active billing account.

---

## Security Best Practices

### Service Account Key Security

**DO:**
- ✅ Store JSON key securely (password manager, CI/CD secrets)
- ✅ Add to `.gitignore`
- ✅ Rotate keys every 90 days
- ✅ Use separate service accounts for different environments
- ✅ Grant minimum required permissions

**DON'T:**
- ❌ Commit service account JSON to git
- ❌ Share keys via email/chat
- ❌ Use personal account credentials
- ❌ Grant excessive permissions

### Verify .gitignore

```bash
# Check these files are ignored
git check-ignore google-play-service-account.json
git check-ignore android/app/google-services.json

# Should output the filenames if properly ignored
```

---

## Troubleshooting

### Service Account Not Found in Play Console

**Problem:** Service account doesn't appear in Play Console API access

**Solution:**
1. Wait 24 hours after creating service account
2. Ensure service account email is correct
3. Check project ID matches
4. Verify billing is enabled

### Permission Denied Errors

**Problem:** `The caller does not have permission`

**Solution:**
1. Verify service account has correct roles in GCP
2. Check Play Console permissions are granted
3. Wait 24 hours for permissions to propagate
4. Ensure JSON key is not expired

### Invalid Credentials

**Problem:** `Invalid service account credentials`

**Solution:**
1. Verify JSON file is not corrupted
2. Check service account is enabled
3. Regenerate JSON key if needed
4. Ensure correct project ID in JSON

---

## Quick Reference

### Project URLs

- **GCP Console:** [https://console.cloud.google.com/home/dashboard?project=gen-lang-client-0453426956](https://console.cloud.google.com/home/dashboard?project=gen-lang-client-0453426956)
- **IAM & Admin:** [https://console.cloud.google.com/iam-admin/iam?project=gen-lang-client-0453426956](https://console.cloud.google.com/iam-admin/iam?project=gen-lang-client-0453426956)
- **Service Accounts:** [https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0453426956](https://console.cloud.google.com/iam-admin/serviceaccounts?project=gen-lang-client-0453426956)
- **APIs & Services:** [https://console.cloud.google.com/apis/dashboard?project=gen-lang-client-0453426956](https://console.cloud.google.com/apis/dashboard?project=gen-lang-client-0453426956)

### CLI Commands

```bash
# Set active project
gcloud config set project gen-lang-client-0453426956

# List service accounts
gcloud iam service-accounts list

# Create service account
gcloud iam service-accounts create africoin-wallet-deploy \
  --display-name="Africoin Wallet Deploy"

# Create key
gcloud iam service-accounts keys create google-play-service-account.json \
  --iam-account=africoin-wallet-deploy@gen-lang-client-0453426956.iam.gserviceaccount.com

# List enabled APIs
gcloud services list --enabled
```

---

## Related Documentation

- [ANDROID_SIGNING_SETUP.md](./ANDROID_SIGNING_SETUP.md) - Android signing configuration
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [SETUP_COMPLETE.md](./SETUP_COMPLETE.md) - Quick start guide

---

## Support

### Google Cloud Support
- Documentation: [https://cloud.google.com/docs](https://cloud.google.com/docs)
- Support: [https://cloud.google.com/support](https://cloud.google.com/support)

### Play Console Support
- Help Center: [https://support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- Developer Console: [https://play.google.com/console/developers/8975457855584245860](https://play.google.com/console/developers/8975457855584245860)

### Project Contact
- Developer: Benjamin Mpolokoso
- Email: ben.mpolokoso@gmail.com
- Organization: Africa Railways

---

**Last Updated:** December 28, 2024  
**Status:** ✅ Project Configured
