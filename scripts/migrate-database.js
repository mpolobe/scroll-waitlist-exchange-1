#!/usr/bin/env node

/**
 * Database Migration Script
 * Copies data from Famous.AI Supabase to Vercel deployment Supabase
 * 
 * Usage:
 *   node scripts/migrate-database.js [--debug] [--interactive] [--retry-count=3] [--dry-run]
 * 
 * Options:
 *   --debug          Enable detailed debug logging
 *   --interactive    Enable step-by-step interactive prompts
 *   --retry-count=N  Set number of retries for failed operations (default: 3)
 *   --dry-run        Fetch data but don't insert (test mode)
 * 
 * Environment Variables Required:
 *   SOURCE_SUPABASE_URL - Famous.AI Supabase URL
 *   SOURCE_SUPABASE_KEY - Famous.AI Supabase service role key
 *   TARGET_SUPABASE_URL - Vercel deployment Supabase URL (https://llvprbmrnjvamjzavmhg.supabase.co)
 *   TARGET_SUPABASE_KEY - Vercel deployment Supabase service role key
 * 
 * Famous.AI Configuration:
 *   Edge Configuration Name: Famous-AI
 *   Token: fd6b6ddc-e56a-441f-9b24-abca65e9eb37
 *   Option 1: Use Edge Config (Recommended for Famous.AI)
 *     EDGE_CONFIG - Vercel Edge Config connection string
 *     or
 *     FAMOUS_AI_EDGE_CONFIG_TOKEN - Famous.AI Edge Config token
 *   
 *   Option 2: Direct credentials
 *     SOURCE_SUPABASE_URL - Famous.AI Supabase URL
 *     SOURCE_SUPABASE_KEY - Famous.AI Supabase service role key
 *   
 *   Required for both options:
 *     TARGET_SUPABASE_URL - Vercel deployment Supabase URL
 *     TARGET_SUPABASE_KEY - Vercel deployment Supabase service role key
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient as createEdgeConfigClient } from '@vercel/edge-config';
import readline from 'readline';
import { createClient } from '@supabase/supabase-js';
// Note: readline-sync is intentionally used here for simple synchronous prompts in a CLI migration script.
// This is appropriate for this use case as it's a one-time migration tool, not a production server.
// The blocking behavior is acceptable and actually desired for interactive confirmation.
import readlineSync from 'readline-sync';

// Parse command line arguments
const args = process.argv.slice(2);
const DEBUG = args.includes('--debug');
const INTERACTIVE = args.includes('--interactive');
const DRY_RUN = args.includes('--dry-run');
const retryArg = args.find(arg => arg.startsWith('--retry-count='))?.split('=')[1];
const RETRY_COUNT = retryArg && !isNaN(parseInt(retryArg, 10)) ? parseInt(retryArg, 10) : 3;

// Configuration
const TABLES_TO_MIGRATE = [
  'profiles',
  'users',
  'admin_roles',
  'loyalty_points',
  'points_transactions',
  'favorite_posts',
  'support_tickets'
];

const BATCH_SIZE = 100;

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for confirmation
function promptUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.toLowerCase().trim() === 'yes' || answer.toLowerCase().trim() === 'y');
    });
  });
}

// Retrieve Famous.AI credentials from Edge Config
async function getCredentialsFromEdgeConfig() {
  const edgeConfigToken = process.env.FAMOUS_AI_EDGE_CONFIG_TOKEN;
  const edgeConfigConnection = process.env.EDGE_CONFIG;
  
  if (!edgeConfigToken && !edgeConfigConnection) {
    return null;
  }

  try {
    // Build connection string if token is provided
    // Note: Default Vercel Edge Config URL pattern - can be overridden with EDGE_CONFIG
    const connectionString = edgeConfigConnection || 
      `https://edge-config.vercel.com/${edgeConfigToken}`;
    
    const client = createEdgeConfigClient(connectionString);
    
    // Try to get database configuration
    const config = await client.get('famous-ai-database');
    
    if (!config || typeof config !== 'object') {
      console.log('⚠️  No database configuration found in Edge Config');
      return null;
    }

    console.log('✅ Retrieved credentials from Edge Config');
    
    return {
      url: config.supabase_url || config.url,
      key: config.supabase_key || config.key || config.service_role_key
    };
  } catch (error) {
    console.error('⚠️  Failed to retrieve from Edge Config:', error.message);
    return null;
  }
}

// Validate environment variables
async function validateEnv() {
  console.log('🔍 Validating configuration...\n');
  
  // Check if we can get credentials from Edge Config
  const edgeConfigCreds = await getCredentialsFromEdgeConfig();
  
  let sourceUrl, sourceKey;
  
  if (edgeConfigCreds) {
    sourceUrl = edgeConfigCreds.url;
    sourceKey = edgeConfigCreds.key;
    console.log('✅ Using Edge Config for source database credentials');
  } else {
    sourceUrl = process.env.SOURCE_SUPABASE_URL;
    sourceKey = process.env.SOURCE_SUPABASE_KEY;
    
    if (!sourceUrl || !sourceKey) {
      console.error('❌ Missing source database credentials.');
      console.error('   Please provide either:');
      console.error('   - EDGE_CONFIG or FAMOUS_AI_EDGE_CONFIG_TOKEN (preferred)');
      console.error('   - SOURCE_SUPABASE_URL and SOURCE_SUPABASE_KEY');
      rl.close();
      process.exit(1);
    }
    console.log('✅ Using environment variables for source database');
  }
  
  if (!process.env.TARGET_SUPABASE_URL || !process.env.TARGET_SUPABASE_KEY) {
    console.error('❌ Missing target database credentials:');
    console.error('   - TARGET_SUPABASE_URL');
    console.error('   - TARGET_SUPABASE_KEY');
    rl.close();
    process.exit(1);
  }
  
  console.log('✅ All required credentials found\n');
  
  return { sourceUrl, sourceKey };
}

// Initialize Supabase clients
function initClients(sourceUrl, sourceKey) {
  const sourceClient = createSupabaseClient(sourceUrl, sourceKey);
  const targetClient = createSupabaseClient(
    process.env.TARGET_SUPABASE_URL,
    process.env.TARGET_SUPABASE_KEY
  );
// Error codes
const ERROR_CODES = {
  ENV_MISSING: 'E001',
  CONNECTION_FAILED: 'E002',
  FETCH_ERROR: 'E003',
  INSERT_ERROR: 'E004',
  TABLE_MIGRATION_FAILED: 'E005',
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

function promptUser(message) {
  if (!INTERACTIVE) return true;
  
  const answer = readlineSync.keyInYNStrict(`\n${message}\n`);
  return answer;
}

async function retryOperation(operation, operationName, maxRetries = RETRY_COUNT) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      debugLog(`Attempt ${attempt}/${maxRetries} for ${operationName}`);
      return await operation();
    } catch (error) {
      lastError = error;
      warnLog(`Attempt ${attempt}/${maxRetries} failed for ${operationName}: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff with integer arithmetic: 1000, 2000, 4000, 8000, max 10000
        const waitTime = Math.min(1000 << (attempt - 1), 10000);
        infoLog(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}

// Validate environment variables
function validateEnv() {
  const startTime = Date.now();
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
  
  const duration = Date.now() - startTime;
  debugLog(`Environment validation completed in ${duration}ms`);
  infoLog('✅ All required environment variables are set');
}

// Initialize Supabase clients
function initClients() {
  const startTime = Date.now();
  infoLog('🔌 Initializing Supabase clients...');
  
  try {
    const sourceUrl = process.env.SOURCE_SUPABASE_URL;
    const targetUrl = process.env.TARGET_SUPABASE_URL;
    
    debugLog('Source URL configured', { url: sourceUrl.substring(0, 30) + '...' });
    debugLog('Target URL configured', { url: targetUrl.substring(0, 30) + '...' });
    
    const sourceClient = createClient(
      sourceUrl,
      process.env.SOURCE_SUPABASE_KEY
    );

    const targetClient = createClient(
      targetUrl,
      process.env.TARGET_SUPABASE_KEY
    );
    
    const duration = Date.now() - startTime;
    debugLog(`Clients initialized in ${duration}ms`);
    infoLog('✅ Supabase clients initialized successfully');

    return { sourceClient, targetClient };
  } catch (error) {
    errorLog('Failed to initialize Supabase clients', ERROR_CODES.CONNECTION_FAILED, { error: error.message });
    throw error;
  }
}

// Validate database connections
async function validateConnections(sourceClient, targetClient) {
  console.log('🔍 Validating database connections...\n');
  
  // Test source connection
  console.log('Testing source database connection...');
  try {
    const { error: sourceError } = await sourceClient.from('profiles').select('id', { count: 'exact', head: true });
    if (sourceError && sourceError.code !== 'PGRST116') {
      console.error('❌ Source database connection failed:', sourceError.message);
      return false;
    }
    console.log('✅ Source database connection successful\n');
  } catch (error) {
    console.error('❌ Source database connection failed:', error.message);
    return false;
  }

  // Test target connection
  console.log('Testing target database connection...');
  console.log('Target URL:', process.env.TARGET_SUPABASE_URL);
  try {
    const { error: targetError } = await targetClient.from('profiles').select('id', { count: 'exact', head: true });
    if (targetError && targetError.code !== 'PGRST116') {
      console.error('❌ Target database connection failed:', targetError.message);
      console.error('Please verify:');
      console.error('  1. The Supabase project is active (not paused)');
      console.error('  2. The service role key is correct');
      console.error('  3. The URL is correct: https://llvprbmrnjvamjzavmhg.supabase.co');
      return false;
    }
    console.log('✅ Target database connection successful\n');
  } catch (error) {
    console.error('❌ Target database connection failed:', error.message);
    console.error('Please verify the Supabase project is unpaused and accessible.');
    return false;
  }

  return true;
}

// Fetch all data from a table with pagination
async function fetchAllData(client, tableName) {
  const startTime = Date.now();
  infoLog(`📥 Fetching data from ${tableName}...`);
  
  let allData = [];
  let from = 0;
  let hasMore = true;
  let batchCount = 0;

  while (hasMore) {
    batchCount++;
    debugLog(`Fetching batch ${batchCount} from ${tableName} (range: ${from}-${from + BATCH_SIZE - 1})`);
    
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      errorLog(`Error fetching from ${tableName}`, ERROR_CODES.FETCH_ERROR, { 
        error: error.message,
        range: `${from}-${from + BATCH_SIZE - 1}`,
        batch: batchCount
      });
      throw error;
    }

    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += BATCH_SIZE;
      debugLog(`Fetched ${data.length} records in batch ${batchCount}, total: ${allData.length}`);
      console.log(`   Fetched ${allData.length} records...`);
    }

    hasMore = data && data.length === BATCH_SIZE;
  }
  
  const duration = Date.now() - startTime;
  infoLog(`✅ Fetched ${allData.length} total records from ${tableName} in ${duration}ms (${batchCount} batches)`);
  
  if (INTERACTIVE && allData.length > 0) {
    if (!promptUser(`Continue with inserting ${allData.length} records into target database?`)) {
      throw new Error('User cancelled operation');
    }
  }
  
  return allData;
}

// Insert data into target table with batching
async function insertData(client, tableName, data) {
  const startTime = Date.now();
  
  if (!data || data.length === 0) {
    warnLog(`No data to insert into ${tableName}`);
    console.log(`⚠️  No data to insert into ${tableName}`);
    return { success: true, count: 0, failed: 0 };
  }

  if (DRY_RUN) {
    infoLog(`[DRY-RUN] Would insert ${data.length} records into ${tableName}`);
    console.log(`🧪 [DRY-RUN] Would insert ${data.length} records into ${tableName}`);
    return { success: true, count: data.length, failed: 0, duration: Date.now() - startTime };
  }

  infoLog(`📤 Inserting ${data.length} records into ${tableName}...`);
  
  let inserted = 0;
  let failed = 0;
  let batchCount = 0;
  const failedBatches = [];

  // Process in batches
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    batchCount++;
    const batch = data.slice(i, i + BATCH_SIZE);
    debugLog(`Inserting batch ${batchCount} into ${tableName} (${batch.length} records)`);
    
    try {
      await retryOperation(async () => {
        const { error } = await client
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          throw error;
        }
      }, `Insert batch ${batchCount} into ${tableName}`);
      
      inserted += batch.length;
      debugLog(`Successfully inserted batch ${batchCount}, total: ${inserted}/${data.length}`);
      console.log(`   Inserted ${inserted}/${data.length} records...`);
    } catch (error) {
      errorLog(`Error inserting batch ${batchCount} into ${tableName}`, ERROR_CODES.INSERT_ERROR, {
        error: error.message,
        batchSize: batch.length,
        batchNumber: batchCount
      });
      failed += batch.length;
      failedBatches.push({ batchNumber: batchCount, error: error.message });
    }
  }
  
  const duration = Date.now() - startTime;
  infoLog(`✅ Inserted ${inserted} records into ${tableName} in ${duration}ms`);
  
  if (failed > 0) {
    warnLog(`Failed to insert ${failed} records`, null, { failedBatches });
    console.log(`⚠️  Failed to insert ${failed} records`);
    debugLog('Failed batches details', { failedBatches });
  }

  return { success: failed === 0, count: inserted, failed, duration };
}

// Migrate a single table
async function migrateTable(sourceClient, targetClient, tableName) {
  const startTime = Date.now();
  infoLog(`🔄 Starting migration for table: ${tableName}`);
  console.log(`\n🔄 Migrating table: ${tableName}`);
  console.log('─'.repeat(50));

  if (INTERACTIVE) {
    if (!promptUser(`Proceed with migrating table: ${tableName}?`)) {
      warnLog(`User skipped migration for table: ${tableName}`);
      return {
        table: tableName,
        success: false,
        count: 0,
        skipped: true
      };
    }
  }

  try {
    // Fetch data from source
    const data = await fetchAllData(sourceClient, tableName);

    // Insert data into target
    const result = await insertData(targetClient, tableName, data);
    
    const duration = Date.now() - startTime;
    infoLog(`✅ Completed migration for ${tableName} in ${duration}ms`);

    return {
      table: tableName,
      success: result.success,
      count: result.count,
      failed: result.failed || 0,
      duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    errorLog(`Failed to migrate ${tableName}`, ERROR_CODES.TABLE_MIGRATION_FAILED, { 
      error: error.message,
      duration
    });
    console.error(`❌ Failed to migrate ${tableName}:`, error.message);
    
    return {
      table: tableName,
      success: false,
      count: 0,
      failed: 0,
      error: error.message,
      duration
    };
  }
}

// Verify data integrity between source and target
async function verifyDataIntegrity(sourceClient, targetClient, tableName) {
  const startTime = Date.now();
  infoLog(`🔍 Verifying data integrity for ${tableName}...`);
  console.log(`\n🔍 Verifying: ${tableName}`);
  
  try {
    // Count records in source (use select with head:true for count-only operations)
    const { count: sourceCount, error: sourceError } = await sourceClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (sourceError) throw sourceError;
    
    // Count records in target (use select with head:true for count-only operations)
    const { count: targetCount, error: targetError } = await targetClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (targetError) throw targetError;
    
    const duration = Date.now() - startTime;
    const match = sourceCount === targetCount;
    
    if (match) {
      infoLog(`✅ Verification passed for ${tableName}: ${sourceCount} records match`);
      console.log(`   ✅ ${sourceCount} records (matched)`);
    } else {
      warnLog(`⚠️  Count mismatch for ${tableName}: source=${sourceCount}, target=${targetCount}`);
      console.log(`   ⚠️  Mismatch: source=${sourceCount}, target=${targetCount}`);
    }
    
    return {
      table: tableName,
      sourceCount,
      targetCount,
      match,
      duration
    };
  } catch (error) {
    errorLog(`Failed to verify ${tableName}`, ERROR_CODES.FETCH_ERROR, { error: error.message });
    return {
      table: tableName,
      sourceCount: 0,
      targetCount: 0,
      match: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting database migration from Famous.AI to Vercel...\n');
  
  // Display migration information
  console.log('📋 Migration Details:');
  console.log('   Tables to migrate:', TABLES_TO_MIGRATE.length);
  console.log('   Batch size:', BATCH_SIZE);
  console.log('   Target:', process.env.TARGET_SUPABASE_URL);
  const migrationStartTime = Date.now();
  
  console.log('🚀 Starting database migration...\n');
  infoLog('🚀 Database migration started');
  
  if (DRY_RUN) {
    console.log('🧪 DRY-RUN MODE - No data will be inserted\n');
    infoLog('DRY-RUN MODE enabled - testing only');
  }
  
  // Log configuration (excluding sensitive data)
  const sourceUrl = process.env.SOURCE_SUPABASE_URL;
  const targetUrl = process.env.TARGET_SUPABASE_URL;
  
  console.log('Source:', sourceUrl);
  console.log('Target:', targetUrl);
  console.log('');
  
  infoLog('Configuration', {
    sourceUrl: sourceUrl.substring(0, 30) + '...',
    targetUrl: targetUrl.substring(0, 30) + '...',
    batchSize: BATCH_SIZE,
    retryCount: RETRY_COUNT,
    tablesCount: TABLES_TO_MIGRATE.length,
    debugMode: DEBUG,
    interactiveMode: INTERACTIVE,
    dryRun: DRY_RUN
  });
  
  if (INTERACTIVE) {
    if (!promptUser('Ready to start migration?')) {
      infoLog('Migration cancelled by user');
      console.log('❌ Migration cancelled');
      process.exit(0);
    }
  }

  // Safety prompt
  console.log('⚠️  SAFETY CHECK');
  console.log('═'.repeat(50));
  console.log('This will migrate data from Famous.AI to your Vercel database.');
  console.log('Existing data in the target database will be updated or preserved.');
  console.log('Tables:', TABLES_TO_MIGRATE.join(', '));
  console.log('═'.repeat(50));
  console.log('');

  const { sourceClient, targetClient } = initClients();
  
  // Validate connections before proceeding
  const connectionsValid = await validateConnections(sourceClient, targetClient);
  if (!connectionsValid) {
    console.error('\n❌ Database connection validation failed. Aborting migration.');
    process.exit(1);
  }

  const confirmed = await promptUser('Do you want to proceed? (yes/no): ');
  
  if (!confirmed) {
    console.log('\n❌ Migration cancelled by user.');
    rl.close();
    process.exit(0);
  }

  console.log('\n✅ Starting migration...\n');

  const credentials = await validateEnv();
  const { sourceClient, targetClient } = initClients(credentials.sourceUrl, credentials.sourceKey);
  const results = [];

  // Migrate each table
  for (const tableName of TABLES_TO_MIGRATE) {
    const result = await migrateTable(sourceClient, targetClient, tableName);
    results.push(result);
  }
  
  // Verify data integrity after migration
  console.log('\n' + '='.repeat(50));
  console.log('🔍 Verifying Data Integrity');
  console.log('='.repeat(50));
  infoLog('Starting data integrity verification...');
  
  const verificationResults = [];
  for (const tableName of TABLES_TO_MIGRATE) {
    const verification = await verifyDataIntegrity(sourceClient, targetClient, tableName);
    verificationResults.push(verification);
  }

  // Print summary
  const migrationDuration = Date.now() - migrationStartTime;
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));

  let totalRecords = 0;
  let totalFailed = 0;
  let successfulTables = 0;
  let failedTables = 0;
  let skippedTables = 0;

  results.forEach(result => {
    if (result.skipped) {
      console.log(`⏭️  ${result.table}: Skipped by user`);
      skippedTables++;
    } else {
      const status = result.success ? '✅' : '❌';
      const failedInfo = result.failed > 0 ? ` (${result.failed} failed)` : '';
      const timeInfo = result.duration ? ` [${result.duration}ms]` : '';
      console.log(`${status} ${result.table}: ${result.count} records${failedInfo}${timeInfo}`);
      
      if (result.success) {
        successfulTables++;
        totalRecords += result.count;
      } else {
        failedTables++;
        if (result.error) {
          console.log(`   Error: ${result.error}`);
        }
      }
      
      if (result.failed) {
        totalFailed += result.failed;
      }
    }
  });

  console.log('─'.repeat(50));
  console.log(`Total records migrated: ${totalRecords}`);
  if (totalFailed > 0) {
    console.log(`Total records failed: ${totalFailed}`);
  }
  console.log(`Successful tables: ${successfulTables}/${results.length}`);
  console.log(`Failed tables: ${failedTables}/${results.length}`);
  if (skippedTables > 0) {
    console.log(`Skipped tables: ${skippedTables}/${results.length}`);
  }
  console.log(`Total migration time: ${migrationDuration}ms (${(migrationDuration / 1000).toFixed(2)}s)`);
  console.log('='.repeat(50));

  // Print verification summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Verification Summary');
  console.log('='.repeat(50));
  
  let verifiedTables = 0;
  let verificationErrors = 0;
  
  verificationResults.forEach(result => {
    const status = result.match ? '✅' : '⚠️';
    const errorInfo = result.error ? ` (Error: ${result.error})` : '';
    console.log(`${status} ${result.table}: Source=${result.sourceCount}, Target=${result.targetCount}${errorInfo}`);
    
    if (result.match) {
      verifiedTables++;
    } else if (result.error) {
      verificationErrors++;
    }
  });
  
  console.log('─'.repeat(50));
  console.log(`Verified tables: ${verifiedTables}/${verificationResults.length}`);
  if (verificationErrors > 0) {
    console.log(`Verification errors: ${verificationErrors}`);
  }
  console.log('='.repeat(50));

  rl.close();
  infoLog('Migration completed', {
    totalRecords,
    totalFailed,
    successfulTables,
    failedTables,
    skippedTables,
    totalTables: results.length,
    verifiedTables,
    verificationErrors,
    duration: migrationDuration
  });

  if (failedTables > 0) {
    warnLog('Some tables failed to migrate. Check the errors above.');
    console.log('\n⚠️  Some tables failed to migrate. Check the errors above.');
    process.exit(1);
  } else if (verifiedTables < TABLES_TO_MIGRATE.length - skippedTables) {
    warnLog('Some tables failed verification. Check the warnings above.');
    console.log('\n⚠️  Some tables failed verification. Please review the data manually.');
    process.exit(1);
  } else {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Update your .env file with new database credentials');
    console.log('   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.log('   3. Deploy your application to Vercel');
    infoLog('🎉 Migration completed successfully!');
    console.log('\n🎉 Migration and verification completed successfully!');
  }
}

// Run migration
(async () => {
  try {
    infoLog('=== Database Migration Script Started ===');
    infoLog('Command line arguments', { args: process.argv.slice(2) });
    
    if (DEBUG) {
      console.log('\n🐛 DEBUG MODE ENABLED');
    }
    if (INTERACTIVE) {
      console.log('🎮 INTERACTIVE MODE ENABLED');
    }
    if (DRY_RUN) {
      console.log('🧪 DRY-RUN MODE ENABLED (no data will be inserted)');
    }
    console.log(`🔄 Retry count: ${RETRY_COUNT}\n`);
    
    validateEnv();
    await migrate();
    
    infoLog('=== Database Migration Script Completed Successfully ===');
  } catch (error) {
    errorLog('Migration failed', ERROR_CODES.UNKNOWN_ERROR, {
      error: error.message,
      stack: error.stack
    });
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    rl.close();
    if (DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
