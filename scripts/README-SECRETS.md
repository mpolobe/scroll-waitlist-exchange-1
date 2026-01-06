# GitHub Secrets Setup Scripts

Two scripts are provided to help you update GitHub repository secrets.

## Option 1: Interactive Script (Recommended)

**Prerequisites:**
- GitHub CLI (`gh`) must be installed
- You must be authenticated: `gh auth login`

**Run:**
```bash
./scripts/update-github-secrets.sh
```

This script will:
1. Prompt you for each secret value
2. Show a summary before updating
3. Update all secrets at once
4. Provide next steps

## Option 2: Command Generator

If you don't have GitHub CLI installed, use this script to generate commands:

**Run:**
```bash
./scripts/update-secrets-commands.sh
```

This will output:
1. GitHub CLI commands you can copy and run
2. Instructions for using the GitHub web UI
3. Links to relevant pages

## Installing GitHub CLI

### macOS
```bash
brew install gh
```

### Linux (Debian/Ubuntu)
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### Windows
```powershell
winget install --id GitHub.cli
```

Or download from: https://github.com/cli/cli/releases

## Authenticate GitHub CLI

After installing:
```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

## Required Secrets

### Essential (Required for database seeding)
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (rotate first!)

### Optional (For Vercel deployment)
- `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
- `VERCEL_ORG_ID` - From Vercel project settings
- `VERCEL_PROJECT_ID` - From Vercel project settings

## Security Notes

⚠️ **CRITICAL:**
1. **Rotate your Supabase service role key** before running these scripts
2. Never commit secrets to the repository
3. Delete these scripts after use if they contain sensitive data
4. Use the GitHub web UI if you're unsure about CLI tools

## Manual Setup (Web UI)

If you prefer not to use scripts:

1. Go to: https://github.com/mpolobe/scroll-waitlist-exchange-1/settings/secrets/actions
2. Click "New repository secret"
3. Add each secret manually

## Verification

After adding secrets, test the configuration:

```bash
git commit --allow-empty -m "Test secrets configuration"
git push origin main
```

Check the build status:
https://github.com/mpolobe/scroll-waitlist-exchange-1/actions

The workflow should now:
- ✅ Seed the database successfully
- ✅ Build the project
- ✅ Deploy to Vercel (if configured)
