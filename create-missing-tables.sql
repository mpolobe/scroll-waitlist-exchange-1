-- Create missing tables for application functionality
-- Run this in Supabase SQL Editor

-- 1. Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'train', 'bus', 'ferry'
  route TEXT NOT NULL,
  departure_date TIMESTAMPTZ NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  refund_amount DECIMAL(10, 2) DEFAULT 0.00,
  cancelled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Railway Bookings (Specific)
CREATE TABLE IF NOT EXISTS public.railway_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  departure_date DATE NOT NULL,
  seat_number TEXT,
  class TEXT, -- 'economy', 'business', 'first'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Profiles (Ensure it exists)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
