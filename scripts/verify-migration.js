#!/usr/bin/env node

/**
 * Database Migration Verification Script
 * Verifies data integrity between Famous.AI Supabase and Vercel deployment Supabase
 * 
 * Usage:
 *   node scripts/verify-migration.js [--debug] [--detailed]
 * 
 * Options:
 *   --debug     Enable detailed debug logging
 *   --detailed  Perform detailed data comparison (sample records)
 * 
 * Environment Variables Required:
 *   SOURCE_SUPABASE_URL - Famous.AI Supabase URL
 *   SOURCE_SUPABASE_KEY - Famous.AI Supabase service role key
 *   TARGET_SUPABASE_URL - Vercel deployment Supabase URL
 *   TARGET_SUPABASE_KEY - Vercel deployment Supabase service role key
 */

import { createClient } from '@supabase/supabase-js';

// Parse command line arguments
const args = process.argv.slice(2);
const DEBUG = args.includes('--debug');
const DETAILED = args.includes('--detailed');

// Configuration
const TABLES_TO_VERIFY = [
  'profiles',
  'users',
  'admin_roles',
  'loyalty_points',
  'points_transactions',
  'favorite_posts',
  'support_tickets'
];

const SAMPLE_SIZE = 5; // Number of sample records to compare in detailed mode

// Error codes
const ERROR_CODES = {
  ENV_MISSING: 'E001',
  CONNECTION_FAILED: 'E002',
  FETCH_ERROR: 'E003',
  VERIFICATION_FAILED: 'E004',
  UNKNOWN_ERROR: 'E999'
};

// Logging utilities
const getTimestamp = () => new Date().toISOString();

