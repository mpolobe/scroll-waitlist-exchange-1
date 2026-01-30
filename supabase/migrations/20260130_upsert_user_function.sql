-- Migration: Add upsert_user function for handling user creation/updates
-- This function properly handles phone updates and prevents duplicates

-- First, ensure the users table has all necessary columns
ALTER TABLE IF EXISTS public.users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(66),
ADD COLUMN IF NOT EXISTS afc_address VARCHAR(42),
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
ADD COLUMN IF NOT EXISTS auth_id UUID,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_wallet ON public.users(wallet_address);

-- Create or replace the upsert_user function
CREATE OR REPLACE FUNCTION upsert_user(
    p_phone VARCHAR DEFAULT NULL,
    p_email VARCHAR DEFAULT NULL,
    p_full_name VARCHAR DEFAULT NULL,
    p_country VARCHAR DEFAULT NULL,
    p_wallet_address VARCHAR DEFAULT NULL,
    p_auth_provider VARCHAR DEFAULT 'phone',
    p_auth_id UUID DEFAULT NULL
)
RETURNS public.users AS $$
DECLARE
    v_user public.users;
BEGIN
    -- Try to find existing user by wallet_address first (most reliable), then phone, email, or auth_id
    SELECT * INTO v_user FROM public.users 
    WHERE (p_wallet_address IS NOT NULL AND wallet_address = p_wallet_address)
       OR (p_phone IS NOT NULL AND phone = p_phone)
       OR (p_email IS NOT NULL AND email = p_email)
       OR (p_auth_id IS NOT NULL AND auth_id = p_auth_id)
    ORDER BY 
        -- Prioritize wallet_address match, then phone, then email, then auth_id
        CASE WHEN wallet_address = p_wallet_address THEN 0
             WHEN phone = p_phone THEN 1
             WHEN email = p_email THEN 2
             WHEN auth_id = p_auth_id THEN 3
             ELSE 4 END
    LIMIT 1;
    
    IF v_user.id IS NOT NULL THEN
        -- Update existing user - include phone to allow phone number changes
        UPDATE public.users SET
            phone = COALESCE(p_phone, phone),
            email = COALESCE(p_email, email),
            full_name = COALESCE(p_full_name, full_name),
            country = COALESCE(p_country, country),
            wallet_address = COALESCE(p_wallet_address, wallet_address),
            afc_address = COALESCE(p_wallet_address, afc_address),
            auth_provider = COALESCE(p_auth_provider, auth_provider),
            auth_id = COALESCE(p_auth_id, auth_id),
            phone_verified = CASE WHEN p_phone IS NOT NULL AND p_phone != COALESCE(phone, '') THEN true ELSE phone_verified END,
            last_login_at = NOW(),
            updated_at = NOW()
        WHERE id = v_user.id
        RETURNING * INTO v_user;
    ELSE
        -- Insert new user
        INSERT INTO public.users (
            id, phone, email, full_name, country, 
            wallet_address, afc_address, auth_provider, auth_id,
            phone_verified, last_login_at, created_at, updated_at
        ) VALUES (
            COALESCE(p_auth_id, gen_random_uuid()),
            p_phone, p_email, p_full_name, p_country,
            p_wallet_address, p_wallet_address, p_auth_provider, p_auth_id,
            CASE WHEN p_phone IS NOT NULL THEN true ELSE false END,
            NOW(), NOW(), NOW()
        )
        RETURNING * INTO v_user;
    END IF;
    
    RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION upsert_user TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_user TO anon;

-- Add comments
COMMENT ON FUNCTION upsert_user IS 'Create or update user on login. Handles phone updates and prevents duplicates by checking wallet_address, phone, email, and auth_id in priority order.';
