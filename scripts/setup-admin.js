#!/usr/bin/env node
/**
 * Setup Super Administrator Account
 * 
 * This script creates the admin@africarailways.com account and grants super_admin role.
 * 
 * Usage:
 *   node scripts/setup-admin.js
 * 
 * Required environment variables:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (NOT anon key)
 */

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@africarailways.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Required - set via environment variable
const ADMIN_FULL_NAME = 'Super Administrator';
const ADMIN_COUNTRY = 'Zambia';

if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD environment variable is required');
  console.log('\nUsage:');
  console.log('  ADMIN_PASSWORD=your_secure_password SUPABASE_SERVICE_ROLE_KEY=... node scripts/setup-admin.js');
  process.exit(1);
}

async function setupAdmin() {
  // Try to load from .env file
  try {
    require('dotenv').config();
  } catch (e) {
    // dotenv not available, use environment variables directly
  }

  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
    console.log('\nTo get your service role key:');
    console.log('1. Go to https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to Settings → API');
    console.log('4. Copy the "service_role" key (NOT the anon key)');
    console.log('\nThen run:');
    console.log('  SUPABASE_SERVICE_ROLE_KEY=your_key node scripts/setup-admin.js');
    process.exit(1);
  }

  console.log('🔧 Setting up Super Administrator account...\n');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Supabase: ${SUPABASE_URL}\n`);

  try {
    // Step 1: Create user via Admin API
    console.log('1️⃣ Creating user account...');
    
    const createUserResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_FULL_NAME,
          country: ADMIN_COUNTRY,
        },
      }),
    });

    const userData = await createUserResponse.json();
    
    if (!createUserResponse.ok) {
      if (userData.msg?.includes('already been registered') || userData.message?.includes('already exists')) {
        console.log('   ⚠️  User already exists, fetching existing user...');
        
        // Fetch existing user
        const listResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?filter=email.eq.${encodeURIComponent(ADMIN_EMAIL)}`, {
          headers: {
            'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            'apikey': SERVICE_ROLE_KEY,
          },
        });
        const listData = await listResponse.json();
        
        if (listData.users && listData.users.length > 0) {
          userData.id = listData.users[0].id;
          console.log(`   ✅ Found existing user: ${userData.id}`);
        } else {
          throw new Error('Could not find existing user');
        }
      } else {
        throw new Error(userData.msg || userData.message || 'Failed to create user');
      }
    } else {
      console.log(`   ✅ User created: ${userData.id}`);
    }

    const userId = userData.id;

    // Step 2: Create user record in users table
    console.log('2️⃣ Creating user record...');
    
    const userRecordResponse = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        id: userId,
        email: ADMIN_EMAIL,
        full_name: ADMIN_FULL_NAME,
        country: ADMIN_COUNTRY,
        email_verified: true,
      }),
    });

    if (userRecordResponse.ok || userRecordResponse.status === 201 || userRecordResponse.status === 409) {
      console.log('   ✅ User record created/updated');
    } else {
      const err = await userRecordResponse.text();
      console.log(`   ⚠️  User record: ${err}`);
    }

    // Step 3: Grant super_admin role
    console.log('3️⃣ Granting super_admin role...');
    
    const roleResponse = await fetch(`${SUPABASE_URL}/rest/v1/admin_roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        user_id: userId,
        role: 'super_admin',
        granted_by: 'system',
      }),
    });

    if (roleResponse.ok || roleResponse.status === 201) {
      console.log('   ✅ Super admin role granted');
    } else {
      const err = await roleResponse.text();
      if (err.includes('duplicate') || err.includes('unique')) {
        console.log('   ✅ Super admin role already exists');
      } else {
        console.log(`   ⚠️  Role grant: ${err}`);
      }
    }

    console.log('\n✅ Setup complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Super Administrator Account');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
    console.log(`  Role:     super_admin`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Next steps:');
    console.log('1. Go to https://africarailways.com');
    console.log('2. Sign in with the credentials above');
    console.log('3. Navigate to /admin');
    console.log('4. Click the Telegram tab to manage posts\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdmin();
