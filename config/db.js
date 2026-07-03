const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);

    isConnected = db.connections[0].readyState === 1;

    console.log("MongoDB Connected");
  } catch (err) {
    console.error(err);
    throw err;
  }
}

module.exports = connectDB;