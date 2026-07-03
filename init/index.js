const mongoose = require("mongoose");
const Mentor = require("../models/Mentor");
const data = require("./data");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Database Connected");
  });

async function initDB() {
  await Mentor.deleteMany({});
  await Mentor.insertMany(data);

  console.log("Mentor data inserted");
  process.exit();
}

initDB();