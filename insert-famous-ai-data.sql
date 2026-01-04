-- ============================================
-- Insert Famous-AI Data into Vercel Supabase
-- ============================================
-- This script inserts all data from Famous-AI database
-- Execute this in your Vercel Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/editor
-- ============================================

-- Step 1: Insert Loyalty Tiers (no dependencies)
-- ============================================
INSERT INTO loyalty_tiers (name, min_points, max_points, discount_percent, benefits, created_at, updated_at)
VALUES 
  (
    'Bronze',
    0,
    999,
    0,
    '["Priority booking access"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'Silver',
    1000,
    4999,
    5,
    '["5% discount on bookings", "Priority support"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'Gold',
    5000,
    9999,
    10,
    '["10% discount on bookings", "Free seat selection", "Priority boarding"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'Platinum',
    10000,
    999999,
    15,
    '["15% discount on bookings", "Free upgrades", "Lounge access", "Dedicated support"]'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Step 2: Insert Users (depends on nothing)
-- ============================================
INSERT INTO users (
  id,
  email,
  full_name,
  country,
  email_verified,
  verification_token,
  verification_token_expires,
  created_at,
  updated_at,
  wallet_address,
  wallet_created_at
)
VALUES 
  (
    'bcaf0b57-107e-442c-919b-c9742edcd8e5'::uuid,
    'bcm32@njit.edu',
    'Benjamin Mpolokoso',
    'Zambia',
    false,
    'c4ba76a2-787a-407c-9065-50d8fdd29a9f'::uuid,
    '2025-11-29T00:28:26.338Z'::timestamptz,
    '2025-11-28T00:28:27.557Z'::timestamptz,
    '2025-11-28T00:28:27.557Z'::timestamptz,
    NULL,
    NULL
  ),
  (
    '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2'::uuid,
    'globaltelecom2000@gmail.com',
    'Global Telecom',
    NULL,
    false,
    'b4677c36-96b9-431f-b092-ef5ac49d5d19'::uuid,
    '2025-12-07T16:37:58.198Z'::timestamptz,
    '2025-12-06T16:37:59.089Z'::timestamptz,
    '2025-12-06T16:37:59.089Z'::timestamptz,
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert Loyalty Points (depends on users and loyalty_tiers)
-- ============================================
INSERT INTO loyalty_points (
  id,
  user_id,
  points_balance,
  lifetime_points,
  tier_level,
  tier_discount_percent,
  created_at,
  updated_at
)
VALUES 
  (
    '52a03799-0cb7-4ce8-b0b3-57314456e384'::uuid,
    'bcaf0b57-107e-442c-919b-c9742edcd8e5'::uuid,
    15,
    15,
    'Bronze',
    0,
    '2025-11-28T17:53:10.757Z'::timestamptz,
    '2025-11-28T17:53:10.757Z'::timestamptz
  )
ON CONFLICT (user_id) DO UPDATE SET
  points_balance = EXCLUDED.points_balance,
  lifetime_points = EXCLUDED.lifetime_points,
  tier_level = EXCLUDED.tier_level,
  tier_discount_percent = EXCLUDED.tier_discount_percent,
  updated_at = EXCLUDED.updated_at;

-- Step 4: Insert Points Transactions (depends on users)
-- ============================================
INSERT INTO points_transactions (
  id,
  user_id,
  transaction_type,
  points_amount,
  booking_reference,
  description,
  afc_amount,
  created_at
)
VALUES 
  (
    '52a03799-0cb7-4ce8-b0b3-57314456e384'::uuid,
    'bcaf0b57-107e-442c-919b-c9742edcd8e5'::uuid,
    'earned',
    15,
    'ARN-1764352388361',
    'Earned 15 points from booking',
    155.00,
    '2025-11-28T17:53:10.757Z'::timestamptz
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the data was inserted correctly:

SELECT 'loyalty_tiers' as table_name, COUNT(*) as count FROM loyalty_tiers
UNION ALL
SELECT 'users', COUNT(*) FROM users WHERE id IN ('bcaf0b57-107e-442c-919b-c9742edcd8e5', '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2')
UNION ALL
SELECT 'loyalty_points', COUNT(*) FROM loyalty_points WHERE user_id = 'bcaf0b57-107e-442c-919b-c9742edcd8e5'
UNION ALL
SELECT 'points_transactions', COUNT(*) FROM points_transactions WHERE user_id = 'bcaf0b57-107e-442c-919b-c9742edcd8e5';

git oull origin main-- ============================================
-- Insert Famous-AI Data into Vercel Supabase
-- ============================================
-- This script inserts all data from Famous-AI database
-- Execute this in your Vercel Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/editor
-- ============================================

-- Step 1: Insert Loyalty Tiers (no dependencies)
-- ============================================
INSERT INTO loyalty_tiers (name, min_points, max_points, discount_percent, benefits, created_at, updated_at)
VALUES 
  (
    'Bronze',
    0,
    999,
    0,
    '["Priority booking access"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'Silver',
    1000,
    4999,
    5,
    '["5% discount on bookings", "Priority support"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'Gold',
    5000,
    9999,
    10,
    '["10% discount on bookings", "Free seat selection", "Priority boarding"]'::jsonb,
    NOW(),
    NOW()
  ),
  (
    'Platinum',
    10000,
    999999,
    15,
    '["15% discount on bookings", "Free upgrades", "Lounge access", "Dedicated support"]'::jsonb,
    NOW(),
    NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Step 2: Insert Users (depends on nothing)
-- ============================================
INSERT INTO users (
  id,
  email,
  full_name,
  country,
  email_verified,
  verification_token,
  verification_token_expires,
  created_at,
  updated_at,
  wallet_address,
  wallet_created_at
)
VALUES 
  (
    'bcaf0b57-107e-442c-919b-c9742edcd8e5'::uuid,
    'bcm32@njit.edu',
    'Benjamin Mpolokoso',
    'Zambia',
    false,
    'c4ba76a2-787a-407c-9065-50d8fdd29a9f'::uuid,
    '2025-11-29T00:28:26.338Z'::timestamptz,
    '2025-11-28T00:28:27.557Z'::timestamptz,
    '2025-11-28T00:28:27.557Z'::timestamptz,
    NULL,
    NULL
  ),
  (
    '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2'::uuid,
    'globaltelecom2000@gmail.com',
    'Global Telecom',
    NULL,
    false,
    'b4677c36-96b9-431f-b092-ef5ac49d5d19'::uuid,
    '2025-12-07T16:37:58.198Z'::timestamptz,
    '2025-12-06T16:37:59.089Z'::timestamptz,
    '2025-12-06T16:37:59.089Z'::timestamptz,
    NULL,
    NULL
  )
ON CONFLICT (id) DO NOTHING;

-- Step 3: Insert Loyalty Points (depends on users and loyalty_tiers)
-- ============================================
INSERT INTO loyalty_points (
  id,
  user_id,
  points_balance,
  lifetime_points,
  tier_level,
  tier_discount_percent,
  created_at,
  updated_at
)
VALUES 
  (
    '52a03799-0cb7-4ce8-b0b3-57314456e384'::uuid,
    'bcaf0b57-107e-442c-919b-c9742edcd8e5'::uuid,
    15,
    15,
    'Bronze',
    0,
    '2025-11-28T17:53:10.757Z'::timestamptz,
    '2025-11-28T17:53:10.757Z'::timestamptz
  )
ON CONFLICT (user_id) DO UPDATE SET
  points_balance = EXCLUDED.points_balance,
  lifetime_points = EXCLUDED.lifetime_points,
  tier_level = EXCLUDED.tier_level,
  tier_discount_percent = EXCLUDED.tier_discount_percent,
  updated_at = EXCLUDED.updated_at;

-- Step 4: Insert Points Transactions (depends on users)
-- ============================================
INSERT INTO points_transactions (
  id,
  user_id,
  transaction_type,
  points_amount,
  booking_reference,
  description,
  afc_amount,
  created_at
)
VALUES 
  (
    '52a03799-0cb7-4ce8-b0b3-57314456e384'::uuid,
    'bcaf0b57-107e-442c-919b-c9742edcd8e5'::uuid,
    'earned',
    15,
    'ARN-1764352388361',
    'Earned 15 points from booking',
    155.00,
    '2025-11-28T17:53:10.757Z'::timestamptz
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the data was inserted correctly:

SELECT 'loyalty_tiers' as table_name, COUNT(*) as count FROM loyalty_tiers
UNION ALL
SELECT 'users', COUNT(*) FROM users WHERE id IN ('bcaf0b57-107e-442c-919b-c9742edcd8e5', '3a3adc5d-7d32-4824-bda9-ed1d8c81f7c2')
UNION ALL
SELECT 'loyalty_points', COUNT(*) FROM loyalty_points WHERE user_id = 'bcaf0b57-107e-442c-919b-c9742edcd8e5'
UNION ALL
SELECT 'points_transactions', COUNT(*) FROM points_transactions WHERE user_id = 'bcaf0b57-107e-442c-919b-c9742edcd8e5';
