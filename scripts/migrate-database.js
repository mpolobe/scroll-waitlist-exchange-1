#!/usr/bin/env node

/**
 * Database Migration Script
 * Copies data from Famous.AI Supabase to Vercel deployment Supabase
 * 
 * Usage:
 *   node scripts/migrate-database.js
 * 
 * Environment Variables Required:
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

  return { sourceClient, targetClient };
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
  console.log('🚀 Starting database migration from Famous.AI to Vercel...\n');
  
  // Display migration information
  console.log('📋 Migration Details:');
  console.log('   Tables to migrate:', TABLES_TO_MIGRATE.length);
  console.log('   Batch size:', BATCH_SIZE);
  console.log('   Target:', process.env.TARGET_SUPABASE_URL);
  console.log('');

  // Safety prompt
  console.log('⚠️  SAFETY CHECK');
  console.log('═'.repeat(50));
  console.log('This will migrate data from Famous.AI to your Vercel database.');
  console.log('Existing data in the target database will be updated or preserved.');
  console.log('Tables:', TABLES_TO_MIGRATE.join(', '));
  console.log('═'.repeat(50));
  console.log('');

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

  rl.close();

  if (failedTables > 0) {
    console.log('\n⚠️  Some tables failed to migrate. Check the errors above.');
    process.exit(1);
  } else {
    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Update your .env file with new database credentials');
    console.log('   2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    console.log('   3. Deploy your application to Vercel');
  }
}

// Run migration
(async () => {
  try {
    await migrate();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    rl.close();
    process.exit(1);
  }
})();
