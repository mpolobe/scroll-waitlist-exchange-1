import { createClient } from '@supabase/supabase-js';

// Supabase URL should be configured through other means
export const supabase = createClient(
  '',
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
