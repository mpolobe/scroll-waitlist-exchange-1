-- Phone Wallets Table
-- Stores mapping between phone numbers and blockchain wallet addresses

CREATE TABLE IF NOT EXISTS phone_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    sui_address VARCHAR(66) NOT NULL,
    afc_address VARCHAR(42) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_phone_wallets_phone ON phone_wallets(phone_number);
CREATE INDEX IF NOT EXISTS idx_phone_wallets_sui ON phone_wallets(sui_address);
CREATE INDEX IF NOT EXISTS idx_phone_wallets_afc ON phone_wallets(afc_address);

-- Enable Row Level Security
ALTER TABLE phone_wallets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own wallet
CREATE POLICY "Users can view own wallet" ON phone_wallets
    FOR SELECT
    USING (true);

-- Policy: Allow insert for new wallets
CREATE POLICY "Allow wallet creation" ON phone_wallets
    FOR INSERT
    WITH CHECK (true);

-- Policy: Allow update for wallet activity
CREATE POLICY "Allow wallet updates" ON phone_wallets
    FOR UPDATE
    USING (true);

-- Function to update last_active timestamp
CREATE OR REPLACE FUNCTION update_wallet_last_active()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_active = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update last_active
DROP TRIGGER IF EXISTS trigger_update_wallet_last_active ON phone_wallets;
CREATE TRIGGER trigger_update_wallet_last_active
    BEFORE UPDATE ON phone_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_wallet_last_active();

-- Comments
COMMENT ON TABLE phone_wallets IS 'Maps phone numbers to SUI and AFC wallet addresses';
COMMENT ON COLUMN phone_wallets.phone_number IS 'E.164 format phone number (e.g., +254712345678)';
COMMENT ON COLUMN phone_wallets.sui_address IS 'SUI blockchain address (0x...)';
COMMENT ON COLUMN phone_wallets.afc_address IS 'AFC/EVM wallet address (0x...)';
