# Database Seeding Guide

## Overview

The seeding script (`scripts/seed-database.js`) has been updated to populate the database with all necessary initial data for the Africa Railways application.

## Data Sources Identified

### 1. **Blog Posts** (from `src/data/blogPosts.ts`)
- 7 blog posts including:
  - TAZARA Railway 50th anniversary article (featured)
  - Africoin launch announcement
  - Mobile money integration article
  - Cryptocurrency basics guide
  - Digital payments case study
  - Blockchain technology explainer
  - Entrepreneur success story

### 2. **Railway Routes** (from `create-routes-table.sql`)
- 3 routes between Nairobi and Mombasa:
  - ARN-101: 08:00 - 14:30 (6h 30m) - $150
  - ARN-102: 14:00 - 20:30 (6h 30m) - $150
  - ARN-103: 20:00 - 02:30 (6h 30m) - $120

### 3. **Loyalty Tiers**
- Bronze (0-999 points) - 0% discount
- Silver (1000-4999 points) - 5% discount
- Gold (5000-9999 points) - 10% discount
- Platinum (10000+ points) - 15% discount

### 4. **Users**
- Benjamin Mpolokoso (bcm32@njit.edu) - Super Admin
- Global Telecom (globaltelecom2000@gmail.com)

### 5. **Loyalty Points & Transactions**
- Initial points for test users
- Sample booking transactions

### 6. **Wallets**
- Initial wallet balances for test users

### 7. **Admin Roles**
- Super admin role for Benjamin Mpolokoso

## Updated Seeding Script

The script now includes two new functions:

### `seedBlogPosts()`
Seeds all 7 blog posts with full content, metadata, and images.

### `seedRoutes()`
Seeds the 3 railway routes between Nairobi and Mombasa.

## Prerequisites

Before running the seeding script, you need:

1. **Supabase Project** set up with the required tables
2. **Environment Variables** configured:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## How to Run

### Option 1: Using npm script (Recommended)
```bash
npm run seed:db
```

### Option 2: Direct execution
```bash
node scripts/seed-database.js
```

### Option 3: With environment variables inline
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
node scripts/seed-database.js
```

## Expected Output

When successful, you should see:
```
========================================
🌱 Database Seeding Started
========================================
Database: https://your-project.supabase.co
========================================

📊 Seeding loyalty tiers...
   ✅ Bronze tier seeded
   ✅ Silver tier seeded
   ✅ Gold tier seeded
   ✅ Platinum tier seeded
👥 Seeding users...
   ✅ bcm32@njit.edu seeded
   ✅ globaltelecom2000@gmail.com seeded
🎯 Seeding loyalty points...
   ✅ Loyalty points seeded for user bcaf0b57...
💰 Seeding points transactions...
   ✅ Transaction ARN-1764352388361 seeded
🛡️ Seeding admin roles...
   ✅ Admin role seeded for user bcaf0b57-107e-442c-919b-c9742edcd8e5
💼 Seeding wallets...
   ✅ Wallet created for Benjamin Mpolokoso
   ✅ Wallet created for Global Telecom
📝 Seeding blog posts...
   ✅ Blog post "The TAZARA Turns 50..." seeded
   ✅ Blog post "Africoin Officially Launches..." seeded
   ✅ Blog post "How Mobile Money is Revolutionizing..." seeded
   ✅ Blog post "Cryptocurrency 101..." seeded
   ✅ Blog post "Digital Payments Transform..." seeded
   ✅ Blog post "Understanding Blockchain Technology..." seeded
   ✅ Blog post "Success Story..." seeded
🚂 Seeding routes...
   ✅ Route ARN-101 seeded
   ✅ Route ARN-102 seeded
   ✅ Route ARN-103 seeded

========================================
✅ Database seeding completed successfully!
========================================
```

## Database Schema Requirements

Ensure these tables exist in your Supabase database:

1. `loyalty_tiers` - Loyalty tier definitions
2. `users` - User accounts
3. `loyalty_points` - User loyalty points
4. `points_transactions` - Points transaction history
5. `admin_roles` - Admin role assignments
6. `wallets` - User wallet balances
7. `blog_posts` - Blog content
8. `routes` - Railway route information

## Troubleshooting

### Missing Environment Variables
```
❌ Missing Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL: ❌
   SUPABASE_SERVICE_ROLE_KEY: ❌
```
**Solution**: Set up your `.env` file or export environment variables.

### Table Does Not Exist
```
❌ Failed to insert: relation "blog_posts" does not exist
```
**Solution**: Run the schema creation scripts first:
```bash
# In Supabase SQL Editor, run:
- database-schema.sql
- create-blog-posts-table.sql
- create-routes-table.sql
```

### Duplicate Key Errors
The script uses `upsert` with conflict resolution, so duplicate entries will be updated rather than causing errors.

## Additional Data Sources

### African Cities Data
Located in `src/data/africanCities.ts` - Contains 56 African cities with coordinates. This is used for the booking form but doesn't need database seeding as it's used client-side.

### SQL Files Available
- `create-blog-posts-table.sql` - Blog posts table schema
- `create-routes-table.sql` - Routes table schema
- `database-schema.sql` - Complete database schema
- `insert-famous-ai-data.sql` - Additional Famous.AI data
- `seed-transactions.sql` - Transaction seed data

## Next Steps

After seeding:

1. Verify data in Supabase dashboard
2. Test the application with seeded data
3. Check blog posts are visible at `/blog`
4. Verify routes appear in booking form
5. Test loyalty program functionality
6. Confirm admin access for super admin user

## Notes

- The script is idempotent - safe to run multiple times
- Uses `upsert` to avoid duplicate entries
- Maintains referential integrity (users before wallets, etc.)
- All timestamps are preserved from original data
- Blog post content includes full article text for the TAZARA feature
