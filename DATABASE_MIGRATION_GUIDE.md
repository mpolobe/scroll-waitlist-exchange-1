# Database Migration Guide: Famous.AI to Vercel

This guide explains how to migrate your database from Famous.AI (hosted on Supabase) to a Vercel-deployed database instance.

## Overview

The migration process uses:
- **Vercel Edge Config**: Secure credential storage and retrieval
- **Batch Processing**: Efficient data transfer in batches of 100 records
- **Safety Prompts**: User confirmation before migration
- **Upsert Strategy**: Preserves existing data while updating/adding new records

## Prerequisites

1. **Source Database (Famous.AI)**:
   - Supabase project URL
   - Service role key (with read permissions)
   - OR Edge Config token (recommended)

2. **Target Database (Vercel)**:
   - New Supabase project URL
   - Service role key (with write permissions)
   - Vercel account with Edge Config access

3. **Node.js**: Version 18 or higher

## Setup

### Option 1: Using Edge Config (Recommended)

1. **Configure Edge Config in Vercel**:
   ```bash
   # Navigate to Vercel Dashboard > Storage > Edge Config
   # Create a new Edge Config named "Famous-AI"
   # Add the configuration key: famous-ai-database
   ```

2. **Set the Edge Config value** with your Famous.AI credentials:
   ```json
   {
     "supabase_url": "https://your-famous-ai-project.supabase.co",
     "supabase_key": "your-service-role-key",
     "project_id": "your-project-id",
     "token": "your-famous-ai-token"
   }
   ```

3. **Set environment variables**:
   ```bash
   # Copy from .env.example
   cp .env.example .env
   
   # Edit .env and add:
   FAMOUS_AI_EDGE_CONFIG_TOKEN=your-famous-ai-token
   # Or use the full Edge Config connection string:
   EDGE_CONFIG=https://edge-config.vercel.com/your-config-id
   
   # Add target database credentials:
   TARGET_SUPABASE_URL=https://your-vercel-project.supabase.co
   TARGET_SUPABASE_KEY=your_vercel_service_role_key
   ```

### Option 2: Using Direct Credentials

If you prefer not to use Edge Config, set these environment variables:

```bash
SOURCE_SUPABASE_URL=https://your-famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=your_famous_ai_service_role_key
TARGET_SUPABASE_URL=https://your-vercel-project.supabase.co
TARGET_SUPABASE_KEY=your_vercel_service_role_key
```

## Running the Migration

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the migration script**:
   ```bash
   npm run migrate:db
   ```
   
   Or directly:
   ```bash
   node scripts/migrate-database.js
   ```

3. **Follow the prompts**:
   - Review the migration details
   - Confirm to proceed (type "yes" or "y")
   - Monitor the progress for each table

4. **Review the summary**:
   - Check the number of records migrated
   - Verify any errors or warnings
   - Note any failed tables

## Migrated Tables

The following tables will be migrated:
- `profiles` - User profile information
- `users` - User accounts and authentication
- `admin_roles` - Administrative permissions
- `loyalty_points` - User loyalty program points
- `points_transactions` - Points history and transactions
- `favorite_posts` - User-saved content
- `support_tickets` - Customer support tickets

## Post-Migration Steps

1. **Update Application Configuration**:
   ```bash
   # Update your .env or Vercel environment variables:
   VITE_SUPABASE_URL=https://your-vercel-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_vercel_anon_key
   ```

2. **Verify Database Schema**:
   - Ensure all tables were created correctly
   - Check relationships and constraints
   - Verify indexes are in place

3. **Test Application**:
   ```bash
   npm run dev
   ```
   - Test authentication
   - Verify data retrieval
   - Check write operations

4. **Deploy to Vercel**:
   ```bash
   npm run deploy:prod
   ```

## Troubleshooting

### Edge Config Connection Issues

**Problem**: "Edge Config connection string not provided"

**Solution**:
- Verify `EDGE_CONFIG` or `FAMOUS_AI_EDGE_CONFIG_TOKEN` is set
- Check the token is correctly formatted
- Ensure you have access to the Edge Config in Vercel

### Missing Source Credentials

**Problem**: "Missing source database credentials"

**Solution**:
- Use Edge Config (Option 1), or
- Set `SOURCE_SUPABASE_URL` and `SOURCE_SUPABASE_KEY` directly

### Permission Errors

**Problem**: "Row level security policy violation"

**Solution**:
- Use service role keys (not anon keys)
- Verify keys have proper permissions
- Check RLS policies in Supabase

### Migration Failures

**Problem**: Some tables fail to migrate

**Solution**:
- Check network connectivity
- Verify table names match in both databases
- Ensure target database schema exists
- Review error messages for specific issues

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use service role keys** only in secure server environments
3. **Rotate keys** after migration completion
4. **Enable RLS policies** in production
5. **Monitor access logs** in both databases

## Data Integrity

The migration uses an **upsert strategy** (`onConflict: 'id'`):
- Existing records with matching IDs are updated
- New records are inserted
- No data is deleted
- Preserves referential integrity

## Rollback Plan

If you need to rollback:

1. **Keep the source database** intact during migration
2. **Backup target database** before starting
3. **Test thoroughly** before switching production traffic
4. **Use gradual rollout** with feature flags if possible

## Support

For issues or questions:
- Check the [Vercel Edge Config documentation](https://vercel.com/docs/storage/edge-config)
- Review [Supabase migration guides](https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects)
- Open an issue in this repository

## Related Files

- `scripts/migrate-database.js` - Main migration script
- `src/lib/edge-config.ts` - Edge Config integration utility
- `.env.example` - Environment variable template
- `vercel.json` - Vercel deployment configuration
