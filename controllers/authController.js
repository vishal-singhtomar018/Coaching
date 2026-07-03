const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentEnrollment");
const Tutor = require("../models/TutorEnrollment");
const contact = require("../models/contact");

exports.loginPage = (req, res) => {
  res.render("auth/login");
};

exports.signupPage = (req, res) => {
  res.render("auth/signup");
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send("User already exists");
    }

    // Allow only one admin
    if (role === "admin") {
      const adminExists = await User.exists({
        role: "admin",
      });

      if (adminExists) {
        return res.send("Admin account already exists.");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    req.session.user = {
      id: user._id,
      role: user.role,
      name: user.name,
    };

    req.session.save((err) => {
      if (err) return res.send("Session Error");

      if (user.role === "admin") {
        return res.redirect("/admin-dashboard");
      }

      return res.redirect("/");
    });

  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });

    if (!user) {
      return res.send("Invalid credentials");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Invalid credentials");
    }

    req.session.user = {
      id: user._id,
      role: user.role,
      name: user.name,
    };

    req.session.save((err) => {
      if (err) {
        return res.send("Session Error");
      }

      if (user.role === "admin") {
        return res.redirect("/admin-dashboard");
      }

      return res.redirect("/");
    });
  } catch (err) {
    console.log(err);
    res.send("Something went wrong");
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send("Logout failed");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

exports.studentsPage = async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    res.render("dashboard/admin-students", {
      title: "Manage Students",
      students,
      user: req.session.user,
    });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.tutorsPage = async (req, res) => {
  try {
    const tutors = await Tutor.find().sort({
      createdAt: -1,
    });

    res.render("dashboard/admin-tutors", {
      title: "Manage Tutors",
      tutors,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.messagesPage = async (req, res) => {
  try {
    const messages = await contact.find().sort({
      createdAt: -1,
    });

    res.render("dashboard/admin-messages", {
      title: "Messages",
      messages,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};


exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);

    res.redirect("/admin/students");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete student");
  }
};


exports.deleteTutor = async (req, res) => {
  try {
    await Tutor.findByIdAndDelete(req.params.id);

    res.redirect("/admin/tutors");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete tutor");
  }
};

const Contact = require("../models/contact");

exports.deleteMessage = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);

    res.redirect("/admin/messages");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete message");
  }
};