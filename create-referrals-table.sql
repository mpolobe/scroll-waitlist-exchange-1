-- Referrals Table for SENT Token 50M Referral Pool
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/sql

-- Referrals table with Sybil protection (unique constraint on user_wallet)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  referrer_wallet TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,  -- Set true when worker submits first track report
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  
  -- Sybil protection: one user can only be referred once
  CONSTRAINT unique_user_referral UNIQUE (user_wallet),
  -- Prevent self-referral
  CONSTRAINT no_self_referral CHECK (user_wallet != referrer_wallet)
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_verified ON public.referrals(is_verified);
CREATE INDEX IF NOT EXISTS idx_referrals_claimed_at ON public.referrals(claimed_at);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for claim action)
CREATE POLICY "Anyone can create referral" ON public.referrals
  FOR INSERT WITH CHECK (true);

-- Allow public read for leaderboard
CREATE POLICY "Public can view referrals" ON public.referrals
  FOR SELECT USING (true);

-- Only service role can update (for verification)
CREATE POLICY "Service role can update" ON public.referrals
  FOR UPDATE USING (auth.role() = 'service_role');

-- View for leaderboard (top referrers by count)
CREATE OR REPLACE VIEW public.referral_leaderboard AS
SELECT 
  referrer_wallet,
  COUNT(*) as referral_count,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_count
FROM public.referrals
GROUP BY referrer_wallet
ORDER BY referral_count DESC;

-- Grant access to the view
GRANT SELECT ON public.referral_leaderboard TO anon, authenticated;
