const mongoose = require("mongoose");

const tutorEnrollmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  gender: String,

  age: Number,

  maritalStatus: String,

  qualification: String,

  preferredTime: String,

  jobLocation: String,

  experience: String,

  classesTeach: String,

  subjectExpertise: String,

  expectedSalary: String,

  otherSkills: String,

  personalVehicle: String,

  areaCover: String,

  address: String,

  permanentAddress: String,
  email: String,

  contactNumber: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
},
});

module.exports = mongoose.model("TutorEnrollment", tutorEnrollmentSchema);
