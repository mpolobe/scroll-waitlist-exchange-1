#!/usr/bin/env node
/**
 * Seed Database Script
 * Inserts Famous-AI data into Vercel Supabase during build
 * Runs automatically as part of the build process
 */

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_KEY ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedLoyaltyTiers() {
  console.log('📊 Seeding loyalty tiers...');
  
  const tiers = [
    {
      name: 'Bronze',
      min_points: 0,
      max_points: 999,
      discount_percent: 0,
      benefits: ['Priority booking access']
    },
    {
      name: 'Silver',
      min_points: 1000,
      max_points: 4999,
      discount_percent: 5,
      benefits: ['5% discount on bookings', 'Priority support']
    },
    {
      name: 'Gold',
      min_points: 5000,
      max_points: 9999,
      discount_percent: 10,
      benefits: ['10% discount on bookings', 'Free seat selection', 'Priority boarding']
    },
    {
      name: 'Platinum',
      min_points: 10000,
      max_points: 999999,
      discount_percent: 15,
      benefits: ['15% discount on bookings', 'Free upgrades', 'Lounge access', 'Dedicated support']
    }
  ];

  for (const tier of tiers) {
    const { error } = await supabase
      .from('loyalty_tiers')
      .upsert(tier, { onConflict: 'name' });
    
    if (error) {
      console.error(`   ❌ Failed to insert ${tier.name}:`, error.message);
    } else {
      console.log(`   ✅ ${tier.name} tier seeded`);
    }
  }
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  const users = [
    {
      id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5',
      email: 'bcm32@njit.edu',
      full_name: 'Benjamin Mpolokoso',
      country: 'Zambia',
      email_verified: false,
      verification_token: 'c4ba76a2-787a-407c-9065-50d8fdd29a9f',
      verification_token_expires: '2025-11-29T00:28:26.338Z',
      created_at: '2025-11-28T00:28:27.557Z',
      updated_at: '2025-11-28T00:28:27.557Z'
    },
    {
      id: '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2',
      email: 'globaltelecom2000@gmail.com',
      full_name: 'Global Telecom',
      email_verified: false,
      verification_token: 'b4677c36-96b9-431f-b092-ef5ac49d5d19',
      verification_token_expires: '2025-12-07T16:37:58.198Z',
      created_at: '2025-12-06T16:37:59.089Z',
      updated_at: '2025-12-06T16:37:59.089Z'
    }
  ];

  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert ${user.email}:`, error.message);
    } else {
      console.log(`   ✅ ${user.email} seeded`);
    }
  }
}

async function seedLoyaltyPoints() {
  console.log('🎯 Seeding loyalty points...');
  
  const loyaltyPoints = [
    {
      id: '52a03799-0cb7-4ce8-b0b3-57314456e384',
      user_id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5',
      points_balance: 15,
      lifetime_points: 15,
      tier_level: 'Bronze',
      tier_discount_percent: 0,
      created_at: '2025-11-28T17:53:10.757Z',
      updated_at: '2025-11-28T17:53:10.757Z'
    }
  ];

  for (const points of loyaltyPoints) {
    const { error } = await supabase
      .from('loyalty_points')
      .upsert(points, { onConflict: 'user_id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert loyalty points:`, error.message);
    } else {
      console.log(`   ✅ Loyalty points seeded for user ${points.user_id.substring(0, 8)}...`);
    }
  }
}

async function seedPointsTransactions() {
  console.log('💰 Seeding points transactions...');
  
  const transactions = [
    {
      id: '52a03799-0cb7-4ce8-b0b3-57314456e384',
      user_id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5',
      transaction_type: 'earned',
      points_amount: 15,
      points: 15,
      booking_reference: 'ARN-1764352388361',
      description: 'Earned 15 points from booking',
      afc_amount: 155.00,
      created_at: '2025-11-28T17:53:10.757Z'
    }
  ];

  for (const transaction of transactions) {
    const { error } = await supabase
      .from('points_transactions')
      .upsert(transaction, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert transaction:`, error.message);
    } else {
      console.log(`   ✅ Transaction ${transaction.booking_reference} seeded`);
    }
  }
}

async function seedAdminRoles() {
  console.log('🛡️ Seeding admin roles...');
  
  const adminRoles = [
    {
      id: 'e4adac8e-21ab-4b92-abec-b7682db0d8bd',
      user_id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5', // Benjamin Mpolokoso
      role: 'super_admin',
      granted_by: null,
      granted_at: '2025-11-28T00:20:33.423Z'
    }
  ];

  for (const role of adminRoles) {
    // Check if user exists first to avoid FK error
    const { data: user } = await supabase.from('users').select('id').eq('id', role.user_id).single();
    
    if (!user) {
      console.warn(`   ⚠️ Skipping admin role for missing user ${role.user_id}`);
      // In a real scenario, we might want to create the user here if missing, 
      // but we added it to seedUsers() so it should be there.
      continue;
    }

    const { error } = await supabase
      .from('admin_roles')
      .upsert(role, { onConflict: 'id' });
    
    if (error) {
      console.error(`   ❌ Failed to insert admin role:`, error.message);
    } else {
      console.log(`   ✅ Admin role seeded for user ${role.user_id}`);
    }
  }
}

async function seedWallets() {
  console.log('💼 Seeding wallets...');
  
  const users = [
    { id: 'bcaf0b57-107e-442c-919b-c9742edcd8e5', name: 'Benjamin Mpolokoso' },
    { id: '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2', name: 'Global Telecom' }
  ];

  for (const user of users) {
    // Check if wallet exists
    const { data: existingWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!existingWallet) {
      const { error } = await supabase
        .from('wallets')
        .insert({
          user_id: user.id,
          balance: 100.00,
          currency: 'USD',
          created_at: '2025-11-28T00:28:27.557Z',
          updated_at: '2025-11-28T00:28:27.557Z'
        });
      
      if (error) {
        console.error(`   ❌ Failed to create wallet for ${user.name}:`, error.message);
      } else {
        console.log(`   ✅ Wallet created for ${user.name}`);
      }
    } else {
      console.log(`   ℹ️ Wallet already exists for ${user.name}`);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('🌱 Database Seeding Started');
  console.log('========================================');
  console.log(`Database: ${SUPABASE_URL}`);
  console.log('========================================\n');

  try {
    // Seed in dependency order
    await seedLoyaltyTiers();
    await seedUsers();
    await seedLoyaltyPoints();
    await seedPointsTransactions();
    await seedAdminRoles();
    await seedWallets();

    console.log('\n========================================');
    console.log('✅ Database seeding completed successfully!');
    console.log('========================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ Database seeding failed:', error.message);
    console.error('========================================\n');
    process.exit(1);
  }
}

// Run seeding
main();
