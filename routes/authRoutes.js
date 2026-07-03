const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const { isLoggedIn } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const { isUser } = require("../middleware/userMiddleware");

router.get(
  "/admin-dashboard",
  isLoggedIn,
  isAdmin,
  (req, res) => {
    res.render("dashboard/admin-dashboard");
  }
);

// router.get(
//   "/user-dashboard",
//   isLoggedIn,
//   isUser,
//   (req, res) => {
//     res.render("dashboard/user-dashboard");
//   }
// );

module.exports = router;