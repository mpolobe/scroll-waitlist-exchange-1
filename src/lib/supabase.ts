// supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log warning if credentials are missing (don't throw - let app load)
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not fully configured. Some features may not work.',
    '\nVITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING',
    '\nVITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'
  );
}

// Create client even with empty key - will fail gracefully on API calls
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey || 'placeholder');