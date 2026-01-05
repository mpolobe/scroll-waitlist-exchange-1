
-- Ensure transactions table exists
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL, -- 'credit', 'debit'
  description TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure railway_bookings table exists
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

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_bookings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own bookings" ON public.railway_bookings;
CREATE POLICY "Users can view own bookings" ON public.railway_bookings FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own bookings" ON public.railway_bookings;
CREATE POLICY "Users can create own bookings" ON public.railway_bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
