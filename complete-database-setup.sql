-- =====================================================
-- COMPLETE DATABASE SETUP FOR AFRICA RAILWAYS APP
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PART 1: ADD MISSING COLUMNS TO AIRDROP_STATUS
-- =====================================================

ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS referrer_wallet TEXT;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS twitter_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS telegram_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS total_allocation BIGINT DEFAULT 0;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS claim_signature TEXT;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS signature_generated_at TIMESTAMPTZ;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS tx_hash TEXT;
ALTER TABLE airdrop_status ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_airdrop_referrer ON airdrop_status(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_airdrop_referrals ON airdrop_status(referral_count DESC);

-- =====================================================
-- PART 2: CORE USER TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 3: ADMIN TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.admin_roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 4: WALLET & FINANCIAL TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES public.transactions(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES public.wallets(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  details JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 5: LOYALTY SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  min_points INTEGER DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  tier_id UUID REFERENCES public.loyalty_tiers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 6: BOOKING TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  route TEXT NOT NULL,
  departure_date TIMESTAMPTZ NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  refund_amount DECIMAL(10, 2) DEFAULT 0.00,
  cancelled_at TIMESTAMPTZ,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.railway_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  departure_date DATE NOT NULL,
  seat_number TEXT,
  class TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.passenger_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  id_number TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 7: ROUTES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  train_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 8: REFERRALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  referrer_wallet TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  CONSTRAINT unique_user_referral UNIQUE (user_wallet),
  CONSTRAINT no_self_referral CHECK (user_wallet != referrer_wallet)
);

-- =====================================================
-- PART 9: BONDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bonds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  total_value DECIMAL(20, 2) NOT NULL,
  apy DECIMAL(5, 2) NOT NULL,
  maturity_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'matured', 'pending')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 10: SUPPORT TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 11: FAVORITES & TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.favorite_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, route_name)
);

CREATE TABLE IF NOT EXISTS public.favorite_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  post_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.train_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  train_id TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  speed DECIMAL(5, 2),
  direction TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 12: RAILWAY COMPANY API SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public.railway_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  contact_email TEXT NOT NULL UNIQUE,
  contact_phone TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  api_key TEXT UNIQUE,
  api_secret TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id)
);

CREATE TABLE IF NOT EXISTS public.railway_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  station_code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  facilities JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.railway_company_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  origin_station_id UUID REFERENCES public.railway_stations(id),
  destination_station_id UUID REFERENCES public.railway_stations(id),
  train_number TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration_minutes INTEGER,
  distance_km DECIMAL(10, 2),
  price_usd DECIMAL(10, 2) NOT NULL,
  price_afc DECIMAL(10, 2),
  available_seats INTEGER DEFAULT 0,
  train_class TEXT DEFAULT 'economy' CHECK (train_class IN ('economy', 'business', 'first')),
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7],
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.railway_api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  request_body JSONB,
  response_body JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.railway_api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 1000,
  requests_per_day INTEGER DEFAULT 10000,
  current_minute_count INTEGER DEFAULT 0,
  current_hour_count INTEGER DEFAULT 0,
  current_day_count INTEGER DEFAULT 0,
  last_reset_minute TIMESTAMPTZ DEFAULT NOW(),
  last_reset_hour TIMESTAMPTZ DEFAULT NOW(),
  last_reset_day TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PART 13: INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_verified ON public.referrals(is_verified);
CREATE INDEX IF NOT EXISTS idx_referrals_claimed_at ON public.referrals(claimed_at);
CREATE INDEX IF NOT EXISTS idx_railway_companies_status ON public.railway_companies(status);
CREATE INDEX IF NOT EXISTS idx_railway_companies_api_key ON public.railway_companies(api_key);
CREATE INDEX IF NOT EXISTS idx_railway_stations_company ON public.railway_stations(company_id);
CREATE INDEX IF NOT EXISTS idx_railway_stations_country ON public.railway_stations(country);
CREATE INDEX IF NOT EXISTS idx_railway_company_routes_company ON public.railway_company_routes(company_id);
CREATE INDEX IF NOT EXISTS idx_railway_api_logs_company ON public.railway_api_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_railway_api_logs_created ON public.railway_api_logs(created_at);

