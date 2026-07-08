const router = require("express").Router();

const homeController = require("../controllers/homeController");
const contactController = require("../controllers/contactController");
const authController = require("../controllers/authController");
const sendMail = require("../utils/sendMail");
const { isLoggedIn } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { isUser } = require("../middleware/userMiddleware");

router.get("/", homeController.home);

router.get("/about", homeController.about);

router.get("/subjects", homeController.subjects);

router.get("/results", homeController.results);

router.get("/gallery", homeController.gallery);
router.get("/enroll-student", isLoggedIn, homeController.studentEnrollmentPage);

router.post("/enroll-student", homeController.saveStudent);

router.get("/enroll-tutor", isLoggedIn, homeController.tutorEnrollmentPage);

router.post("/enroll-tutor", homeController.saveTutor);

router.get("/testimonials", homeController.testimonials);

router.get("/contact", contactController.contactPage);
router.post("/contact", isLoggedIn, contactController.submitContact);

router.get("/login", authController.loginPage);
router.get("/signup", authController.signupPage);

router.post("/login", authController.login);
router.post("/signup", authController.signup);

router.get("/logout", authController.logout);

router.get("/admin-dashboard", isLoggedIn, isAdmin, (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.role !== "admin") {
    return res.redirect("/");
  }

  res.render("dashboard/admin-dashboard");
});

router.get("/admin/students", isLoggedIn, authController.studentsPage);
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
  "/admin/messages/:id/delete",
  isLoggedIn,
  isAdmin,
  authController.deleteMessage,
);

router.get("/admin/students/search", isAdmin, authController.searchStudents);

router.get("/admin/tutors/search", isAdmin, authController.searchTutors);
module.exports = router;
