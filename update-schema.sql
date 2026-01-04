-- ============================================
-- Update Schema to Match Famous-AI Data Structure
-- ============================================
-- Run this in your Supabase SQL Editor to fix the schema errors
-- URL: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create tables if they don't exist (Moved to top to prevent ALTER errors)
CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  min_points INTEGER DEFAULT 0,
  max_points INTEGER,
  discount_percent INTEGER DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  points_balance INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier_level TEXT,
  tier_discount_percent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_type TEXT,
  points_amount INTEGER,
  booking_reference TEXT,
  description TEXT,
  afc_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Update Users Table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_token UUID,
ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_created_at TIMESTAMPTZ;

-- 3. Update Loyalty Tiers Table (In case it existed but was old version)
ALTER TABLE public.loyalty_tiers
ADD COLUMN IF NOT EXISTS max_points INTEGER,
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- 4. Update Loyalty Points Table
ALTER TABLE public.loyalty_points
ADD COLUMN IF NOT EXISTS points_balance INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tier_level TEXT,
ADD COLUMN IF NOT EXISTS tier_discount_percent INTEGER DEFAULT 0;

-- 5. Update Points Transactions Table
ALTER TABLE public.points_transactions
ADD COLUMN IF NOT EXISTS transaction_type TEXT,
ADD COLUMN IF NOT EXISTS points_amount INTEGER,
ADD COLUMN IF NOT EXISTS booking_reference TEXT,
ADD COLUMN IF NOT EXISTS afc_amount DECIMAL(10, 2);
