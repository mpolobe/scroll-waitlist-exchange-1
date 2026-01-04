import { createClient } from '@supabase/supabase-js';import { createClient } from '@supabase/supabase-js';











































































































































































































main().catch(console.error);// Run migration}  console.log('\n✅ Migration complete!');    await verifyMigration();  // Verify    });    console.log(`${status} ${table.padEnd(25)} ${info}`);      : `Error: ${error}`;      ? `${migratedCount}/${sourceCount} records`     const info = success     const status = success ? '✅' : '❌';  results.forEach(({ table, success, sourceCount, migratedCount, error }) => {  console.log('─────────────────────────────────────────');  console.log('Detailed Results:');    console.log(`❌ Failed tables: ${TABLES.length - successful.length}\n`);  console.log(`📈 Total records migrated: ${totalRecords}`);  console.log(`✅ Successful tables: ${successful.length}/${TABLES.length}`);    const totalRecords = results.reduce((sum, r) => sum + r.migratedCount, 0);  const successful = results.filter(r => r.success);    console.log('========================================\n');  console.log('📊 Migration Summary');  console.log('\n========================================');    }    results.push(result);    const result = await migrateTable(table);  for (const table of orderedTables) {    ];    'favorite_posts'    'favorite_routes',    'support_requests',    'support_tickets',    'train_positions',    'points_transactions',    'user_transactions',    'transactions',    'passenger_info',    'bookings',    'railway_bookings',    'payment_methods',    'loyalty_points',    'loyalty_tiers',    'wallets',    'admin_users',    'admin_roles',    'profiles',    'users',  const orderedTables = [  // Migrate tables in dependency order (parents before children)    const results: MigrationResult[] = [];    console.log('========================================\n');  console.log(`Destination: ${DEST_URL}`);  console.log(`Source: ${SOURCE_URL}`);  console.log('========================================');  console.log('🚀 Supabase to Supabase Migration');  console.log('========================================');async function main() {}  }    console.log(`${status} ${table}: Source=${sourceCount}, Dest=${destCount}`);    const status = sourceCount === destCount ? '✅' : '⚠️';          .select('*', { count: 'exact', head: true });      .from(table)    const { count: destCount } = await destDB          .select('*', { count: 'exact', head: true });      .from(table)    const { count: sourceCount } = await sourceDB  for (const table of TABLES) {    console.log('========================================\n');  console.log('🔍 Verifying Migration');  console.log('\n========================================');async function verifyMigration() {}  }    };      error: error.message      migratedCount: 0,      sourceCount: 0,      success: false,      table: tableName,    return {    console.error(`  ❌ Error: ${error.message}`);  } catch (error: any) {        };      error: errors.length > 0 ? errors.join('; ') : undefined      migratedCount: totalInserted,      sourceCount,      success: totalInserted > 0,      table: tableName,    return {        console.log(`  🎉 Migrated ${totalInserted}/${sourceCount} records`);        }      await new Promise(resolve => setTimeout(resolve, 100));      // Small delay to avoid rate limiting            }        console.log(`  ✅ Progress: ${totalInserted}/${sourceCount}`);        totalInserted += inserted?.length || 0;      } else {        console.log(`  ⚠️  Batch error: ${insertError.message}`);        errors.push(`Batch ${i}-${i + batch.length}: ${insertError.message}`);      if (insertError) {              .select();        .insert(batch)        .from(tableName)      const { data: inserted, error: insertError } = await destDB            const batch = sourceData.slice(i, i + BATCH_SIZE);    for (let i = 0; i < sourceData.length; i += BATCH_SIZE) {        const errors: string[] = [];    let totalInserted = 0;    const BATCH_SIZE = 100;    // Insert into destination in batches        console.log(`  📊 Found ${sourceCount} records`);        }      };        migratedCount: 0        sourceCount: 0,        success: true,        table: tableName,      return {      console.log(`  ⚠️  No data found in ${tableName}`);    if (!sourceData || sourceCount === 0) {        const sourceCount = sourceData?.length || 0;        }      throw new Error(`Fetch error: ${fetchError.message}`);    if (fetchError) {          .select('*');      .from(tableName)    const { data: sourceData, error: fetchError } = await sourceDB    // Fetch all data from source  try {    console.log(`\n📦 Migrating ${tableName}...`);async function migrateTable(tableName: string): Promise<MigrationResult> {}  error?: string;  migratedCount: number;  sourceCount: number;  success: boolean;  table: string;interface MigrationResult {];  'wallets'  'users',  'user_transactions',  'transactions',  'train_positions',  'support_tickets',  'support_requests',  'railway_bookings',  'profiles',  'points_transactions',  'payment_methods',  'passenger_info',  'loyalty_tiers',  'loyalty_points',  'favorite_routes',  'favorite_posts',  'bookings',  'admin_users',  'admin_roles',const TABLES = [const destDB = createClient(DEST_URL, DEST_KEY);const sourceDB = createClient(SOURCE_URL, SOURCE_KEY);const DEST_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for write accessconst DEST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;// Destination: Your Vercel Supabaseconst SOURCE_KEY = process.env.FAMOUS_AI_SUPABASE_KEY!; // Get from Famous-AI settingsconst SOURCE_URL = 'https://xlbdtzmkncxycaddevnn.databasepad.com';// Source: Famous-AI Supabase
// Source: Famous-AI Supabase
const SOURCE_URL = 'https://xlbdtzmkncxycaddevnn.databasepad.com';
const SOURCE_KEY = process.env.FAMOUS_AI_SUPABASE_KEY!; // Get from Famous-AI settings

