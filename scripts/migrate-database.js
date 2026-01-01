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
 *   TARGET_SUPABASE_URL - Vercel deployment Supabase URL (https://llvprbmrnjvamjzavmhg.supabase.co)
 *   TARGET_SUPABASE_KEY - Vercel deployment Supabase service role key
 * 
 * Famous.AI Configuration:
 *   Edge Configuration Name: Famous-AI
 *   Token: fd6b6ddc-e56a-441f-9b24-abca65e9eb37
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
  const sourceClient = createClient(
    process.env.SOURCE_SUPABASE_URL,
    process.env.SOURCE_SUPABASE_KEY
  );

  const targetClient = createClient(
    process.env.TARGET_SUPABASE_URL,
    process.env.TARGET_SUPABASE_KEY
  );

  return { sourceClient, targetClient };
}

// Validate database connections
async function validateConnections(sourceClient, targetClient) {
  console.log('🔍 Validating database connections...\n');
  
  // Test source connection
  console.log('Testing source database connection...');
  try {
    const { error: sourceError } = await sourceClient.from('profiles').select('count', { count: 'exact', head: true });
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
    const { error: targetError } = await targetClient.from('profiles').select('count', { count: 'exact', head: true });
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
  console.log(`📥 Fetching data from ${tableName}...`);
  
  let allData = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await client
      .from(tableName)
      .select('*')
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      console.error(`❌ Error fetching from ${tableName}:`, error.message);
      throw error;
    }

    if (data && data.length > 0) {
      allData = allData.concat(data);
      from += BATCH_SIZE;
      console.log(`   Fetched ${allData.length} records...`);
    }

    hasMore = data && data.length === BATCH_SIZE;
  }

  console.log(`✅ Fetched ${allData.length} total records from ${tableName}`);
  return allData;
}

// Insert data into target table with batching
async function insertData(client, tableName, data) {
  if (!data || data.length === 0) {
    console.log(`⚠️  No data to insert into ${tableName}`);
    return { success: true, count: 0 };
  }

  console.log(`📤 Inserting ${data.length} records into ${tableName}...`);
  
  let inserted = 0;
  let failed = 0;

  // Process in batches
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    
    const { error } = await client
      .from(tableName)
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Error inserting batch into ${tableName}:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`   Inserted ${inserted}/${data.length} records...`);
    }
  }

  console.log(`✅ Inserted ${inserted} records into ${tableName}`);
  if (failed > 0) {
    console.log(`⚠️  Failed to insert ${failed} records`);
  }

  return { success: failed === 0, count: inserted };
}

// Migrate a single table
async function migrateTable(sourceClient, targetClient, tableName) {
  console.log(`\n🔄 Migrating table: ${tableName}`);
  console.log('─'.repeat(50));

  try {
    // Fetch data from source
    const data = await fetchAllData(sourceClient, tableName);

    // Insert data into target
    const result = await insertData(targetClient, tableName, data);

    return {
      table: tableName,
      success: result.success,
      count: result.count
    };
  } catch (error) {
    console.error(`❌ Failed to migrate ${tableName}:`, error.message);
    return {
      table: tableName,
      success: false,
      count: 0,
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

  const { sourceClient, targetClient } = initClients();
  
  // Validate connections before proceeding
  const connectionsValid = await validateConnections(sourceClient, targetClient);
  if (!connectionsValid) {
    console.error('\n❌ Database connection validation failed. Aborting migration.');
    process.exit(1);
  }

  const results = [];

  // Migrate each table
  for (const tableName of TABLES_TO_MIGRATE) {
    const result = await migrateTable(sourceClient, targetClient, tableName);
    results.push(result);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Migration Summary');
  console.log('='.repeat(50));

  let totalRecords = 0;
  let successfulTables = 0;
  let failedTables = 0;

  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.table}: ${result.count} records`);
    
    if (result.success) {
      successfulTables++;
      totalRecords += result.count;
    } else {
      failedTables++;
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  });

  console.log('─'.repeat(50));
  console.log(`Total records migrated: ${totalRecords}`);
  console.log(`Successful tables: ${successfulTables}/${results.length}`);
  console.log(`Failed tables: ${failedTables}/${results.length}`);
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
