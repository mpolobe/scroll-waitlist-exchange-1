// inspect-schema.js
// Inspect the actual database schema and existing data
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'users', 'profiles', 'admin_roles', 'admin_users', 'wallets',
  'loyalty_tiers', 'loyalty_points', 'payment_methods',
  'railway_bookings', 'bookings', 'passenger_info',
  'transactions', 'user_transactions', 'points_transactions',
  'train_positions', 'support_tickets', 'support_requests',
  'favorite_routes', 'favorite_posts'
];

async function inspectTable(tableName) {
  try {
    // Get count
    const { count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (count === null) {
      return { table: tableName, exists: false };
    }
    
    // Get sample record to see structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return { table: tableName, exists: false, error: error.message };
    }
    
    const columns = data && data[0] ? Object.keys(data[0]) : [];
    
    return {
      table: tableName,
      exists: true,
      count: count || 0,
      columns: columns,
      sample: data?.[0]
    };
  } catch (error) {
    return { table: tableName, exists: false, error: error.message };
  }
}

async function main() {
  console.log('==========================================');
  console.log('🔍 Database Schema Inspection');
  console.log('==========================================');
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('==========================================\n');
  
  const results = [];
  
  for (const table of TABLES) {
    const result = await inspectTable(table);
    results.push(result);
  }
  
  console.log('📊 Tables Found:\n');
  console.log('─────────────────────────────────────────');
  
  const existingTables = results.filter(r => r.exists);
  const missingTables = results.filter(r => !r.exists);
  
  existingTables.forEach(({ table, count, columns }) => {
    console.log(`\n✅ ${table.toUpperCase()}`);
    console.log(`   Records: ${count}`);
    console.log(`   Columns: ${columns.join(', ')}`);
  });
  
  if (missingTables.length > 0) {
    console.log('\n\n❌ Missing Tables:\n');
    missingTables.forEach(({ table }) => {
      console.log(`   • ${table}`);
    });
  }
  
  console.log('\n\n==========================================');
  console.log('📋 Detailed Data Samples');
  console.log('==========================================\n');
  
  existingTables
    .filter(r => r.count > 0)
    .forEach(({ table, sample }) => {
      console.log(`\n📌 ${table.toUpperCase()} (Sample Record):`);
      console.log('─────────────────────────────────────────');
      Object.entries(sample).forEach(([key, value]) => {
        const displayValue = value === null ? 'NULL' : 
                           typeof value === 'object' ? JSON.stringify(value) :
                           String(value).substring(0, 50);
        console.log(`   ${key.padEnd(20)}: ${displayValue}`);
      });
    });
  
  console.log('\n\n==========================================');
  console.log('📊 Summary');
  console.log('==========================================');
  console.log(`✅ Existing tables: ${existingTables.length}/${TABLES.length}`);
  console.log(`📈 Tables with data: ${existingTables.filter(r => r.count > 0).length}`);
  console.log(`⚪ Empty tables: ${existingTables.filter(r => r.count === 0).length}`);
  console.log(`❌ Missing tables: ${missingTables.length}`);
  
  const totalRecords = existingTables.reduce((sum, r) => sum + r.count, 0);
  console.log(`📊 Total records: ${totalRecords}`);
  
  console.log('\n💡 Analysis:');
  if (totalRecords > 0) {
    console.log('   ✅ Your database has existing data from previous deployments');
    console.log('   ✅ Schema is already set up');
    console.log('   ✅ No migration needed - you can use this data');
  } else if (existingTables.length === TABLES.length) {
    console.log('   ✅ All tables exist but are empty');
    console.log('   📝 Ready for fresh data or migration');
  } else {
    console.log('   ⚠️  Some tables are missing');
    console.log('   📝 Need to create missing tables');
  }
  
  console.log('\n');
}

main().catch(console.error);
