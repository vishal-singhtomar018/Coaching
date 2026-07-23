const mongoose = require("mongoose");

const studentEnrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  assignedTutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TutorEnrollment",
    default: null,
  },

  studentName: {
    type: String,
    required: true,
  },

  class: {
    type: String,
    required: true,
  },

  subject: {
    type: String,
    required: true,
  },

  school: String,

  board: String,

  medium: String,

  duration: String,

  timeSlot: String,

  currentLocation: String,

  landmark: String,

  permanentAddress: String,

  parentName: {
    type: String,
    required: true,
  },

  parentOccupation: String,

  studentContact: String,

  parentContact: {
    type: String,
    required: true,
  },

  whatsappNumber: String,

  email: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("StudentEnrollment", studentEnrollmentSchema);
