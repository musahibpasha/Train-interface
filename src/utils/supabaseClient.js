// Real Supabase client implementation
import { createClient } from '@supabase/supabase-js';

// Get environment variables from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log configuration status (without exposing sensitive data)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and Anon Key must be defined in environment variables');
} else {
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key is configured:', supabaseAnonKey ? 'Yes' : 'No');
}

// Create Supabase client with additional options
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
});

export default supabase;
