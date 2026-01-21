-- =====================================================
-- SENT AIRDROP STATUS TABLE
-- 310M SENT Distribution for Africa Railways Workers
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/sql
-- =====================================================

CREATE TABLE airdrop_status (
  wallet_address TEXT PRIMARY KEY,
  twitter_verified BOOLEAN DEFAULT FALSE,
  telegram_verified BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  total_allocation BIGINT DEFAULT 0,
  claimed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE airdrop_status ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for registration)
CREATE POLICY "Allow public insert" ON airdrop_status
  FOR INSERT TO anon WITH CHECK (true);

-- Allow public read (for status checks)
CREATE POLICY "Allow public read" ON airdrop_status
  FOR SELECT TO anon USING (true);

-- Allow updates for task verification
CREATE POLICY "Allow public update" ON airdrop_status
  FOR UPDATE TO anon USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_airdrop_status_claimed ON airdrop_status(claimed);
CREATE INDEX IF NOT EXISTS idx_airdrop_status_quiz ON airdrop_status(quiz_score DESC);
CREATE INDEX IF NOT EXISTS idx_airdrop_status_referrals ON airdrop_status(referral_count DESC);

-- =====================================================
-- ALLOCATION BREAKDOWN (310M SENT)
-- =====================================================
-- Early Supporters:  50M SENT - Joined Telegram before presale
-- Social Tasks:     100M SENT - Complete Twitter/Telegram tasks
-- Referrals:         50M SENT - Bring 3+ verified members
-- Sentinels:        100M SENT - Track workers with verified reports
-- Quiz Winners:      10M SENT - Top 100 scorers
-- TOTAL:           310M SENT (3.1% of supply)
-- =====================================================

-- Quiz Leaderboard (Top 100 for 10M pool)
CREATE OR REPLACE VIEW quiz_leaderboard AS
SELECT 
  wallet_address,
  quiz_score,
  ROW_NUMBER() OVER (ORDER BY quiz_score DESC) as rank
FROM airdrop_status
WHERE quiz_score > 0
ORDER BY quiz_score DESC
LIMIT 100;

-- Referral Leaderboard (50M pool - need 3+ referrals)
CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT 
  wallet_address,
  referral_count,
  CASE WHEN referral_count >= 3 THEN TRUE ELSE FALSE END as qualified
FROM airdrop_status
WHERE referral_count > 0
ORDER BY referral_count DESC;

-- Airdrop Stats
CREATE OR REPLACE VIEW airdrop_stats AS
SELECT
  COUNT(*) as total_participants,
  SUM(CASE WHEN claimed THEN 1 ELSE 0 END) as total_claimed,
  SUM(CASE WHEN twitter_verified THEN 1 ELSE 0 END) as twitter_verified,
  SUM(CASE WHEN telegram_verified THEN 1 ELSE 0 END) as telegram_verified,
  SUM(CASE WHEN quiz_score > 0 THEN 1 ELSE 0 END) as quiz_participants,
  SUM(CASE WHEN referral_count >= 3 THEN 1 ELSE 0 END) as qualified_referrers,
  SUM(total_allocation) as total_allocated
FROM airdrop_status;

-- Grant access
GRANT SELECT ON quiz_leaderboard TO anon;
GRANT SELECT ON referral_leaderboard TO anon;
GRANT SELECT ON airdrop_stats TO anon;
