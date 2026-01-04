// test-connection.js
// Test database connection and verify tables exist
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnByYm1ybmp2YW1qemF2bWhnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0NDU1MiwiZXhwIjoyMDgxMzIwNTUyfQ.yfdj690DOhgtlLXENe8nd5y22IFq5N1gtNZ2vnpHcKI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const REQUIRED_TABLES = [
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

async function testConnection() {
  console.log('==========================================');
  console.log('🔌 Testing Supabase Connection');
  console.log('==========================================');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('==========================================\n');
  
  try {
    // Test basic connection
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('⚠️  Tables not created yet\n');
      console.log('To create tables:');
      console.log('1. Go to https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg');
      console.log('2. Click on "SQL Editor"');
      console.log('3. Copy contents from database-schema.sql');
      console.log('4. Paste and run the SQL');
      return false;
    } else if (error) {
      console.log(`❌ Connection error: ${error.message}\n`);
      return false;
    }
    
    console.log('✅ Connection successful!\n');
    return true;
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}\n`);
    return false;
  }
}

async function verifyTables() {
  console.log('==========================================');
  console.log('📋 Verifying Database Tables');
  console.log('==========================================\n');
  
  const results = {
    existing: [],
    missing: [],
    errors: []
  };
  
  for (const table of REQUIRED_TABLES) {
    try {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01') {
          results.missing.push(table);
          console.log(`❌ ${table.padEnd(25)} Missing`);
        } else {
          results.errors.push({ table, error: error.message });
          console.log(`⚠️  ${table.padEnd(25)} Error: ${error.message}`);
        }
      } else {
        results.existing.push(table);
        console.log(`✅ ${table.padEnd(25)} Exists`);
      }
    } catch (error) {
      results.errors.push({ table, error: error.message });
      console.log(`⚠️  ${table.padEnd(25)} Error: ${error.message}`);
    }
  }
  
  console.log('\n==========================================');
  console.log('📊 Summary');
  console.log('==========================================');
  console.log(`✅ Existing tables: ${results.existing.length}/${REQUIRED_TABLES.length}`);
  console.log(`❌ Missing tables: ${results.missing.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);
  console.log('==========================================\n');
  
  if (results.missing.length > 0) {
    console.log('⚠️  Missing tables detected!');
    console.log('Missing: ' + results.missing.join(', '));
    console.log('\nTo create missing tables:');
    console.log('1. Open: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/editor');
    console.log('2. Go to SQL Editor');
    console.log('3. Run the SQL from database-schema.sql');
  } else if (results.existing.length === REQUIRED_TABLES.length) {
    console.log('✅ All required tables exist!');
    console.log('✅ Database is ready to use!');
  }
  
  return results;
}

async function testEndpoints() {
  console.log('\n==========================================');
  console.log('🔗 Testing API Endpoints');
  console.log('==========================================\n');
  
  // Test basic CRUD operations
  const tests = [
    {
      name: 'Read users',
      test: async () => {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        return { success: !error, error };
      }
    },
    {
      name: 'Read bookings',
      test: async () => {
        const { data, error } = await supabase.from('bookings').select('*').limit(1);
        return { success: !error, error };
      }
    },
    {
      name: 'Read wallets',
      test: async () => {
        const { data, error } = await supabase.from('wallets').select('*').limit(1);
        return { success: !error, error };
      }
    }
  ];
  
  for (const { name, test } of tests) {
    try {
      const result = await test();
      if (result.success) {
        console.log(`✅ ${name.padEnd(30)} Working`);
      } else {
        console.log(`❌ ${name.padEnd(30)} Failed: ${result.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${name.padEnd(30)} Error: ${error.message}`);
    }
  }
  
  console.log('\n');
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await verifyTables();
    await testEndpoints();
    
    console.log('✅ Setup verification complete!\n');
    console.log('Next steps:');
    console.log('1. If tables are missing, run database-schema.sql in Supabase');
    console.log('2. Update your app environment variables');
    console.log('3. Start your application and test');
  } else {
    console.log('❌ Connection failed. Please check:');
    console.log('1. SUPABASE_URL is correct');
    console.log('2. SUPABASE_SERVICE_ROLE_KEY is valid');
    console.log('3. Network connection is working');
  }
}

main().catch(console.error);
