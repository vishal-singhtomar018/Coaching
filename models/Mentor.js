const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    name: String,
    subject: String,
    image: {
      url: String,
      filename: String,
    },
    experience: String,
    qualification: String,
    description: String,

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Mentor", mentorSchema);
