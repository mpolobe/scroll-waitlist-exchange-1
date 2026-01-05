
-- Create routes table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  train_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to routes
DROP POLICY IF EXISTS "Public can view routes" ON public.routes;
CREATE POLICY "Public can view routes" ON public.routes FOR SELECT USING (true);

-- Insert mock data
INSERT INTO public.routes (origin, destination, departure_time, arrival_time, duration, price, available_seats, train_number) VALUES
('Nairobi', 'Mombasa', '08:00', '14:30', '6h 30m', 150, 45, 'ARN-101'),
('Nairobi', 'Mombasa', '14:00', '20:30', '6h 30m', 150, 32, 'ARN-102'),
('Nairobi', 'Mombasa', '20:00', '02:30', '6h 30m', 120, 28, 'ARN-103');
