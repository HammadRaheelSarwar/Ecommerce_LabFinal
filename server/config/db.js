const supabase = require('./supabase');

const connectDB = async () => {
  if (supabase) {
    console.log('⚡ Primary Database active: Supabase Cloud (PostgreSQL)');
  } else {
    console.warn('⚠️ Supabase Cloud configuration not detected in .env');
  }
};

module.exports = connectDB;
