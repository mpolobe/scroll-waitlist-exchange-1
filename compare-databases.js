// compare-databases.js
// Compare data between Famous-AI and Vercel Supabase
const { createClient } = require('@supabase/supabase-js');

// Famous-AI Supabase (if you get the key)
const FAMOUS_URL = 'https://xlbdtzmkncxycaddevnn.databasepad.com';
const FAMOUS_KEY = process.env.FAMOUS_AI_SUPABASE_KEY;

// Vercel Supabase - credentials from environment
const VERCEL_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const VERCEL_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!VERCEL_URL || !VERCEL_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const vercelDB = createClient(VERCEL_URL, VERCEL_KEY);
const famousDB = FAMOUS_KEY ? createClient(FAMOUS_URL, FAMOUS_KEY) : null;

const TABLES = [
  'users', 'profiles', 'admin_roles', 'admin_users', 'wallets',
  'loyalty_tiers', 'loyalty_points', 'payment_methods',
  'railway_bookings', 'bookings', 'passenger_info',
  'transactions', 'user_transactions', 'points_transactions',
  'train_positions', 'support_tickets', 'support_requests',
  'favorite_routes', 'favorite_posts'
];

async function compareTable(tableName) {
  const result = {
    table: tableName,
    vercel: { exists: false, count: 0, sample: null },
    famous: { exists: false, count: 0, sample: null }
  };
  
  // Check Vercel
  try {
    const { count, error } = await vercelDB
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (!error) {
      result.vercel.exists = true;
      result.vercel.count = count || 0;
      
      if (count > 0) {
        const { data } = await vercelDB.from(tableName).select('*').limit(1);
        result.vercel.sample = data?.[0];
      }
    }
  } catch (e) {
    // Table doesn't exist in Vercel
  }
  
  // Check Famous-AI (if key provided)
  if (famousDB) {
    try {
      const { count, error } = await famousDB
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        result.famous.exists = true;
        result.famous.count = count || 0;
        
        if (count > 0) {
          const { data } = await famousDB.from(tableName).select('*').limit(1);
          result.famous.sample = data?.[0];
        }
      }
    } catch (e) {
      // Table doesn't exist in Famous-AI
    }
  }
  
  return result;
}

async function main() {
  console.log('==========================================');
  console.log('🔄 Database Comparison');
  console.log('==========================================');
  console.log(`Vercel:    ${VERCEL_URL}`);
  console.log(`Famous-AI: ${FAMOUS_URL}`);
  console.log('==========================================\n');
  
  if (!FAMOUS_KEY) {
    console.log('⚠️  FAMOUS_AI_SUPABASE_KEY not set');
    console.log('   Showing Vercel data only\n');
    console.log('To compare with Famous-AI, run:');
    console.log('export FAMOUS_AI_SUPABASE_KEY="your-key"');
    console.log('node compare-databases.js\n');
    console.log('─────────────────────────────────────────\n');
  }
  
  const results = [];
  
  for (const table of TABLES) {
    const result = await compareTable(table);
    results.push(result);
  }
  
  console.log('📊 Table Comparison:\n');
  console.log('─────────────────────────────────────────');
  console.log('Table                      Vercel    Famous-AI');
  console.log('─────────────────────────────────────────');
  
  results.forEach(({ table, vercel, famous }) => {
    const vStatus = vercel.exists ? `✅ ${vercel.count} rec` : '❌ missing';
    const fStatus = famousDB 
      ? (famous.exists ? `✅ ${famous.count} rec` : '❌ missing')
      : '⚠️  no key';
    
    console.log(`${table.padEnd(25)}  ${vStatus.padEnd(12)} ${fStatus}`);
  });
  
  console.log('\n==========================================');
  console.log('📈 Summary');
  console.log('==========================================\n');
  
  const vercelTables = results.filter(r => r.vercel.exists);
  const vercelWithData = results.filter(r => r.vercel.count > 0);
  const vercelTotal = results.reduce((sum, r) => sum + r.vercel.count, 0);
  
  console.log('🔵 Vercel Supabase:');
  console.log(`   Tables: ${vercelTables.length}/${TABLES.length}`);
  console.log(`   With data: ${vercelWithData.length}`);
  console.log(`   Total records: ${vercelTotal}\n`);
  
  if (famousDB) {
    const famousTables = results.filter(r => r.famous.exists);
    const famousWithData = results.filter(r => r.famous.count > 0);
    const famousTotal = results.reduce((sum, r) => sum + r.famous.count, 0);
    
    console.log('🟣 Famous-AI Supabase:');
    console.log(`   Tables: ${famousTables.length}/${TABLES.length}`);
    console.log(`   With data: ${famousWithData.length}`);
    console.log(`   Total records: ${famousTotal}\n`);
    
    // Show tables that exist in one but not the other
    const onlyVercel = results.filter(r => r.vercel.exists && !r.famous.exists);
    const onlyFamous = results.filter(r => !r.vercel.exists && r.famous.exists);
    
    if (onlyVercel.length > 0) {
      console.log('📌 Tables only in Vercel:');
      onlyVercel.forEach(r => console.log(`   • ${r.table}`));
      console.log('');
    }
    
    if (onlyFamous.length > 0) {
      console.log('📌 Tables only in Famous-AI:');
      onlyFamous.forEach(r => console.log(`   • ${r.table}`));
      console.log('');
    }
    
    // Show data conflicts
    const conflicts = results.filter(r => 
      r.vercel.count > 0 && r.famous.count > 0 && r.vercel.count !== r.famous.count
    );
    
    if (conflicts.length > 0) {
      console.log('⚠️  Tables with different record counts:');
      conflicts.forEach(r => {
        console.log(`   • ${r.table}: Vercel=${r.vercel.count}, Famous=${r.famous.count}`);
      });
      console.log('');
    }
  }
  
  console.log('💡 Recommendation:');
  if (vercelTotal > 0 && famousDB) {
    console.log('   Your Vercel database already has data from previous builds.');
    console.log('   You can either:');
    console.log('   1. Keep using Vercel data (no migration needed)');
    console.log('   2. Migrate from Famous-AI (will add/overwrite data)');
    console.log('   3. Clear Vercel and migrate fresh from Famous-AI');
  } else if (vercelTotal > 0) {
    console.log('   Your Vercel database has data - ready to use!');
    console.log('   Your app should be connecting to this database.');
  } else {
    console.log('   Vercel database is empty - ready for fresh data');
    console.log('   You can migrate from Famous-AI or start fresh.');
  }
  
  console.log('\n');
}

main().catch(console.error);
