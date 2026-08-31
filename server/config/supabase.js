const { createClient } = require('@supabase/supabase-js');

const supabaseUrl =
  process.env.SUPABASE_URL ||
  'https://ofuhcgtdwjehazorqaqu.supabase.co';

const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mdWhjZ3Rkd2plaGF6b3JxYXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1OTg0NSwiZXhwIjoyMTAzNzM1ODQ1fQ.YM3U-4X6Gna7UdISqqwFY6RqoO_W5yWIyYb3oKzML20';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    console.log('⚡ Supabase Client initialized successfully.');
  } catch (err) {
    console.warn('⚠️ Supabase initialization error:', err.message);
  }
} else {
  console.log('ℹ️  Supabase URL/Key not yet provided in .env — using local database.');
}

module.exports = supabase;
