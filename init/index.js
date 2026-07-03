const mongoose = require("mongoose");
const Mentor = require("../models/Mentor");
const data = require("./data");

mongoose
  .connect("mongodb://127.0.0.1:27017/coaching")
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