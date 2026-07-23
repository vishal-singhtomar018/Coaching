const router = require("express").Router();

const homeController = require("../controllers/homeController");
const contactController = require("../controllers/contactController");
const authController = require("../controllers/authController");
const sendMail = require("../utils/sendMail");
const { isLoggedIn } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { isUser } = require("../middleware/userMiddleware");
const { isStudent } = require("../middleware/studentMiddleware");
const {isTutor}= require("../middleware/tutorMiddleware");
const StudentEnrollment = require("../models/StudentEnrollment");
const TutorEnrollment = require("../models/TutorEnrollment");
const message = require("../models/Contact");

router.get("/", homeController.home);

router.get("/about", homeController.about);

router.get("/subjects", homeController.subjects);

router.get("/results", homeController.results);

router.get("/gallery", homeController.gallery);
router.get("/enroll-student", isLoggedIn, homeController.studentEnrollmentPage);

router.post("/enroll-student", isLoggedIn, homeController.saveStudent);

router.get("/enroll-tutor", homeController.tutorEnrollmentPage);

router.post("/enroll-tutor", homeController.saveTutor);

router.get("/testimonials", homeController.testimonials);
router.get("/contact", contactController.contact);
router.post("/contact", contactController.submitGeneralContact);

router.get("/mentors/:id/contact", isLoggedIn, contactController.contactPage);
router.post(
  "/mentors/:id/contact",
  isLoggedIn,
  contactController.submitContact,
);
router.get("/login", authController.loginPage);
router.get("/signup", authController.signupPage);

router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.get("/logout", authController.logout);

router.get("/admin-dashboard", isLoggedIn, isAdmin, async (req, res) => {
  const students = await StudentEnrollment.find();
  const approvedTutors = await TutorEnrollment.find({
    status: "approved",
  });

  const pendingTutors = await TutorEnrollment.find({
    status: "pending",
  });

  const messages = await message.find();

  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.role !== "admin") {
    return res.redirect("/");
  }

  res.render("dashboard/admin-dashboard", {
    students,
    approvedTutors,
    pendingTutors,
    messages,
    user: req.session.user,
  });
});

router.get("/admin/students", isLoggedIn, authController.studentsPage);
router.get(
  "/student/dashboard",
  isLoggedIn,
  isStudent,
  authController.dashboard,
);
router.get("/admin/tutors", isLoggedIn, authController.tutorsPage);
router.get("/admin/messages", isLoggedIn, authController.messagesPage);

router.post(
  "/admin/students/:id/delete",
  isLoggedIn,
  isAdmin,
  authController.deleteStudent,
);

router.post(
  "/admin/tutors/:id/delete",
  isLoggedIn,
  isAdmin,
  authController.deleteTutor,
);

router.post(
  "/admin/mentors/:id/delete",
  isLoggedIn,
  isAdmin,
  authController.DeleteMentor,
);

router.post(
  "/admin/messages/:id/delete",
  isLoggedIn,
  isAdmin,
  authController.deleteMessage,
);

router.get("/admin/students/search", isAdmin, authController.searchStudents);

router.get("/admin/tutors/search", isAdmin, authController.searchTutors);
router.get("/admin/mentors/search", isAdmin, authController.searchMentors);
router.get(
  "/tutor/dashboard",
  isLoggedIn,
  isTutor,
  authController.tutorDashboard,
);

router.get(
  "/admin/assign-tutor/:studentId",
  isLoggedIn,
  isAdmin,
  authController.assignTutorPage,
);

router.post(
"/admin/students/:id/assign-tutor",
isLoggedIn,
isAdmin,
authController.assignTutor
);

router.post(
  "/admin/tutors/:id/approve",
  isLoggedIn,
  isAdmin,
  authController.approveTutor,
);

router.post(
  "/admin/tutors/:id/reject",
  isLoggedIn,
  isAdmin,
  authController.rejectTutor,
);
module.exports = router;

router.post(
  "/admin/messages/:id/status",
  isLoggedIn,
  isAdmin,
  authController.updateMessageStatus,
);
