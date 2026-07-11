const Contact = require("../models/Contact");
const transporter = require("../utils/mailer");
const sendMail = require("../utils/sendMail");
const Mentor = require("../models/Mentor");

exports.contact = (req, res) => {
  res.render("pages/contact", {
    mentor: null,
    success: false,
    error: false,
    errors: [],
    formData: {},
    user: req.session.user,
  });
};

exports.contactPage = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.redirect("/mentors");
    }

    res.render("pages/contact", {
      mentor,
      success: false,
      error: false,
      errors: [],
      formData: {},
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/mentors");
  }
};
exports.submitGeneralContact = async (req, res) => {
  try {
    const contact = await Contact.create({
      parentName: req.body.parentName,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message,
    });

    let replyEmail = contact.email;

    if (req.session.user && req.session.user.email) {
      replyEmail = req.session.user.email;
    }

    await sendMail({
      to: process.env.ADMIN_EMAIL,
      replyTo: replyEmail,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Enquiry</h2>

        <p><strong>Name:</strong> ${contact.parentName}</p>

        <p><strong>Email:</strong> ${replyEmail}</p>

        <p><strong>Phone:</strong> ${contact.phone}</p>

        <p><strong>Message:</strong></p>

        <p>${contact.message}</p>
      `,
    });

    if (contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      await sendMail({
        to: contact.email,
        replyTo: process.env.EMAIL_USER,
        subject: "Thank You For Contacting Us",
        html: `
          <h2>Thank You, ${contact.parentName}!</h2>

          <p>We have received your enquiry successfully.</p>

          <p>Our team will contact you shortly.</p>

          <br>

          <p>Regards,<br>
          Knowledge Home Tutor & Coaching Classes</p>
        `,
      });
    }

    res.render("pages/contact", {
      mentor: null,
      success: true,
      error: false,
      errors: [],
      formData: {},
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);

    const errors =
      err.name === "ValidationError"
        ? Object.values(err.errors).map((e) => e.message)
        : ["Something went wrong. Please try again."];

    res.render("pages/contact", {
      mentor: null,
      success: false,
      error: err.name !== "ValidationError",
      errors,
      formData: req.body,
      user: req.session.user,
    });
  }
};
exports.submitContact = async (req, res) => {
  try {
    // Find mentor
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.redirect("/mentors");
    }

    // Save enquiry
    const contact = await Contact.create({
      mentor: mentor._id,
      parentName: req.body.parentName,
      phone: req.body.phone,
      email: req.body.email,
      message: req.body.message,
    });

    // Determine sender details
    let replyEmail = contact.email;
    let senderRole = "Guest";

    if (req.session.user) {
      senderRole =
        req.session.user.role.charAt(0).toUpperCase() +
        req.session.user.role.slice(1);

      if (req.session.user.email) {
        replyEmail = req.session.user.email;
      }
    }

    // Send enquiry to mentor
    await sendMail({
      to: mentor.email,
      replyTo: replyEmail,
      subject: `[${senderRole}] New Enquiry - ${mentor.subject}`,
      html: `
        <h2>New Student Enquiry</h2>

        <hr>

        <p><strong>Submitted By:</strong> ${senderRole}</p>

        <p><strong>Mentor:</strong> ${mentor.name}</p>

        <p><strong>Subject:</strong> ${mentor.subject}</p>

        <hr>

        <p><strong>Name:</strong> ${contact.parentName}</p>

        <p><strong>Email:</strong> ${replyEmail}</p>

        <p><strong>Phone:</strong> ${contact.phone}</p>

        <p><strong>Message:</strong></p>

        <p>${contact.message || "No Message"}</p>
      `,
    });

    // Auto reply
    if (contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      await sendMail({
        to: contact.email,
        replyTo: process.env.EMAIL_USER,
        subject: "Thank You for Contacting Knowledge Home Tutor",
        html: `
          <h2>Thank You, ${contact.parentName}!</h2>

          <p>We have successfully received your enquiry.</p>

          <p>Your enquiry has been forwarded to our
          <strong>${mentor.subject}</strong> mentor.</p>

          <p><strong>Mentor:</strong> ${mentor.name}</p>

          <p>Our mentor will contact you shortly.</p>

          <br>

          <p>Regards,</p>

          <p><strong>Knowledge Home Tutor & Coaching Classes</strong></p>
        `,
      });
    }

    return res.render("pages/contact", {
      mentor,
      success: true,
      error: false,
      errors: [],
      formData: {},
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);

    const mentor = await Mentor.findById(req.params.id);

    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((e) => e.message);

      return res.render("pages/contact", {
        mentor,
        success: false,
        error: false,
        errors,
        formData: req.body,
        user: req.session.user,
      });
    }

    return res.render("pages/contact", {
      mentor,
      success: false,
      error: true,
      errors: ["Something went wrong. Please try again."],
      formData: req.body,
      user: req.session.user,
    });
  }
};
