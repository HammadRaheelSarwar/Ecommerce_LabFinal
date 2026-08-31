const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

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
