
-- Insert mock transactions if a user exists
-- NOTE: This script requires at least one user in the public.users table (or auth.users if you modify the query)

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to get a user ID from public.users
  SELECT id INTO v_user_id FROM public.users LIMIT 1;
  
  -- If no user in public.users, try to get from auth.users (if you have permissions)
  -- IF v_user_id IS NULL THEN
  --   SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  -- END IF;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.transactions (user_id, amount, type, description, status, created_at) VALUES
    (v_user_id, 125.00, 'credit', 'Payment from John Doe', 'completed', NOW() - INTERVAL '1 day'),
    (v_user_id, 89.50, 'credit', 'Payment from Jane Smith', 'completed', NOW() - INTERVAL '2 days'),
    (v_user_id, 234.00, 'debit', 'Refund to Bob Johnson', 'pending', NOW() - INTERVAL '3 days'),
    (v_user_id, 67.25, 'credit', 'Payment from Alice Brown', 'completed', NOW() - INTERVAL '4 days');
    
    RAISE NOTICE 'Seeded transactions for user %', v_user_id;
  ELSE
    RAISE NOTICE 'No user found to seed transactions. Please create a user first.';
  END IF;
END $$;
