// check-database.js
// Check what data exists in your Vercel Supabase database
import { createClient } from '@supabase/supabase-js';

// Your Vercel Supabase
const SUPABASE_URL = 'https://llvprbmrnjvamjzavmhg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnByYm1ybmp2YW1qemF2bWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0NDU1MiwiZXhwIjoyMDgxMzIwNTUyfQ.yfdj690DOhgtlLXENe8nd5y22IFq5N1gtNZ2vnpHcKI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLES = [
  'users', 'profiles', 'admin_roles', 'admin_users', 'wallets',
  'loyalty_tiers', 'loyalty_points', 'payment_methods',
  'railway_bookings', 'bookings', 'passenger_info',
  'transactions', 'user_transactions', 'points_transactions',
  'train_positions', 'support_tickets', 'support_requests',
  'favorite_routes', 'favorite_posts',
  'routes', 'bonds', 'blog_posts'
];

async function checkTable(tableName) {
  try {
    // Get count
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      return { table: tableName, count: null, sample: null, error: countError.message };
    }
    
    // Get a sample record if data exists
    let sample = null;
    if (count > 0) {
      const { data: sampleData } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      sample = sampleData?.[0];
    }
    
    return { table: tableName, count: count || 0, sample, error: null };
  } catch (error) {
    return { table: tableName, count: null, sample: null, error: error.message };
  }
}

async function main() {
  console.log('==========================================');
  console.log('🔍 Checking Vercel Supabase Database');
  console.log('==========================================');
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('==========================================\n');
  
  console.log('Checking tables...\n');
  
  const results = [];
  let totalRecords = 0;
  let tablesWithData = 0;
  
  for (const table of TABLES) {
    const result = await checkTable(table);
    results.push(result);
    
    if (result.count > 0) {
      tablesWithData++;
      totalRecords += result.count;
    }
  }
  
  console.log('==========================================');
  console.log('📊 Database Status');
  console.log('==========================================\n');
  
  console.log('Table Overview:');
  console.log('─────────────────────────────────────────');
  
  results.forEach(({ table, count, error, sample }) => {
    if (error) {
      console.log(`❓ ${table.padEnd(25)} Error: ${error}`);
    } else if (count === 0) {
      console.log(`⚪ ${table.padEnd(25)} Empty (0 records)`);
    } else {
      console.log(`✅ ${table.padEnd(25)} ${count} records`);
      if (sample && count > 0) {
        const sampleKeys = Object.keys(sample).slice(0, 3);
        console.log(`   Sample fields: ${sampleKeys.join(', ')}...`);
      }
    }
  });
  
  console.log('\n==========================================');
  console.log('Summary:');
  console.log('─────────────────────────────────────────');
  console.log(`📈 Total tables: ${TABLES.length}`);
  console.log(`✅ Tables with data: ${tablesWithData}`);
  console.log(`⚪ Empty tables: ${TABLES.length - tablesWithData}`);
  console.log(`📊 Total records: ${totalRecords}`);
  console.log('==========================================\n');
  
  if (totalRecords > 0) {
    console.log('✅ Your Vercel Supabase database already contains data!');
    console.log('   This data might be from previous deployments.');
    console.log('\nTables with data:');
    results
      .filter(r => r.count > 0)
      .forEach(r => console.log(`   • ${r.table}: ${r.count} records`));
    console.log('\n💡 Tip: Review this data to see if it\'s from previous builds.');
  } else {
    console.log('⚠️  Your Vercel Supabase database is empty.');
    console.log('   You can start fresh or migrate data from Famous-AI.');
  }
  
  console.log('\n');
}

main().catch(console.error);
