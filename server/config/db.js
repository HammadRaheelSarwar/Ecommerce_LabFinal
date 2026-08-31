const mongoose = require('mongoose');

const connectDB = async () => {
  if (process.env.SUPABASE_URL) {
    console.log('⚡ Primary Database configured: Supabase Cloud (PostgreSQL)');
  }

  const uri = process.env.MONGODB_URI;
  if (!uri && process.env.SUPABASE_URL) {
    // Only Supabase is used, MongoDB not requested
    return;
  }

  const mongoUri = uri || 'mongodb://127.0.0.1:27017/all_available';
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    if (process.env.SUPABASE_URL) {
      console.log('ℹ️  MongoDB connection skipped, running seamlessly with Supabase.');
    } else {
      console.warn('⚠️ MongoDB connection could not be established:', err.message);
    }
  }
};

module.exports = connectDB;
