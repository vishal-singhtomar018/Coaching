const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async ({ to, replyTo, subject, html }) => {
  console.log(to);
  await transporter.sendMail({
    from: `"Knowledge Home Tutor" <${process.env.EMAIL_USER}>`,
    to,
    replyTo,
    subject,
    html,
  });
};

module.exports = sendMail;
