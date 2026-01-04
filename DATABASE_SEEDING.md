# Database Seeding Setup

This project includes automated database seeding that runs during the build process.

## What Gets Seeded

The seed script (`scripts/seed-database.js`) automatically inserts:

- **4 Loyalty Tiers**: Bronze, Silver, Gold, Platinum with discount percentages
- **2 Test Users**: Benjamin Mpolokoso and Global Telecom
- **1 Loyalty Points Record**: Initial points balance
- **1 Points Transaction**: Sample booking transaction

## How It Works

### Automatic Seeding (Recommended)

The database is automatically seeded during every build:

1. **npm run build** - Triggers `prebuild` hook which runs `seed:db`
2. **Codemagic Builds** - Includes explicit seeding step after npm install
3. **Vercel Deployments** - Runs automatically via npm build lifecycle

### Manual Seeding

To seed the database manually:

```bash
npm run seed:db
```

### Environment Variables Required

The seed script requires these environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Vercel Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for write access

## Build Integration

### package.json
```json
{
  "scripts": {
    "seed:db": "node scripts/seed-database.js",
    "prebuild": "npm run seed:db",
    "build": "webpack --mode production"
  }
}
```

### codemagic.yaml
```yaml
- name: Seed database
  script: |
    echo "🌱 Seeding database with initial data..."
    npm run seed:db
```

### Vercel (vercel.json)
Automatic via npm prebuild hook - no additional configuration needed.

## Features

- **Idempotent**: Safe to run multiple times (uses UPSERT)
- **No Duplicates**: Uses conflict resolution on unique keys
- **Dependency Order**: Inserts data in correct order (tiers → users → points → transactions)
- **Build-time Execution**: Runs automatically during CI/CD
- **Error Handling**: Exits with proper codes for build pipeline integration

## Customization

To modify seed data, edit `scripts/seed-database.js`:

- Add/remove loyalty tiers
- Change discount percentages
- Add more test users
- Customize sample transactions

## Verification

After seeding, verify the data:

```bash
node check-database.js
```

Or check in Supabase dashboard:
https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/editor
