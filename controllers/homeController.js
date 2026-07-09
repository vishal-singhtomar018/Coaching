const sendMail = require("../utils/sendMail");
const StudentEnrollment = require("../models/StudentEnrollment");
const TutorEnrollment = require("../models/TutorEnrollment");
const Isloggedin = require('../middleware/authMiddleware')
const {
  studentEnrollmentSchema,
  tutorEnrollmentSchema,
} = require("../schemas/validationSchemas");

exports.home = (req, res) => {
  res.render("pages/home");
};

exports.about = (req, res) => {
  res.render("pages/about");
};

exports.subjects = (req, res) => {
  res.render("pages/subjects");
};

exports.results = (req, res) => {
  res.render("pages/results");
};

exports.gallery = (req, res) => {
  res.render("pages/gallery");
};

exports.contact = (req, res) => {
  res.render("pages/contact");
};

exports.testimonials = (req, res) => {
  res.render("pages/testimonials");
};

exports.saveTutor = async (req, res) => {
  try {
    await TutorEnrollment.create({
      name: req.body.name,
      gender: req.body.gender,
      age: req.body.age,
      maritalStatus: req.body.maritalStatus,
      qualification: req.body.qualification,
      preferredTime: req.body.preferredTime,
      jobLocation: req.body.jobLocation,
      experience: req.body.experience,
      classesTeach: req.body.classesTeach,
      subjectExpertise: req.body.subjectExpertise,
      expectedSalary: req.body.expectedSalary,
      otherSkills: req.body.otherSkills,
      personalVehicle: req.body.personalVehicle,
      areaCover: req.body.areaCover,
      address: req.body.address,
      permanentAddress: req.body.permanentAddress,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
    });

    await sendMail(
      "👨‍🏫 Tutor Registration",
      `
    <h2>New Tutor Registration</h2>

    <p><b>Name:</b> ${req.body.name}</p>
    <p><b>Gender:</b> ${req.body.gender}</p>
    <p><b>Age:</b> ${req.body.age}</p>
    <p><b>Marital Status:</b> ${req.body.maritalStatus}</p>
    <p><b>Qualification:</b> ${req.body.qualification}</p>
    <p><b>Experience:</b> ${req.body.experience}</p>
    <p><b>Classes:</b> ${req.body.classesTeach}</p>
    <p><b>Subjects:</b> ${req.body.subjectExpertise}</p>
    <p><b>Expected Salary:</b> ${req.body.expectedSalary}</p>
    <p><b>Preferred Time:</b> ${req.body.preferredTime}</p>
    <p><b>Job Location:</b> ${req.body.jobLocation}</p>
    <p><b>Vehicle:</b> ${req.body.personalVehicle}</p>
    <p><b>Area Cover:</b> ${req.body.areaCover}</p>
    <p><b>Contact:</b> ${req.body.contactNumber}</p>
    <p><b>Address:</b> ${req.body.address}</p>
    <p><b>Permanent Address:</b> ${req.body.permanentAddress}</p>
    <p><b>Other Skills:</b> ${req.body.otherSkills}</p>
  `,
    );

    res.render("pages/enroll-tutor", {
      success: true,
      error: false,
      errors: [],
      formData: {},
    });
  } catch (err) {
    console.log(err);

    res.render("pages/enroll-tutor", {
      success: false,
      error: true,
      errors: [],
      formData: {},
    });
  }
};

exports.saveStudent = async (req, res) => {
  try {
    // Validate form data
    const { error } = studentEnrollmentSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = error.details.map((err) => err.message);

      return res.render("pages/enroll-student", {
        success: false,
        error: false,
        errors,
        formData: req.body,
      });
    }

    // Save student
    await StudentEnrollment.create({
      studentName: req.body.studentName,
      class: req.body.class,
      subject: req.body.subject,
      school: req.body.school,
      board: req.body.board,
      medium: req.body.medium,
      duration: req.body.duration,
      timeSlot: req.body.timeSlot,
      currentLocation: req.body.currentLocation,
      landmark: req.body.landmark,
      permanentAddress: req.body.permanentAddress,
      parentName: req.body.parentName,
      parentOccupation: req.body.parentOccupation,
      studentContact: req.body.studentContact,
      parentContact: req.body.parentContact,
      whatsappNumber: req.body.whatsappNumber,
      email: req.body.email,
    });

    // Send mail
    await sendMail(
      "🎓 Student Enrollment",
      `
      <h2>New Student Enrollment</h2>

      <p><b>Student Name:</b> ${req.body.studentName}</p>
      <p><b>Class:</b> ${req.body.class}</p>
      <p><b>Subject:</b> ${req.body.subject}</p>
      <p><b>School:</b> ${req.body.school}</p>
      <p><b>Board:</b> ${req.body.board}</p>
      <p><b>Medium:</b> ${req.body.medium}</p>
      <p><b>Duration:</b> ${req.body.duration}</p>
      <p><b>Time Slot:</b> ${req.body.timeSlot}</p>
      <p><b>Location:</b> ${req.body.currentLocation}</p>
      <p><b>Landmark:</b> ${req.body.landmark}</p>

      <hr>

      <p><b>Parent Name:</b> ${req.body.parentName}</p>
      <p><b>Parent Occupation:</b> ${req.body.parentOccupation}</p>
      <p><b>Student Contact:</b> ${req.body.studentContact}</p>
      <p><b>Parent Contact:</b> ${req.body.parentContact}</p>
      <p><b>WhatsApp:</b> ${req.body.whatsappNumber}</p>
      <p><b>Email:</b> ${req.body.email}</p>
      `,
    );

    return res.render("pages/enroll-student", {
      success: true,
      error: false,
      errors: [],
      formData: {},
    });
  } catch (err) {
    console.log(err);

    return res.render("pages/enroll-student", {
      success: false,
      error: true,
      errors: ["Something went wrong. Please try again."],
      formData: req.body,
    });
  }
};

exports.tutorEnrollmentPage = (req, res) => {
  res.render("pages/enroll-tutor", {
    success: false,
    error: false,
    errors: [],
    formData: {},
  });
};
exports.studentEnrollmentPage = (req, res) => {
  res.render("pages/enroll-student", {
    success: false,
    error: false,
    errors: [],
    formData: {},
  });
};
