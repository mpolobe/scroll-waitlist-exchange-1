#!/bin/bash
# setup-migration.sh

echo "Setting up migration..."
echo ""

# Create migration directory
mkdir -p scripts

# Save the migration script
cat > scripts/migrate-db.js << 'SCRIPT'
// migrate-db.js
const { createClient } = require('@supabase/supabase-js');

// Source: Famous-AI Supabase
const SOURCE_URL = 'https://xlbdtzmkncxycaddevnn.databasepad.com';
const SOURCE_KEY = process.env.FAMOUS_AI_SUPABASE_KEY;

// Destination: Vercel Supabase  
const DEST_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
const DEST_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SOURCE_KEY || !DEST_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   Set: FAMOUS_AI_SUPABASE_KEY and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const sourceDB = createClient(SOURCE_URL, SOURCE_KEY);
const destDB = createClient(DEST_URL, DEST_KEY);

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
    // Fetch from source
    const { data: sourceData, error: fetchError } = await sourceDB
      .from(tableName)
      .select('*');
    
    if (fetchError) throw fetchError;
    
    if (!sourceData || sourceData.length === 0) {
      console.log(`  ⚠️  No data`);
      return { success: true, count: 0 };
    }
    
    console.log(`  📊 ${sourceData.length} records`);
    
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
  console.log('🚀 Database Migration Starting');
  console.log('==========================================');
  console.log(`Source: ${SOURCE_URL}`);
  console.log(`Dest:   ${DEST_URL}`);
  console.log('==========================================\n');
  
  const results = [];
  
  for (const table of TABLES) {
    const result = await migrateTable(table);
    results.push({ table, ...result });
  }
  
  console.log('\n==========================================');
  console.log('📊 Summary');
  console.log('==========================================\n');
  
  const successful = results.filter(r => r.success);
  const total = results.reduce((sum, r) => sum + r.count, 0);
  
  console.log(`✅ Success: ${successful.length}/${TABLES.length} tables`);
  console.log(`📈 Records: ${total}`);
  console.log(`❌ Failed: ${TABLES.length - successful.length}\n`);
  
  results.forEach(({ table, success, count, error }) => {
    const icon = success ? '✅' : '❌';
    const info = success ? `${count} records` : error;
    console.log(`${icon} ${table}: ${info}`);
  });
  
  console.log('\n✅ Done!');
}

main().catch(console.error);
SCRIPT

# Make executable
chmod +x scripts/migrate-db.js

echo "✅ Migration script created at scripts/migrate-db.js"
echo ""
echo "To run migration:"
echo ""
echo "1. Get Famous-AI service role key from project settings"
echo "2. Set environment variables:"
echo "   export FAMOUS_AI_SUPABASE_KEY='your-famous-ai-key'"
echo "   export SUPABASE_SERVICE_ROLE_KEY='your-vercel-supabase-key'"
echo ""
echo "3. Run migration:"
echo "   node scripts/migrate-db.js"
