import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anon key is missing! Ensure environment variables are set.');
}

export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
