const mongoose = require('mongoose');

function getMongoUri() {
  const fromEnv = process.env.MONGODB_URI;
  return fromEnv && fromEnv.length > 0
    ? fromEnv
    : 'mongodb://localhost:27017/library_app';
}

async function connectToDatabase() {
  const mongoUri = getMongoUri();
  try {
    await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

module.exports = { connectToDatabase };


