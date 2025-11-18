
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing. Please check your .env file.");
  console.error("Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

// Create client with fallback empty strings to prevent crashes during build
// The app will show appropriate error messages if credentials are actually missing at runtime
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
