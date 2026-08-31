const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;

  if (process.env.SUPABASE_URL) {
    console.log('⚡ Primary Database configured: Supabase Cloud (PostgreSQL)');
  }

  const uri = process.env.MONGODB_URI;
  if (!uri && (process.env.SUPABASE_URL || process.env.VERCEL)) {
    // Only Supabase is configured / Vercel serverless without MongoDB URI
    return;
  }

  const mongoUri = uri || 'mongodb://127.0.0.1:27017/all_available';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    if (process.env.SUPABASE_URL || process.env.VERCEL) {
      console.log('ℹ️  MongoDB connection skipped, running seamlessly with Supabase.');
    } else {
      console.warn('⚠️ MongoDB connection could not be established:', err.message);
    }
  }
};

module.exports = connectDB;
