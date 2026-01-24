// migrate-via-famous-api.js
// Migration using Famous-AI Edge Functions
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');

// Famous-AI Configuration
const FAMOUS_AI_BASE_URL = 'https://xlbdtzmkncxycaddevnn.databasepad.com';
const FAMOUS_AI_TOKEN = process.env.FAMOUS_AI_TOKEN || 'fd6b6ddc-e56a-441f-9b24-abca65e9eb37';

// You'll need the anon key from Famous-AI at minimum
const FAMOUS_AI_ANON_KEY = process.env.FAMOUS_AI_ANON_KEY;

// Destination: Vercel Supabase - credentials from environment
const DEST_URL = process.env.SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
const DEST_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!DEST_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

if (!FAMOUS_AI_ANON_KEY) {
  console.error('❌ Error: FAMOUS_AI_ANON_KEY not set');
  console.error('');
  console.error('You need at least the anon (public) key from Famous-AI.');
  console.error('This should be visible in your Famous-AI project settings.');
  console.error('');
  console.error('Set it with:');
  console.error('export FAMOUS_AI_ANON_KEY="your-anon-key"');
  console.error('');
  console.error('The anon key is a JWT token starting with: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

const destDB = createClient(DEST_URL, DEST_KEY);

// Try to use Supabase client directly with anon key
const sourceDB = createClient(FAMOUS_AI_BASE_URL, FAMOUS_AI_ANON_KEY);

const TABLES = [
  'users', 'profiles', 'admin_roles', 'admin_users', 'wallets',
  'loyalty_tiers', 'loyalty_points', 'payment_methods',
  'railway_bookings', 'bookings', 'passenger_info',
  'transactions', 'user_transactions', 'points_transactions',
  'train_positions', 'support_tickets', 'support_requests',
  'favorite_routes', 'favorite_posts'
];

async function migrateTable(tableName) {
  console.log(`\n📦 ${tableName}...`);
  
  try {
    // Try to fetch using anon key (read-only access)
    const { data: sourceData, error: fetchError } = await sourceDB
      .from(tableName)
      .select('*');
    
    if (fetchError) {
      console.log(`  ⚠️  Access denied or table doesn't exist: ${fetchError.message}`);
      return { success: false, count: 0, error: fetchError.message };
    }
    
    if (!sourceData || sourceData.length === 0) {
      console.log(`  ⚠️  No data`);
      return { success: true, count: 0 };
    }
    
    console.log(`  📊 Found ${sourceData.length} records`);
    
    // Insert to destination
    const BATCH_SIZE = 100;
    let inserted = 0;
    
    for (let i = 0; i < sourceData.length; i += BATCH_SIZE) {
      const batch = sourceData.slice(i, i + BATCH_SIZE);
      const { error } = await destDB.from(tableName).insert(batch);
      
      if (!error) {
        inserted += batch.length;
        console.log(`  ✅ ${inserted}/${sourceData.length}`);
      } else {
        console.log(`  ⚠️  ${error.message}`);
      }
      
      await new Promise(r => setTimeout(r, 100));
    }
    
    return { success: true, count: inserted };
  } catch (error) {
    console.error(`  ❌ ${error.message}`);
    return { success: false, count: 0, error: error.message };
  }
}

async function main() {
  console.log('==========================================');
  console.log('🚀 Famous-AI → Vercel Migration');
  console.log('==========================================');
  console.log(`Source: ${FAMOUS_AI_BASE_URL}`);
  console.log(`Dest:   ${DEST_URL}`);
  console.log('==========================================');
  console.log('');
  console.log('⚠️  Note: Using anon key (public access only)');
  console.log('   Some tables may be restricted by RLS policies');
  console.log('');
  
  const results = [];
  
  for (const table of TABLES) {
    const result = await migrateTable(table);
    results.push({ table, ...result });
    
    // Small delay between tables
    await new Promise(r => setTimeout(r, 200));
  }
  
  console.log('\n==========================================');
  console.log('📊 Migration Summary');
  console.log('==========================================\n');
  
  const successful = results.filter(r => r.success && r.count > 0);
  const empty = results.filter(r => r.success && r.count === 0);
  const failed = results.filter(r => !r.success);
  const total = results.reduce((sum, r) => sum + r.count, 0);
  
  console.log(`✅ Migrated: ${successful.length} tables`);
  console.log(`📈 Records: ${total}`);
  console.log(`⚠️  Empty: ${empty.length} tables`);
  console.log(`❌ Failed: ${failed.length} tables\n`);
  
  console.log('Details:');
  console.log('─────────────────────────────────────────');
  results.forEach(({ table, success, count, error }) => {
    if (success && count > 0) {
      console.log(`✅ ${table}: ${count} records`);
    } else if (success && count === 0) {
      console.log(`⚠️  ${table}: No data`);
    } else {
      console.log(`❌ ${table}: ${error}`);
    }
  });
  
  console.log('\n');
  if (failed.length > 0) {
    console.log('⚠️  Some tables failed - likely due to RLS policies');
    console.log('   To migrate these, you need the service_role key');
  }
  
  console.log('\n✅ Migration complete!');
}

main().catch(console.error);
