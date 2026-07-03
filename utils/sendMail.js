const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (subject, html) => {
  await transporter.sendMail({
    from: `"${process.env.ACADEMY_NAME}" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    html,
  });
};

module.exports = sendMail;
