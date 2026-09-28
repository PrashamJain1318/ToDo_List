const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return true;
  }
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn('⚠️ Running in fallback mode. In-memory storage will be used if MongoDB is unreachable.');
    return false;
  }
};

module.exports = connectDB;