function log(level, message, data = null) {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level}]`;
  
  if (level === 'DEBUG' && !DEBUG) return;
  
  console.log(`${prefix} ${message}`);
  if (data && DEBUG) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function debugLog(message, data = null) {
  log('DEBUG', message, data);
}

function infoLog(message, data = null) {
  log('INFO', message, data);
}

function warnLog(message, data = null) {
  log('WARN', message, data);
}

function errorLog(message, errorCode = null, data = null) {
  const errorMsg = errorCode ? `[${errorCode}] ${message}` : message;
  log('ERROR', errorMsg, data);
}

// Validate environment variables
function validateEnv() {
  infoLog('🔍 Validating environment variables...');
  
  const required = [
    'SOURCE_SUPABASE_URL',
    'SOURCE_SUPABASE_KEY',
    'TARGET_SUPABASE_URL',
    'TARGET_SUPABASE_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    errorLog('Missing required environment variables', ERROR_CODES.ENV_MISSING, { missing });
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease set these variables before running the script.');
    process.exit(1);
  }
  
  infoLog('✅ All required environment variables are set');
}

// Initialize Supabase clients
function initClients() {
  infoLog('🔌 Initializing Supabase clients...');
  
  try {
    const sourceClient = createClient(
      process.env.SOURCE_SUPABASE_URL,
      process.env.SOURCE_SUPABASE_KEY
    );

    const targetClient = createClient(
      process.env.TARGET_SUPABASE_URL,
      process.env.TARGET_SUPABASE_KEY
    );
    
    infoLog('✅ Supabase clients initialized successfully');

    return { sourceClient, targetClient };
  } catch (error) {
    errorLog('Failed to initialize Supabase clients', ERROR_CODES.CONNECTION_FAILED, { error: error.message });
    throw error;
  }
}

// Get table statistics
async function getTableStats(client, tableName) {
  debugLog(`Fetching statistics for ${tableName}...`);
  
  // Get row count (use select without parameters for count-only operations)
  const { count, error: countError } = await client
    .from(tableName)
    .select('*', { count: 'exact', head: true });
  
  if (countError) throw countError;
  
  // Get sample of first records (select all fields for detailed comparison)
  const { data: firstRecords, error: firstError } = await client
    .from(tableName)
    .select('*')
    .limit(SAMPLE_SIZE);
  
  if (firstError) throw firstError;
  
  return {
    count,
    firstRecords: firstRecords || []
  };
}

// Compare sample records
function compareSampleRecords(sourceRecords, targetRecords, tableName) {
  const issues = [];
  
  if (sourceRecords.length === 0 && targetRecords.length === 0) {
    return { match: true, issues: [] };
  }
  
  if (sourceRecords.length !== targetRecords.length) {
    issues.push(`Sample size mismatch: source=${sourceRecords.length}, target=${targetRecords.length}`);
  }
  
  // Compare first record structure if available
  if (sourceRecords.length > 0 && targetRecords.length > 0) {
    const sourceKeys = Object.keys(sourceRecords[0]).sort();
    const targetKeys = Object.keys(targetRecords[0]).sort();
    
    // Compare arrays element by element
    const keysMatch = sourceKeys.length === targetKeys.length && 
                     sourceKeys.every((key, index) => key === targetKeys[index]);
    
    if (!keysMatch) {
      issues.push('Schema mismatch: columns differ between source and target');
      debugLog(`Source columns: ${sourceKeys.join(', ')}`);
      debugLog(`Target columns: ${targetKeys.join(', ')}`);
    }
  }
  
  return {
    match: issues.length === 0,
    issues
  };
}

// Verify a single table
async function verifyTable(sourceClient, targetClient, tableName) {
  const startTime = Date.now();
  infoLog(`🔍 Verifying table: ${tableName}`);
  console.log(`\n🔍 Verifying: ${tableName}`);
  console.log('─'.repeat(50));
  
  try {
    // Get statistics from both databases
    const sourceStats = await getTableStats(sourceClient, tableName);
    const targetStats = await getTableStats(targetClient, tableName);
    
    const duration = Date.now() - startTime;
    const countMatch = sourceStats.count === targetStats.count;
    
    // Basic verification result
    const result = {
      table: tableName,
      sourceCount: sourceStats.count,
      targetCount: targetStats.count,
      countMatch,
      duration,
      issues: []
    };
    
    console.log(`   Source records: ${sourceStats.count}`);
    console.log(`   Target records: ${targetStats.count}`);
    
    if (!countMatch) {
      result.issues.push(`Count mismatch: source=${sourceStats.count}, target=${targetStats.count}`);
      warnLog(`Count mismatch for ${tableName}`, result);
    }
    
    // Detailed verification if requested
    if (DETAILED) {
      debugLog(`Performing detailed verification for ${tableName}`);
      const comparison = compareSampleRecords(
        sourceStats.firstRecords,
        targetStats.firstRecords,
        tableName
      );
      
      result.schemaMatch = comparison.match;
      result.issues.push(...comparison.issues);
      
      if (comparison.match) {
        console.log(`   ✅ Schema matches`);
      } else {
        console.log(`   ⚠️  Schema issues detected`);
        comparison.issues.forEach(issue => console.log(`      - ${issue}`));
      }
    }
    
    const success = countMatch && (!DETAILED || result.schemaMatch);
    
    if (success) {
      infoLog(`✅ Verification passed for ${tableName}`);
      console.log(`   ✅ Verification passed`);
    } else {
      warnLog(`⚠️  Verification failed for ${tableName}`, result);
      console.log(`   ⚠️  Verification failed`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    errorLog(`Failed to verify ${tableName}`, ERROR_CODES.VERIFICATION_FAILED, { 
      error: error.message,
      duration
    });
    console.error(`   ❌ Error: ${error.message}`);
    
    return {
      table: tableName,
      sourceCount: 0,
      targetCount: 0,
      countMatch: false,
      error: error.message,
      duration,
      issues: [error.message]
    };
  }
}

// Generate verification report
function generateReport(results, duration) {
  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION REPORT');
  console.log('='.repeat(70));
  console.log(`Report Generated: ${new Date().toISOString()}`);
  console.log(`Total Duration: ${(duration / 1000).toFixed(2)}s`);
  console.log('─'.repeat(70));
  
  let passedTables = 0;
  let failedTables = 0;
  let totalSourceRecords = 0;
  let totalTargetRecords = 0;
  
  results.forEach(result => {
    const status = result.countMatch ? '✅ PASS' : '❌ FAIL';
    console.log(`\n${status} - ${result.table}`);
    console.log(`   Source: ${result.sourceCount} records`);
    console.log(`   Target: ${result.targetCount} records`);
    
    if (result.error) {
      console.log(`   Error: ${result.error}`);
      failedTables++;
    } else {
      if (result.countMatch) {
        passedTables++;
      } else {
        failedTables++;
      }
      
      totalSourceRecords += result.sourceCount;
      totalTargetRecords += result.targetCount;
      
      if (result.issues && result.issues.length > 0) {
        console.log(`   Issues:`);
        result.issues.forEach(issue => console.log(`      - ${issue}`));
      }
    }
  });
  
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY');
  console.log('─'.repeat(70));
  console.log(`Total Tables Verified: ${results.length}`);
  console.log(`✅ Passed: ${passedTables}`);
  console.log(`❌ Failed: ${failedTables}`);
  console.log(`Total Source Records: ${totalSourceRecords}`);
  console.log(`Total Target Records: ${totalTargetRecords}`);
  console.log(`Match Rate: ${passedTables}/${results.length} (${((passedTables / results.length) * 100).toFixed(1)}%)`);
  console.log('='.repeat(70));
  
  return {
    passedTables,
    failedTables,
    totalSourceRecords,
    totalTargetRecords
  };
}

// Main verification function
async function verify() {
  const startTime = Date.now();
  
  console.log('🚀 Starting database verification...\n');
  infoLog('🚀 Database verification started');
  
  if (DEBUG) {
    console.log('🐛 DEBUG MODE ENABLED\n');
  }
  if (DETAILED) {
    console.log('🔬 DETAILED MODE ENABLED\n');
  }
  
  const sourceUrl = process.env.SOURCE_SUPABASE_URL;
  const targetUrl = process.env.TARGET_SUPABASE_URL;
  
  console.log('Source:', sourceUrl);
  console.log('Target:', targetUrl);
  
  infoLog('Configuration', {
    sourceUrl: sourceUrl.substring(0, 30) + '...',
    targetUrl: targetUrl.substring(0, 30) + '...',
    tablesCount: TABLES_TO_VERIFY.length,
    debugMode: DEBUG,
    detailedMode: DETAILED
  });

  const { sourceClient, targetClient } = initClients();
  const results = [];

  // Verify each table
  for (const tableName of TABLES_TO_VERIFY) {
    const result = await verifyTable(sourceClient, targetClient, tableName);
    results.push(result);
  }

  // Generate report
  const duration = Date.now() - startTime;
  const summary = generateReport(results, duration);
  
  infoLog('Verification completed', {
    ...summary,
    duration
  });

  if (summary.failedTables > 0) {
    warnLog('Some tables failed verification. Check the report above.');
    console.log('\n⚠️  Some tables failed verification. Please review the report above.');
    process.exit(1);
  } else {
    infoLog('🎉 All tables verified successfully!');
    console.log('\n🎉 All tables verified successfully!');
  }
}

// Run verification
(async () => {
  try {
    infoLog('=== Database Verification Script Started ===');
    infoLog('Command line arguments', { args: process.argv.slice(2) });
    
    validateEnv();
    await verify();
    
    infoLog('=== Database Verification Script Completed Successfully ===');
  } catch (error) {
    errorLog('Verification failed', ERROR_CODES.UNKNOWN_ERROR, {
      error: error.message,
      stack: error.stack
    });
    console.error('\n❌ Verification failed:', error.message);
    if (DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