// Destination: Your Vercel Supabase
const DEST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const DEST_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for write access

const sourceDB = createClient(SOURCE_URL, SOURCE_KEY);
const destDB = createClient(DEST_URL, DEST_KEY);

const TABLES = [
  'admin_roles',
  'admin_users',
  'bookings',
  'favorite_posts',
  'favorite_routes',
  'loyalty_points',
  'loyalty_tiers',
  'passenger_info',
  'payment_methods',
  'points_transactions',
  'profiles',
  'railway_bookings',
  'support_requests',
  'support_tickets',
  'train_positions',
  'transactions',
  'user_transactions',
  'users',
  'wallets'
];

interface MigrationResult {
  table: string;
  success: boolean;
  sourceCount: number;
  migratedCount: number;
  error?: string;
}

async function migrateTable(tableName: string): Promise<MigrationResult> {
  console.log(`\n📦 Migrating ${tableName}...`);
  
  try {
    // Fetch all data from source
    const { data: sourceData, error: fetchError } = await sourceDB
      .from(tableName)
      .select('*');
    
    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }
    
    const sourceCount = sourceData?.length || 0;
    
    if (!sourceData || sourceCount === 0) {
      console.log(`  ⚠️  No data found in ${tableName}`);
      return {
        table: tableName,
        success: true,
        sourceCount: 0,
        migratedCount: 0
      };
    }
    
    console.log(`  📊 Found ${sourceCount} records`);
    
    // Insert into destination in batches
    const BATCH_SIZE = 100;
    let totalInserted = 0;
    const errors: string[] = [];
    
    for (let i = 0; i < sourceData.length; i += BATCH_SIZE) {
      const batch = sourceData.slice(i, i + BATCH_SIZE);
      
      const { data: inserted, error: insertError } = await destDB
        .from(tableName)
        .insert(batch)
        .select();
      
      if (insertError) {
        errors.push(`Batch ${i}-${i + batch.length}: ${insertError.message}`);
        console.log(`  ⚠️  Batch error: ${insertError.message}`);
      } else {
        totalInserted += inserted?.length || 0;
        console.log(`  ✅ Progress: ${totalInserted}/${sourceCount}`);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`  🎉 Migrated ${totalInserted}/${sourceCount} records`);
    
    return {
      table: tableName,
      success: totalInserted > 0,
      sourceCount,
      migratedCount: totalInserted,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
    
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}`);
    return {
      table: tableName,
      success: false,
      sourceCount: 0,
      migratedCount: 0,
      error: error.message
    };
  }
}

async function verifyMigration() {
  console.log('\n========================================');
  console.log('🔍 Verifying Migration');
  console.log('========================================\n');
  
  for (const table of TABLES) {
    const { count: sourceCount } = await sourceDB
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    const { count: destCount } = await destDB
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    const status = sourceCount === destCount ? '✅' : '⚠️';
    console.log(`${status} ${table}: Source=${sourceCount}, Dest=${destCount}`);
  }
}

async function main() {
  console.log('========================================');
  console.log('🚀 Supabase to Supabase Migration');
  console.log('========================================');
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Destination: ${DEST_URL}`);
  console.log('========================================\n');
  
  const results: MigrationResult[] = [];
  
  // Migrate tables in dependency order (parents before children)
  const orderedTables = [
    'users',
    'profiles',
    'admin_roles',
    'admin_users',
    'wallets',
    'loyalty_tiers',
    'loyalty_points',
    'payment_methods',
    'railway_bookings',
    'bookings',
    'passenger_info',
    'transactions',
    'user_transactions',
    'points_transactions',
    'train_positions',
    'support_tickets',
    'support_requests',
    'favorite_routes',
    'favorite_posts'
  ];
  
  for (const table of orderedTables) {
    const result = await migrateTable(table);
    results.push(result);
  }
  
  console.log('\n========================================');
  console.log('📊 Migration Summary');
  console.log('========================================\n');
  
  const successful = results.filter(r => r.success);
  const totalRecords = results.reduce((sum, r) => sum + r.migratedCount, 0);
  
  console.log(`✅ Successful tables: ${successful.length}/${TABLES.length}`);
  console.log(`📈 Total records migrated: ${totalRecords}`);
  console.log(`❌ Failed tables: ${TABLES.length - successful.length}\n`);
  
  console.log('Detailed Results:');
  console.log('─────────────────────────────────────────');
  results.forEach(({ table, success, sourceCount, migratedCount, error }) => {
    const status = success ? '✅' : '❌';
    const info = success 
      ? `${migratedCount}/${sourceCount} records` 
      : `Error: ${error}`;
    console.log(`${status} ${table.padEnd(25)} ${info}`);
  });
  
  // Verify
  await verifyMigration();
  
  console.log('\n✅ Migration complete!');
}

// Run migration
main().catch(console.error);
