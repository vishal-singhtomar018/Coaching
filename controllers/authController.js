const User = require("../models/User");
const generatePassword = require("generate-password");
const sendMail = require("../utils/sendMail");
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
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    req.session.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    req.session.save((err) => {
      if (err) {
        return res.send("Session Error");
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
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.send("Invalid email or password");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.send("Invalid email or password");
    }

    req.session.user = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    console.log(user.role);

    req.session.save((err) => {
      if (err) {
        return res.send("Session Error");
      }

      if (user.role === "admin") {
        return res.redirect("/admin-dashboard");
      }

      if (user.role === "student") {
        return res.redirect("/student/dashboard");
      }

      if (user.role === "tutor") {
        return res.redirect("/tutor/dashboard");
      }

      if (user.role === "mentor") {
        return res.redirect("/mentor/dashboard");
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
    })
      .populate("assignedTutor")
      .sort({
        createdAt: -1,
      });

    const tutors = await Tutor.find({
      status: "approved",
      isDeleted: false,
    });

    res.render("dashboard/admin-students", {
      title: "Manage Students",
      students,
      tutors,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send("Server Error");
  }
};

exports.dashboard = async (req, res) => {
  try {
    const student = await Student.findOne({
      user: req.session.user.id,
      isDeleted: false,
    }).populate("assignedTutor");

    console.log(student);
    // Student has not completed enrollment
    if (!student) {
      return res.render("dashboard/complete-profile", {
        title: "Complete Your Profile",
        user: req.session.user,
      });
    }

    // Student profile exists
    return res.render("dashboard/student-dashboard", {
      title: "Student Dashboard",
      student,
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
      status: "approved",
    }).sort({
      createdAt: -1,
    });

    res.render("dashboard/admin-tutors", {
      title: "Approved Tutors",
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
    await Contact.findByIdAndDelete(req.params.id);

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

exports.assignTutorPage = async (req, res) => {
  const student = await Student.findById(req.params.studentId);

  const tutors = await TutorEnrollment.find({
    isDeleted: false,
  });

  res.render("dashboard/assign-tutor", {
    student,
    tutors,
  });
};

exports.assignTutor = async (req, res) => {
  try {
    const { tutorId } = req.body;

    console.log("Student ID:", req.params.id);
    console.log("Tutor ID:", tutorId);

    const students = await Student.findByIdAndUpdate(
      req.params.id,
      {
        assignedTutor: tutorId,
      },
      {
        new: true,
      }
    );

    console.log(students);

    res.redirect("/admin/students");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.approveTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);

    if (!tutor) return res.redirect("/admin/tutors");

    if (tutor.status === "approved") return res.redirect("/admin/tutors");

    // Prevent duplicate accounts
    const alreadyExists = await User.findOne({
      email: tutor.email,
    });

    if (alreadyExists) return res.send("Tutor account already exists.");

    // Generate temporary password
    const tempPassword = generatePassword.generate({
      length: 10,
      numbers: true,
    });

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create login account
    const user = await User.create({
      name: tutor.name,
      email: tutor.email,
      password: hashedPassword,
      role: "tutor",
    });

    // Update tutor application
    tutor.status = "approved";
    tutor.user = user._id;
    tutor.approvedAt = new Date();

    await tutor.save();

    // Email credentials
    await sendMail({
      to: tutor.email,
      subject: "Tutor Application Approved",
      html: `
                <h2>Congratulations ${tutor.name} 🎉</h2>

                <p>Your tutor application has been approved.</p>

                <h3>Login Details</h3>

                <p><b>Email:</b> ${tutor.email}</p>

                <p><b>Password:</b> ${tempPassword}</p>

                <p>
                    Please login and change your password immediately.
                </p>
            `,
    });

    res.redirect("/admin/tutors");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.rejectTutor = async (req, res) => {
  try {
    await Tutor.findByIdAndUpdate(req.params.id, {
      status: "rejected",
    });

    res.redirect("/admin/pending-tutors");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, {
      status: req.body.status,
    });

    res.redirect("/admin/messages");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.tutorDashboard = async (req, res) => {
  try {
    console.log("hit dashboard");
    const tutor = await Tutor.findOne({
      user: req.session.user.id,
    });

    if (!tutor) {
      return res.redirect("/");
    }

    const students = await Student.find({
      assignedTutor: tutor._id,

      isDeleted: false,
    });
    res.render("dashboard/tutor-dashboard", {
      title: "Tutor Dashboard",
      tutor,
      students,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
