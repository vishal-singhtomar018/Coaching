const Joi = require("joi");

exports.studentEnrollmentSchema = Joi.object({
  studentName: Joi.string().required().messages({
    "string.empty": "Student name is required",
  }),

  class: Joi.string().required().messages({
    "string.empty": "Class is required",
  }),

  subject: Joi.string().required().messages({
    "string.empty": "Subject is required",
  }),

  school: Joi.string().allow(""),

  board: Joi.string().allow(""),

  medium: Joi.string().allow(""),

  duration: Joi.string().allow(""),

  timeSlot: Joi.string().allow(""),

  currentLocation: Joi.string().allow(""),

  landmark: Joi.string().allow(""),

  permanentAddress: Joi.string().allow(""),

  parentName: Joi.string().required().messages({
    "string.empty": "Parent name is required",
  }),

  parentOccupation: Joi.string().allow(""),

  studentContact: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .allow("")
    .messages({
      "string.pattern.base":
        "Student contact must be a valid 10-digit number",
    }),

  parentContact: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Parent contact must be a valid 10-digit number",
      "string.empty":
        "Parent contact is required",
    }),

  whatsappNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .allow("")
    .messages({
      "string.pattern.base":
        "WhatsApp number must be a valid 10-digit number",
    }),

  email: Joi.string()
    .email()
    .allow("")
    .messages({
      "string.email":
        "Please enter a valid email address",
    }),
});


exports.tutorEnrollmentSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.empty": "Name is required",
      "string.min": "Name must contain at least 3 characters",
    }),

  gender: Joi.string().allow(""),

  age: Joi.number()
    .integer()
    .min(18)
    .max(70)
    .messages({
      "number.min": "Age must be at least 18",
      "number.max": "Age cannot exceed 70",
    }),

  maritalStatus: Joi.string().allow(""),

  qualification: Joi.string()
    .required()
    .messages({
      "string.empty": "Qualification is required",
    }),

  preferredTime: Joi.string().allow(""),

  jobLocation: Joi.string().allow(""),

  experience: Joi.string().allow(""),

  classesTeach: Joi.string()
    .required()
    .messages({
      "string.empty": "Please specify classes you teach",
    }),

  subjectExpertise: Joi.string()
    .required()
    .messages({
      "string.empty": "Subject expertise is required",
    }),

  expectedSalary: Joi.string().allow(""),

  otherSkills: Joi.string().allow(""),

  personalVehicle: Joi.string().allow(""),

  areaCover: Joi.string().allow(""),

  address: Joi.string()
    .required()
    .messages({
      "string.empty": "Address is required",
    }),

  permanentAddress: Joi.string().allow(""),

  email: Joi.string()
    .email()
    .allow("")
    .messages({
      "string.email":
        "Please enter a valid email address",
    }),

  contactNumber: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Please enter a valid 10-digit mobile number",
      "string.empty":
        "Contact number is required",
    }),
});