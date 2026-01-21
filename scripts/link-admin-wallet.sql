-- Link wallet address to admin@africarailways.com
-- Run this in Supabase SQL Editor

UPDATE public.users 
SET wallet_address = '0xc7beab42acaa7a74609f68fbfcf0f6d165ff69ebf3008569ae747455a3a77710'
WHERE email = 'admin@africarailways.com';

-- Verify the update
SELECT id, email, wallet_address FROM public.users WHERE email = 'admin@africarailways.com';
