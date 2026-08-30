const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/all_available';
  let retries = 5;

  while (retries > 0) {
    try {
      await mongoose.connect(uri);
      console.log('✅ MongoDB connected:', mongoose.connection.host);
      return;
    } catch (err) {
      retries -= 1;
      console.error(`❌ MongoDB connection failed. Retries left: ${retries}`);
      if (retries === 0) {
        console.error('Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
};

module.exports = connectDB;
