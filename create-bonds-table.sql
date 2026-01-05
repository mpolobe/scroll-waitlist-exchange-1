-- Create Bonds table for Institutional Treasury
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

-- Enable RLS
ALTER TABLE public.bonds ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Admins can manage bonds" ON public.bonds;
CREATE POLICY "Admins can manage bonds" ON public.bonds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles ar
      JOIN public.admin_users au ON au.role_id = ar.id
      WHERE au.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Everyone can view active bonds" ON public.bonds;
CREATE POLICY "Everyone can view active bonds" ON public.bonds
  FOR SELECT USING (status = 'active');
