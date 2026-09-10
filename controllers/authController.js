const User = require("../models/User");
const generatePassword = require("generate-password");
const sendMail = require("../utils/sendMail");
const bcrypt = require("bcryptjs");
const Student = require("../models/StudentEnrollment");
const Tutor = require("../models/TutorEnrollment");
const Contact = require("../models/Contact");
const Mentor = require("../models/Mentor");
const TutorChangeRequest = require("../models/TutorChangeRequest");
const Notification = require("../models/Notification");

exports.loginPage = (req, res) => {
  res.render("auth/login");
};

exports.signupPage = (req, res) => {
  // If already logged in, there is no reason to create another student account.
  if (req.session.user) {
    return res.redirect("/");
  }

  res.render("auth/signup", {
    error: false,
    message: false,
    formData: {},
  });
};

// Public signup is ONLY for students.
// Tutor accounts are created by the admin after approving a tutor application.
exports.signup = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!name || !email || !password) {
      return res.status(400).render("auth/signup", {
        error: "Name, email and password are required.",
        message: false,
        formData: { name, email },
      });
    }

    if (password.length < 6) {
      return res.status(400).render("auth/signup", {
        error: "Password must be at least 6 characters.",
        message: false,
        formData: { name, email },
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).render("auth/signup", {
        error: "An account with this email already exists. Please login.",
        message: false,
        formData: { name, email },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Never accept role from req.body. A public signup always creates a student.
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student",
    });

    return res.redirect("/login?signup=success");
  } catch (err) {
    console.log(err);
    return res.status(500).render("auth/signup", {
      error: "Something went wrong. Please try again.",
      message: false,
      formData: {
        name: req.body.name || "",
        email: req.body.email || "",
      },
    });
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

      // if (user.role === "mentor") {
      //   return res.redirect("/mentor/dashboard");
      // }

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

// Normalize comma/space separated text so matching works for values such as
// "Maths, Physics", "Class 9-10" and "Rau, Indore".
const normalizeList = (value) =>
  String(value || "")
    .toLowerCase()
    .split(/[,|/;]+|\s+and\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

const containsMatch = (studentValue, tutorValue) => {
  const studentItems = normalizeList(studentValue);
  const tutorItems = normalizeList(tutorValue);

  return studentItems.some((studentItem) =>
    tutorItems.some(
      (tutorItem) =>
        tutorItem === studentItem ||
        tutorItem.includes(studentItem) ||
        studentItem.includes(tutorItem),
    ),
  );
};

const scoreTutorForStudent = (student, tutor, assignedCount) => {
  let score = 0;
  const reasons = [];

  // Subject is the strongest match.
  if (containsMatch(student.subject, tutor.subjectExpertise)) {
    score += 35;
    reasons.push("Subject");
  }

  // Class compatibility.
  if (containsMatch(student.class, tutor.classesTeach)) {
    score += 25;
    reasons.push("Class");
  }

  // Student location vs tutor coverage/job location.
  if (
    containsMatch(student.currentLocation, tutor.areaCover) ||
    containsMatch(student.currentLocation, tutor.jobLocation)
  ) {
    score += 15;
    reasons.push("Area");
  }

  // Preferred teaching time vs student's requested slot.
  if (containsMatch(student.timeSlot, tutor.preferredTime)) {
    score += 15;
    reasons.push("Time");
  }

  // Reward available capacity. A full tutor gets no capacity points.
  const maxStudents = Number(tutor.maxStudents) || 10;
  if (assignedCount < maxStudents) {
    score += 10;
    reasons.push("Capacity");
  }

  return {
    score: Math.min(score, 100),
    reasons,
    assignedCount,
    maxStudents,
    available: assignedCount < maxStudents,
  };
};

exports.assignTutorPage = async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.params.studentId,
      isDeleted: false,
    });

    if (!student) {
      return res.status(404).send("Student not found");
    }

    const tutors = await Tutor.find({
      status: "approved",
      isDeleted: false,
    });

    const recommendations = await Promise.all(
      tutors.map(async (tutor) => {
        const assignedCount = await Student.countDocuments({
          assignedTutor: tutor._id,
          isDeleted: false,
        });

        return {
          tutor,
          ...scoreTutorForStudent(student, tutor, assignedCount),
        };
      }),
    );

    recommendations.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.assignedCount - b.assignedCount;
    });

    res.render("dashboard/assign-tutor", {
      title: "Assign Tutor",
      student,
      recommendations: recommendations.slice(0, 3),
      tutors: recommendations,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.assignTutor = async (req, res) => {
  try {
    const { tutorId } = req.body;

    if (!tutorId) {
      return res.status(400).send("Please select a tutor");
    }

    const student = await Student.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    const tutor = await Tutor.findOne({
      _id: tutorId,
      status: "approved",
      isDeleted: false,
    });

    if (!student || !tutor) {
      return res.status(404).send("Student or approved tutor not found");
    }

    const assignedCount = await Student.countDocuments({
      assignedTutor: tutor._id,
      isDeleted: false,
    });

    const maxStudents = Number(tutor.maxStudents) || 10;

    if (assignedCount >= maxStudents) {
      return res
        .status(409)
        .send("This tutor has reached the maximum student capacity.");
    }

    await Student.findByIdAndUpdate(
      student._id,
      { assignedTutor: tutor._id },
      { new: true },
    );

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
    })

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


exports.tutorChangeRequests = async (req,res)=>{try{const requests=await TutorChangeRequest.find().populate('student currentTutor').sort({createdAt:-1});res.render('dashboard/tutor-change-requests',{title:'Tutor Change Requests',requests,user:req.session.user});}catch(e){console.log(e);res.status(500).send('Server Error')}};
exports.resolveTutorChangeRequest = async (req,res)=>{try{const request=await TutorChangeRequest.findById(req.params.id).populate('student');if(!request)return res.redirect('/admin/tutor-change-requests');if(req.body.action==='approve'){request.status='approved';request.adminNote=req.body.adminNote||'';request.student.assignedTutor=null;await request.student.save();}else{request.status='rejected';request.adminNote=req.body.adminNote||'';}await request.save();if(request.student.user)await Notification.create({user:request.student.user,title:'Tutor change request '+request.status,message:request.adminNote||('Your tutor change request was '+request.status+'.')});res.redirect('/admin/tutor-change-requests');}catch(e){console.log(e);res.status(500).send('Server Error')}};
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
