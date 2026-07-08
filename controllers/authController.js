const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentEnrollment");
const Tutor = require("../models/TutorEnrollment");
const Contact = require("../models/Contact");
const Mentor = require("../models/Mentor");

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
    const students = await Student.find({
      isDeleted: false,
    }).sort({
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
    const tutors = await Tutor.find({
      isDeleted: false,
    }).sort({
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
    const messages = await Contact.find().sort({
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
    await Student.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });

    res.redirect("/admin/students");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete student");
  }
};

exports.deleteTutor = async (req, res) => {
  try {
    await Tutor.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });

    res.redirect("/admin/tutors");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete tutor");
  }
};
exports.DeleteMentor = async (req, res) => {
  console.log("hit delete route")
  try {
    await Mentor.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });

    res.redirect("/mentors");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete Mentor");
  }
};


exports.deleteMessage = async (req, res) => {
  try {
    await contact.findByIdAndDelete(req.params.id);

    res.redirect("/admin/messages");
  } catch (err) {
    console.log(err);
    res.status(500).send("Unable to delete message");
  }
};

exports.searchStudents = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const students = await Student.find({
      studentName: {
        $regex: keyword,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    res.render("dashboard/Search", {
      title: "Student Search",
      students,
      search: keyword,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.searchTutors = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const tutors = await Tutor.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).sort({ createdAt: -1 });

    res.render("dashboard/tutor", {
      title: "Tutor Search",
      tutors,
      search: keyword,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};


exports.searchMentors = async (req, res) => {
  try {
    const keyword = req.query.q || "";

    const mentors = await Mentor.find({
      name: {
        $regex: keyword,
        $options: "i",
      },
    }).sort({
      createdAt: -1,
    });

    res.render("dashboard/searchMentors", {
      title: "Mentor Search",
      mentors,
      search: keyword,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
