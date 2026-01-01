#!/usr/bin/env node

/**
 * Database Connection Verification Script
 * Tests connectivity to both source and target Supabase databases
 * 
 * Usage:
 *   node scripts/verify-db-connection.js
 * 
 * Environment Variables Required:
 *   SOURCE_SUPABASE_URL - Famous.AI Supabase URL
 *   SOURCE_SUPABASE_KEY - Famous.AI Supabase service role key
 *   TARGET_SUPABASE_URL - Vercel deployment Supabase URL
 *   TARGET_SUPABASE_KEY - Vercel deployment Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';

// Validate environment variables
function validateEnv() {
  const required = [
    'SOURCE_SUPABASE_URL',
    'SOURCE_SUPABASE_KEY',
    'TARGET_SUPABASE_URL',
    'TARGET_SUPABASE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease set these variables before running the script.');
    return false;
  }
  return true;
}

// Test database connection
async function testConnection(url, key, name) {
  console.log(`\n🔍 Testing ${name} database connection...`);
  console.log(`   URL: ${url}`);
  
  try {
    const client = createClient(url, key);
    
    // Try to query a simple table (profiles is common)
    const { data, error, count } = await client
      .from('profiles')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      // If table doesn't exist (PGRST116), connection is still valid
      if (error.code === 'PGRST116') {
        console.log(`✅ ${name} database connection successful`);
        console.log(`   ⚠️  Note: 'profiles' table not found, but connection is valid`);
        return { success: true, warning: 'Table not found' };
      }
      console.error(`❌ ${name} database connection failed`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code}`);
      return { success: false, error: error.message };
    }
    
    console.log(`✅ ${name} database connection successful`);
    if (count !== null) {
      console.log(`   Records in profiles table: ${count}`);
    }
    return { success: true, count };
  } catch (error) {
    console.error(`❌ ${name} database connection failed`);
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main verification function
async function verify() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║    Database Connection Verification                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  if (!validateEnv()) {
    process.exit(1);
  }

  const sourceResult = await testConnection(
    process.env.SOURCE_SUPABASE_URL,
    process.env.SOURCE_SUPABASE_KEY,
    'Source (Famous.AI)'
  );

  const targetResult = await testConnection(
    process.env.TARGET_SUPABASE_URL,
    process.env.TARGET_SUPABASE_KEY,
    'Target (Vercel)'
  );

  console.log('\n' + '='.repeat(60));
  console.log('📊 Verification Summary');
  console.log('='.repeat(60));

  if (sourceResult.success) {
    console.log('✅ Source database: Connected');
  } else {
    console.log('❌ Source database: Failed');
  }

  if (targetResult.success) {
    console.log('✅ Target database: Connected');
  } else {
    console.log('❌ Target database: Failed');
  }

  console.log('='.repeat(60));

  if (sourceResult.success && targetResult.success) {
    console.log('\n🎉 All connections successful! Ready to migrate.');
    console.log('\nNext step: Run migration with:');
    console.log('  npm run migrate:db');
    process.exit(0);
  } else {
    console.log('\n⚠️  Connection verification failed. Please check:');
    if (!sourceResult.success) {
      console.log('  - Source database credentials are correct');
      console.log('  - Famous.AI project is accessible');
    }
    if (!targetResult.success) {
      console.log('  - Target database credentials are correct');
      console.log('  - Supabase project is not paused');
      console.log('  - Verify URL: https://llvprbmrnjvamjzavmhg.supabase.co');
    }
    console.log('\nFor detailed help, see MIGRATION_GUIDE.md');
    process.exit(1);
  }
}

// Run verification
verify().catch(error => {
  console.error('\n❌ Verification failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});
