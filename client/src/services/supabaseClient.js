import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://ofuhcgtdwjehazorqaqu.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mdWhjZ3Rkd2plaGF6b3JxYXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTk4NDUsImV4cCI6MjEwMzczNTg0NX0.g0l3oqd01FUnPh3J9bYOutaNJqRlL7IT7idJ8jpMlAs'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
