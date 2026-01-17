-- Add wallet_address column to profiles table and associate master AFC wallet with admin

-- Add the wallet_address column if it does not exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(80);

-- Update the admin profile to link the master AFC wallet
-- This preserves the existing phone number and only updates the wallet_address
UPDATE profiles
SET wallet_address = '0x4284dee31121675fce54b211eddf0eb786ed5d6880b8ec728d2c0a3cc104e3c8'
WHERE email = 'admin@africarailways.com';

-- Also update the users table if it has wallet_address column
UPDATE users
SET wallet_address = '0x4284dee31121675fce54b211eddf0eb786ed5d6880b8ec728d2c0a3cc104e3c8'
WHERE email = 'admin@africarailways.com';

-- Create index for wallet_address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
