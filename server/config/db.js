const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (err) {
    if (retries === 0) {
      console.error('[MongoDB] Max retries reached. Exiting.');
      process.exit(1);
    }
    console.warn(`[MongoDB] Connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} attempts left)`);
    setTimeout(() => connectDB(retries - 1), RETRY_DELAY_MS);
  }
};

module.exports = connectDB;
