const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    name: String,
    subject: String,
    image: 
      {
        url: String,
        filename: String,
        label: String,
      },
    experience: String,
    qualification: String,
    description: String,
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Mentor", mentorSchema);
