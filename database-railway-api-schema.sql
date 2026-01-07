-- Railway Company API System Schema
-- Allows railway companies to register, get API keys, and manage their stations

-- Railway Companies Table
CREATE TABLE IF NOT EXISTS public.railway_companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  contact_email TEXT NOT NULL UNIQUE,
  contact_phone TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'rejected')),
  api_key TEXT UNIQUE,
  api_secret TEXT,
  webhook_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.users(id)
);

-- Railway Stations Table
CREATE TABLE IF NOT EXISTS public.railway_stations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  station_name TEXT NOT NULL,
  station_code TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  facilities JSONB DEFAULT '[]'::jsonb, -- ['wifi', 'parking', 'restaurant', 'waiting_room']
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Railway Routes Table (managed by companies)
CREATE TABLE IF NOT EXISTS public.railway_company_routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  route_name TEXT NOT NULL,
  origin_station_id UUID REFERENCES public.railway_stations(id),
  destination_station_id UUID REFERENCES public.railway_stations(id),
  train_number TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration_minutes INTEGER,
  distance_km DECIMAL(10, 2),
  price_usd DECIMAL(10, 2) NOT NULL,
  price_afc DECIMAL(10, 2), -- Price in AFC tokens
  available_seats INTEGER DEFAULT 0,
  train_class TEXT DEFAULT 'economy' CHECK (train_class IN ('economy', 'business', 'first')),
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Usage Logs
CREATE TABLE IF NOT EXISTS public.railway_api_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  request_body JSONB,
  response_body JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API Rate Limits
CREATE TABLE IF NOT EXISTS public.railway_api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES public.railway_companies(id) ON DELETE CASCADE,
  requests_per_minute INTEGER DEFAULT 60,
  requests_per_hour INTEGER DEFAULT 1000,
  requests_per_day INTEGER DEFAULT 10000,
  current_minute_count INTEGER DEFAULT 0,
  current_hour_count INTEGER DEFAULT 0,
  current_day_count INTEGER DEFAULT 0,
  last_reset_minute TIMESTAMPTZ DEFAULT NOW(),
  last_reset_hour TIMESTAMPTZ DEFAULT NOW(),
  last_reset_day TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_railway_companies_status ON public.railway_companies(status);
CREATE INDEX IF NOT EXISTS idx_railway_companies_api_key ON public.railway_companies(api_key);
CREATE INDEX IF NOT EXISTS idx_railway_stations_company ON public.railway_stations(company_id);
CREATE INDEX IF NOT EXISTS idx_railway_stations_country ON public.railway_stations(country);
CREATE INDEX IF NOT EXISTS idx_railway_company_routes_company ON public.railway_company_routes(company_id);
CREATE INDEX IF NOT EXISTS idx_railway_company_routes_origin ON public.railway_company_routes(origin_station_id);
CREATE INDEX IF NOT EXISTS idx_railway_company_routes_destination ON public.railway_company_routes(destination_station_id);
CREATE INDEX IF NOT EXISTS idx_railway_api_logs_company ON public.railway_api_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_railway_api_logs_created ON public.railway_api_logs(created_at);

-- Enable Row Level Security
ALTER TABLE public.railway_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_company_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.railway_api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Railway Companies
DROP POLICY IF EXISTS "Railway companies can view their own data" ON public.railway_companies;
CREATE POLICY "Railway companies can view their own data" ON public.railway_companies
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM public.users WHERE email = contact_email
  ));

DROP POLICY IF EXISTS "Railway companies can update their own data" ON public.railway_companies;
CREATE POLICY "Railway companies can update their own data" ON public.railway_companies
  FOR UPDATE USING (auth.uid() IN (
    SELECT user_id FROM public.users WHERE email = contact_email
  ));

