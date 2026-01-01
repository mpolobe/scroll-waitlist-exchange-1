#!/usr/bin/env node

/**
 * Database Migration Script
 * Copies data from Famous.AI Supabase to Vercel deployment Supabase
 * 
 * Usage:
 *   node scripts/migrate-database.js
 * 
 * Environment Variables Required:
 *   SOURCE_SUPABASE_URL - Famous.AI Supabase URL
 *   SOURCE_SUPABASE_KEY - Famous.AI Supabase service role key
 *   TARGET_SUPABASE_URL - Vercel deployment Supabase URL (e.g., https://llvprbmrnjvamjzavmhg.supabase.co)
 *   TARGET_SUPABASE_KEY - Vercel deployment Supabase service role key
 * 
 * Features:
 *   - Batch processing for large datasets
 *   - Comprehensive error handling and retry logic
 *   - Detailed logging for debugging
 *   - Progress tracking for each table
 *   - Migration summary report
 */

import { createClient } from '@supabase/supabase-js';

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
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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
    process.exit(1);
  }
}

// Initialize Supabase clients
function initClients() {
  console.log('🔌 Initializing Supabase clients...');
  
  const sourceClient = createClient(
    process.env.SOURCE_SUPABASE_URL,
    process.env.SOURCE_SUPABASE_KEY
  );

  const targetClient = createClient(
    process.env.TARGET_SUPABASE_URL,
    process.env.TARGET_SUPABASE_KEY
  );

  console.log('✅ Supabase clients initialized');
  return { sourceClient, targetClient };
}

// Fetch all data from a table with pagination
async function fetchAllData(client, tableName) {
  console.log(`📥 Fetching data from ${tableName}...`);
  const startTime = Date.now();
  
  let allData = [];
  let from = 0;
  let hasMore = true;
  let attempts = 0;

  while (hasMore) {
    attempts++;
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      console.error(`❌ Error fetching from ${tableName} (attempt ${attempts}):`, error.message);
      if (attempts < MAX_RETRIES) {
        console.log(`   Retrying in ${RETRY_DELAY_MS}ms...`);
        await delay(RETRY_DELAY_MS);
        continue;
      } else {
        throw error;
      }
    }

    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += BATCH_SIZE;
      console.log(`   Fetched ${allData.length} records so far...`);
      attempts = 0; // Reset attempts on success
    }

    hasMore = data && data.length === BATCH_SIZE;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Fetched ${allData.length} total records from ${tableName} in ${duration}s`);
  return allData;
}

// Insert data into target table with batching
async function insertData(client, tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data to insert into ${tableName}`);
    return { success: true, count: 0 };
  }

  console.log(`📤 Inserting ${data.length} records into ${tableName}...`);
  const startTime = Date.now();
  
  let inserted = 0;
  let failed = 0;
  const errors = [];

  // Process in batches
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    let attempts = 0;
    let success = false;
    
    while (attempts < MAX_RETRIES && !success) {
      attempts++;
      const { error } = await client
        .from(tableName)
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Error inserting batch ${batchNumber} into ${tableName} (attempt ${attempts}):`, error.message);
        if (attempts < MAX_RETRIES) {
          console.log(`   Retrying batch ${batchNumber} in ${RETRY_DELAY_MS}ms...`);
          await delay(RETRY_DELAY_MS);
        } else {
          errors.push({ batch: batchNumber, error: error.message });
          failed += batch.length;
        }
      } else {
        inserted += batch.length;
        console.log(`   Inserted ${inserted}/${data.length} records (batch ${batchNumber})...`);
        success = true;
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ Inserted ${inserted} records into ${tableName} in ${duration}s`);
  if (failed > 0) {
    console.log(`⚠️  Failed to insert ${failed} records`);
    errors.forEach(({ batch, error }) => {
      console.log(`   - Batch ${batch}: ${error}`);
    });
  }

  return { success: failed === 0, count: inserted, errors };
}

// Migrate a single table
async function migrateTable(sourceClient, targetClient, tableName) {
  console.log(`\n🔄 Migrating table: ${tableName}`);
  console.log('─'.repeat(50));
  const startTime = Date.now();

  try {
    // Fetch data from source
    const data = await fetchAllData(sourceClient, tableName);

    // Insert data into target
    const result = await insertData(targetClient, tableName, data);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  Total time for ${tableName}: ${duration}s`);

    return {
      table: tableName,
      success: result.success,
      count: result.count,
      duration: parseFloat(duration),
      errors: result.errors || []
    };
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`❌ Failed to migrate ${tableName}:`, error.message);
    return {
      table: tableName,
      success: false,
      count: 0,
      duration: parseFloat(duration),
      error: error.message
    };
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting database migration...\n');
  console.log('Source:', process.env.SOURCE_SUPABASE_URL);
  console.log('Target:', process.env.TARGET_SUPABASE_URL);
  console.log('');
  
  const migrationStartTime = Date.now();
  const { sourceClient, targetClient } = initClients();
  const results = [];

  // Migrate each table
  for (const tableName of TABLES_TO_MIGRATE) {
    const result = await migrateTable(sourceClient, targetClient, tableName);
    results.push(result);
  }

  const totalDuration = ((Date.now() - migrationStartTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));

  let totalRecords = 0;
  let successfulTables = 0;
  let failedTables = 0;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.table}: ${result.count} records (${result.duration}s)`);
    
    if (result.success) {
      successfulTables++;
      totalRecords += result.count;
    } else {
      failedTables++;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.errors && result.errors.length > 0) {
        console.log(`   Failed batches: ${result.errors.length}`);
      }
    }
  });

  console.log('─'.repeat(50));
  console.log(`Total records migrated: ${totalRecords}`);
  console.log(`Successful tables: ${successfulTables}/${results.length}`);
  console.log(`Failed tables: ${failedTables}/${results.length}`);
  console.log(`Total migration time: ${totalDuration}s`);
  console.log('='.repeat(50));

  if (failedTables > 0) {
    console.log('\n⚠️  Some tables failed to migrate. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 Migration completed successfully!');
  }
}

// Run migration
(async () => {
  try {
    validateEnv();
    await migrate();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();
