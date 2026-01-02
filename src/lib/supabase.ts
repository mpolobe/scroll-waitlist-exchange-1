import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with Vercel Supabase project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://llvprbmrnjvamjzavmhg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
