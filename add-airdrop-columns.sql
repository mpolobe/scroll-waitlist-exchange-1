-- =====================================================
-- SENT AIRDROP STATUS TABLE
-- 310M SENT Distribution for Africa Railways Workers
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/llvprbmrnjvamjzavmhg/sql
-- =====================================================

CREATE TABLE IF NOT EXISTS airdrop_status (
  wallet_address TEXT PRIMARY KEY,
  referrer_wallet TEXT,
  twitter_verified BOOLEAN DEFAULT FALSE,
  telegram_verified BOOLEAN DEFAULT FALSE,
  quiz_score INTEGER DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  total_allocation BIGINT DEFAULT 0,
  claimed BOOLEAN DEFAULT FALSE,
  claim_signature TEXT,
  signature_generated_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE airdrop_status ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public insert" ON airdrop_status
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow public read" ON airdrop_status
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public update" ON airdrop_status
  FOR UPDATE TO anon USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_airdrop_wallet ON airdrop_status(wallet_address);
CREATE INDEX IF NOT EXISTS idx_airdrop_referrer ON airdrop_status(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_airdrop_claimed ON airdrop_status(claimed);
CREATE INDEX IF NOT EXISTS idx_airdrop_quiz ON airdrop_status(quiz_score DESC);
CREATE INDEX IF NOT EXISTS idx_airdrop_referrals ON airdrop_status(referral_count DESC);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to increment referral count
CREATE OR REPLACE FUNCTION increment_referral_count(referrer TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE airdrop_status 
  SET referral_count = referral_count + 1
  WHERE wallet_address = LOWER(referrer);
END;
$$ LANGUAGE plpgsql;

-- Function to register with referral
CREATE OR REPLACE FUNCTION register_with_referral(
  new_wallet TEXT,
  ref_wallet TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert new user
  INSERT INTO airdrop_status (wallet_address, referrer_wallet)
  VALUES (LOWER(new_wallet), LOWER(ref_wallet))
  ON CONFLICT (wallet_address) DO NOTHING;
  
  -- Increment referrer's count if provided
  IF ref_wallet IS NOT NULL AND ref_wallet != '' THEN
    PERFORM increment_referral_count(ref_wallet);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS
-- =====================================================

-- Quiz Leaderboard (Top 100 for 10M pool)
CREATE OR REPLACE VIEW quiz_leaderboard AS
SELECT 
  wallet_address,
  quiz_score,
  ROW_NUMBER() OVER (ORDER BY quiz_score DESC, created_at ASC) as rank
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
  SUM(CASE WHEN quiz_score >= 100 THEN 1 ELSE 0 END) as quiz_winners,
  SUM(CASE WHEN referral_count >= 3 THEN 1 ELSE 0 END) as qualified_referrers,
  SUM(referral_count) as total_referrals,
  SUM(total_allocation) as total_allocated
FROM airdrop_status;

-- Grant access
GRANT SELECT ON quiz_leaderboard TO anon;
GRANT SELECT ON referral_leaderboard TO anon;
GRANT SELECT ON airdrop_stats TO anon;
GRANT EXECUTE ON FUNCTION increment_referral_count TO anon;
GRANT EXECUTE ON FUNCTION register_with_referral TO anon;

-- =====================================================
-- ALLOCATION BREAKDOWN (310M SENT)
-- =====================================================
-- Early Supporters:  50M SENT - Joined Telegram before presale
-- Social Tasks:     100M SENT - Complete Twitter/Telegram tasks  
-- Referrals:         50M SENT - Bring 3+ verified members (25 SENT each)
-- Sentinels:        100M SENT - Track workers with verified reports
-- Quiz Winners:      10M SENT - Top 100 scorers (5/5 = 100%)
-- TOTAL:           310M SENT (3.1% of supply)
-- =====================================================