-- RLS Policies for Stations
DROP POLICY IF EXISTS "Railway companies can manage their stations" ON public.railway_stations;
CREATE POLICY "Railway companies can manage their stations" ON public.railway_stations
  FOR ALL USING (company_id IN (
    SELECT id FROM public.railway_companies WHERE contact_email IN (
      SELECT email FROM public.users WHERE id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Public can view active stations" ON public.railway_stations;
CREATE POLICY "Public can view active stations" ON public.railway_stations
  FOR SELECT USING (status = 'active');

-- RLS Policies for Routes
DROP POLICY IF EXISTS "Railway companies can manage their routes" ON public.railway_company_routes;
CREATE POLICY "Railway companies can manage their routes" ON public.railway_company_routes
  FOR ALL USING (company_id IN (
    SELECT id FROM public.railway_companies WHERE contact_email IN (
      SELECT email FROM public.users WHERE id = auth.uid()
    )
  ));

DROP POLICY IF EXISTS "Public can view active routes" ON public.railway_company_routes;
CREATE POLICY "Public can view active routes" ON public.railway_company_routes
  FOR SELECT USING (status = 'active');

-- Admin policies
DROP POLICY IF EXISTS "Admins can manage all railway companies" ON public.railway_companies;
CREATE POLICY "Admins can manage all railway companies" ON public.railway_companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.admin_roles 
      WHERE user_id = auth.uid() AND role IN ('super_admin', 'admin')
    )
  );

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_railway_api_key()
RETURNS TEXT AS $$
DECLARE
  api_key TEXT;
BEGIN
  api_key := 'ark_' || encode(gen_random_bytes(32), 'hex');
  RETURN api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate API secret
CREATE OR REPLACE FUNCTION generate_railway_api_secret()
RETURNS TEXT AS $$
DECLARE
  api_secret TEXT;
BEGIN
  api_secret := 'ars_' || encode(gen_random_bytes(48), 'hex');
  RETURN api_secret;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate API keys on approval
CREATE OR REPLACE FUNCTION auto_generate_api_credentials()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    IF NEW.api_key IS NULL THEN
      NEW.api_key := generate_railway_api_key();
    END IF;
    IF NEW.api_secret IS NULL THEN
      NEW.api_secret := generate_railway_api_secret();
    END IF;
    NEW.approved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_generate_api_credentials ON public.railway_companies;
CREATE TRIGGER trigger_auto_generate_api_credentials
  BEFORE UPDATE ON public.railway_companies
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_api_credentials();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
DROP TRIGGER IF EXISTS update_railway_companies_updated_at ON public.railway_companies;
CREATE TRIGGER update_railway_companies_updated_at
  BEFORE UPDATE ON public.railway_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_railway_stations_updated_at ON public.railway_stations;
CREATE TRIGGER update_railway_stations_updated_at
  BEFORE UPDATE ON public.railway_stations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_railway_company_routes_updated_at ON public.railway_company_routes;
CREATE TRIGGER update_railway_company_routes_updated_at
  BEFORE UPDATE ON public.railway_company_routes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample African railway companies
INSERT INTO public.railway_companies (company_name, country, contact_email, contact_phone, website, status) VALUES
  ('Kenya Railways Corporation', 'Kenya', 'api@krc.co.ke', '+254-20-221211', 'https://www.krc.co.ke', 'approved'),
  ('TAZARA Railway', 'Tanzania', 'api@tazara.co.tz', '+255-22-286-0340', 'https://www.tazara.co.tz', 'approved'),
  ('Zambia Railways', 'Zambia', 'api@zrl.com.zm', '+260-211-229501', 'https://www.zrl.com.zm', 'approved'),
  ('South African Rail Commuter Corporation', 'South Africa', 'api@prasa.com', '+27-11-773-5000', 'https://www.prasa.com', 'pending'),
  ('Nigerian Railway Corporation', 'Nigeria', 'api@nrc.gov.ng', '+234-1-263-5560', 'https://www.nrc.gov.ng', 'pending')
ON CONFLICT (company_name) DO NOTHING;

-- Insert sample stations for Kenya Railways
INSERT INTO public.railway_stations (company_id, station_name, station_code, city, country, latitude, longitude, facilities) 
SELECT 
  id,
  'Nairobi Central Station',
  'NBO-CENTRAL',
  'Nairobi',
  'Kenya',
  -1.2864,
  36.8172,
  '["wifi", "parking", "restaurant", "waiting_room", "atm"]'::jsonb
FROM public.railway_companies WHERE company_name = 'Kenya Railways Corporation'
ON CONFLICT (station_code) DO NOTHING;

INSERT INTO public.railway_stations (company_id, station_name, station_code, city, country, latitude, longitude, facilities) 
SELECT 
  id,
  'Mombasa Terminus',
  'MBA-TERMINUS',
  'Mombasa',
  'Kenya',
  -4.0435,
  39.6682,
  '["wifi", "parking", "restaurant", "waiting_room"]'::jsonb
FROM public.railway_companies WHERE company_name = 'Kenya Railways Corporation'
ON CONFLICT (station_code) DO NOTHING;

COMMENT ON TABLE public.railway_companies IS 'Railway companies registered to use Africa Railways API';
COMMENT ON TABLE public.railway_stations IS 'Railway stations managed by registered companies';
COMMENT ON TABLE public.railway_company_routes IS 'Routes operated by railway companies';
COMMENT ON TABLE public.railway_api_logs IS 'API usage logs for monitoring and analytics';
COMMENT ON TABLE public.railway_api_rate_limits IS 'Rate limiting configuration per company';