-- =====================================================
-- PART 14: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_company_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_api_rate_limits ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 15: RLS POLICIES
-- =====================================================

-- Users
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (auth.uid() = id);

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Wallets
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets;
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- Bookings
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bookings" ON public.bookings;
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Support Tickets
DROP POLICY IF EXISTS "Users can view own tickets" ON public.support_tickets;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tickets" ON public.support_tickets;
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Routes (public read)
DROP POLICY IF EXISTS "Public can view routes" ON public.routes;
CREATE POLICY "Public can view routes" ON public.routes FOR SELECT USING (true);

-- Referrals
DROP POLICY IF EXISTS "Anyone can create referral" ON public.referrals;
CREATE POLICY "Anyone can create referral" ON public.referrals FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view referrals" ON public.referrals;
CREATE POLICY "Public can view referrals" ON public.referrals FOR SELECT USING (true);

-- Bonds
DROP POLICY IF EXISTS "Everyone can view active bonds" ON public.bonds;
CREATE POLICY "Everyone can view active bonds" ON public.bonds FOR SELECT USING (status = 'active');

-- Railway Stations (public read)
DROP POLICY IF EXISTS "Public can view active stations" ON public.railway_stations;
CREATE POLICY "Public can view active stations" ON public.railway_stations FOR SELECT USING (status = 'active');

-- Railway Routes (public read)
DROP POLICY IF EXISTS "Public can view active routes" ON public.railway_company_routes;
CREATE POLICY "Public can view active routes" ON public.railway_company_routes FOR SELECT USING (status = 'active');

-- =====================================================
-- PART 16: VIEWS
-- =====================================================

-- Referral Leaderboard
CREATE OR REPLACE VIEW public.referral_leaderboard AS
SELECT 
  referrer_wallet,
  COUNT(*) as referral_count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count
FROM public.referrals
GROUP BY referrer_wallet
ORDER BY referral_count DESC;

GRANT SELECT ON public.referral_leaderboard TO anon, authenticated;

-- =====================================================
-- PART 17: HELPER FUNCTIONS
-- =====================================================

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_railway_api_key()
RETURNS TEXT AS $$
DECLARE
  api_key TEXT;
BEGIN
  api_key := 'ark_' || encode(gen_random_bytes(32), 'hex');
  RETURN api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate API secret
CREATE OR REPLACE FUNCTION generate_railway_api_secret()
RETURNS TEXT AS $$
DECLARE
  api_secret TEXT;
BEGIN
  api_secret := 'ars_' || encode(gen_random_bytes(48), 'hex');
  RETURN api_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PART 18: SAMPLE DATA
-- =====================================================

-- Sample routes
INSERT INTO public.routes (origin, destination, departure_time, arrival_time, duration, price, available_seats, train_number) VALUES
('Nairobi', 'Mombasa', '08:00', '14:30', '6h 30m', 150, 45, 'ARN-101'),
('Nairobi', 'Mombasa', '14:00', '20:30', '6h 30m', 150, 32, 'ARN-102'),
('Nairobi', 'Mombasa', '20:00', '02:30', '6h 30m', 120, 28, 'ARN-103')
ON CONFLICT DO NOTHING;

-- Sample railway companies
INSERT INTO public.railway_companies (company_name, country, contact_email, contact_phone, website, status) VALUES
  ('Kenya Railways Corporation', 'Kenya', 'api@krc.co.ke', '+254-20-221211', 'https://www.krc.co.ke', 'approved'),
  ('TAZARA Railway', 'Tanzania', 'api@tazara.co.tz', '+255-22-286-0340', 'https://www.tazara.co.tz', 'approved'),
  ('Zambia Railways', 'Zambia', 'api@zrl.com.zm', '+260-211-229501', 'https://www.zrl.com.zm', 'approved')
ON CONFLICT (company_name) DO NOTHING;

-- =====================================================
-- DONE! All tables created successfully.
-- =====================================================
