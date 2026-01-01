# Database Migration Runbook

This runbook provides step-by-step instructions for migrating data from Famous.AI Supabase to Vercel Supabase deployment.

## Prerequisites

### Required Access
- [ ] Access to Famous.AI Supabase project (source)
- [ ] Access to Vercel Supabase project (target)
- [ ] Service role keys for both databases
- [ ] GitHub repository access (for automated workflows)
- [ ] Vercel deployment access

### Required Tools
- [ ] Node.js v18 or higher installed
- [ ] npm installed
- [ ] Git installed
- [ ] Vercel CLI installed (optional, for manual deployment)

### Environment Setup
- [ ] All environment variables configured
- [ ] Database connections tested
- [ ] Backup of source database created

## Pre-Migration Checklist

### 1. Backup Source Database
```bash
# Create backup using Supabase dashboard or CLI
# Document backup location and timestamp
```

### 2. Verify Environment Variables
```bash
# Create .env.local file with required variables
cat > .env.local << EOF
SOURCE_SUPABASE_URL=https://your-famous-ai-project.supabase.co
SOURCE_SUPABASE_KEY=your_service_role_key
TARGET_SUPABASE_URL=https://your-vercel-project.supabase.co
TARGET_SUPABASE_KEY=your_service_role_key
EOF

# Load environment variables
export $(cat .env.local | xargs)
```

### 3. Test Database Connections
```bash
# Run verification script to test connections
npm run verify:migration
```

Expected output: Connection successful, may show count differences (acceptable if target is empty).

### 4. Review Migration Scope
Tables to be migrated:
- profiles
- users
- admin_roles
- loyalty_points
- points_transactions
- favorite_posts
- support_tickets

## Migration Execution

### Option A: Automated Migration (Recommended)

**Using GitHub Actions:**

1. Go to GitHub repository → Actions tab
2. Select "Database Migration and Verification" workflow
3. Click "Run workflow"
4. **First Run (Dry-Run):**
   - Migration Type: `dry-run`
   - Verify Only: `false`
   - Click "Run workflow"
5. Review dry-run results
6. **Production Run:**
   - Migration Type: `production`
   - Verify Only: `false`
   - Click "Run workflow"
7. Monitor workflow execution
8. Download artifacts for audit trail

**Benefits:**
- Automated pre-checks
- Built-in verification
- Audit trail
- Deployment integration
- No local environment needed

### Option B: Manual Migration

**Step 1: Dry Run**
```bash
# Test migration without making changes
node scripts/verify-migration.js --debug --detailed
```

Review output for:
- [ ] All tables accessible
- [ ] No connection errors
- [ ] Schema structure correct

**Step 2: Run Migration**
```bash
# Run migration with debug logging
node scripts/migrate-database.js --debug --retry-count=5
```

Monitor for:
- [ ] All tables processed
- [ ] No critical errors
- [ ] Record counts logged
- [ ] Retry attempts (if any)

**Step 3: Verify Migration**
```bash
# Verify data integrity
node scripts/verify-migration.js --debug --detailed
```

Check for:
- [ ] All row counts match
- [ ] No schema mismatches
- [ ] No verification errors

## Post-Migration Verification

### 1. Data Integrity Check
```bash
# Run detailed verification
node scripts/verify-migration.js --detailed
```

**Verification Checklist:**
- [ ] All table counts match source
- [ ] No schema differences reported
- [ ] Sample records validated
- [ ] Verification report generated

### 2. Application Testing

**Frontend Testing:**
```bash
# Build and test application locally
npm run build
npm run preview
```

Test key features:
- [ ] User authentication
- [ ] Profile loading
- [ ] Loyalty points display
- [ ] Admin functions (if applicable)
- [ ] Transaction history

**Production Testing:**
- [ ] Deploy to Vercel preview environment
- [ ] Test all critical user flows
- [ ] Verify database connections
- [ ] Check error logs

### 3. Performance Check
- [ ] Query response times acceptable
- [ ] No timeout errors
- [ ] Connection pool configured correctly
- [ ] RLS policies working

## Rollback Procedure

If migration fails or issues are detected:

### 1. Stop All Operations
```bash
# Cancel any running migrations
# Stop deployment processes
```

### 2. Document Issues
- [ ] Capture error logs
- [ ] Note which tables failed
- [ ] Document error messages
- [ ] Take screenshots if needed

### 3. Restore Source State
```bash
# If target database was modified, clear it
# Restore from backup if needed
```

### 4. Investigate and Fix
- Review error logs
- Fix identified issues
- Update migration scripts if needed
- Test fixes in staging

### 5. Retry Migration
- Start from Pre-Migration Checklist
- Apply lessons learned
- Monitor more closely

## Common Issues and Solutions

### Issue: Connection Timeout
**Symptoms:** "Connection failed" or timeout errors
**Solutions:**
1. Check network connectivity
2. Verify service role keys are correct
3. Ensure Supabase projects are accessible
4. Increase retry count: `--retry-count=10`

### Issue: Count Mismatch After Migration
**Symptoms:** Verification shows different counts
**Solutions:**
1. Check for migration errors in logs
2. Re-run migration with `--debug` flag
3. Verify no data was added during migration
4. Check for table-specific errors

### Issue: Schema Mismatch
**Symptoms:** "Schema mismatch" in verification
**Solutions:**
1. Run Supabase migrations on target database
2. Verify table structures match
3. Check for missing columns or constraints
4. Review RLS policies

### Issue: Slow Migration Performance
**Symptoms:** Migration takes very long time
**Solutions:**
1. Check network latency
2. Verify batch size is optimal (default: 100)
3. Check source database load
4. Consider running during off-peak hours

### Issue: Partial Migration Failure
**Symptoms:** Some tables succeed, others fail
**Solutions:**
1. Review failed table logs
2. Re-run migration (upsert will skip existing records)
3. Address table-specific issues
4. Verify table permissions

## Monitoring and Maintenance

### Regular Verification
```bash
# Run verification weekly or after major changes
npm run verify:migration
```

### Audit Trail
- Keep migration logs for at least 90 days
- Document all migration attempts
- Track verification results
- Monitor for data drift

### Performance Monitoring
- Monitor query response times
- Check database connection counts
- Review error rates
- Track storage usage

## Success Criteria

Migration is considered successful when:
- [ ] All tables migrated without errors
- [ ] Row counts match between source and target
- [ ] Schema validation passes
- [ ] Application functions correctly with target database
- [ ] Performance metrics are acceptable
- [ ] Verification report shows 100% match
- [ ] No critical errors in logs
- [ ] Stakeholders notified and approved

## Sign-Off

**Migration Performed By:** ___________________  
**Date:** ___________________  
**Source Database:** ___________________  
**Target Database:** ___________________  
**Total Records Migrated:** ___________________  
**Verification Status:** ___________________  
**Issues Encountered:** ___________________  
**Approved By:** ___________________  

## Additional Resources

- [Scripts README](scripts/README.md) - Detailed script documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

## Support

For issues or questions:
- Create an issue in the GitHub repository
- Review troubleshooting section above
- Check Supabase and Vercel status pages
- Contact: support@africoin.com
