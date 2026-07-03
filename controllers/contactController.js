const Contact = require("../models/Contact");
const transporter = require("../utils/mailer");
const sendMail = require("../utils/sendMail");

exports.contactPage = (req, res) => {
  res.render("pages/contact", {
    success: false,
    error: false,
    errors: [],
    formData: {},
  });
};
exports.submitContact = async (req, res) => {
  try {
    const contact = await Contact.create({
      parentName: req.body.parentName,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message,
    });

    // Admin Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Coaching Enrollment Inquiry",
      html: `
        <h2>New Student Inquiry</h2>

        <p><strong>Name:</strong> ${contact.parentName}</p>
        <p><strong>Phone:</strong> ${contact.phone}</p>
        <p><strong>Email:</strong> ${contact.email || "Not Provided"}</p>
        <p><strong>Subject:</strong> ${contact.subject || "Not Provided"}</p>
        <p><strong>Grade:</strong> ${contact.grade || "Not Provided"}</p>
        <p><strong>Message:</strong> ${contact.message || "No Message"}</p>
      `,
    });

    // Auto Reply
    if (contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: contact.email,
        subject: "Thank You For Contacting Us",
        html: `
      <h2>Thank You, ${contact.parentName}!</h2>
      <p>We have successfully received your inquiry.</p>
      <p>Our academic counselor will contact you shortly.</p>
      <br>
      <p>Regards,<br>
      Knowledge Home Tutor & Coaching Classes</p>
    `,
      });
    }
    return res.render("pages/contact", {
      success: true,
      error: false,
      errors: [],
      formData: {},
    });
  } catch (err) {
    console.log(err);

    // Mongoose Validation Errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);

      return res.render("pages/contact", {
        success: false,
        error: false,
        errors,
        formData: req.body,
      });
    }

    return res.render("pages/contact", {
      success: false,
      error: true,
      errors: ["Something went wrong. Please try again."],
      formData: req.body,
    });
  }
};
