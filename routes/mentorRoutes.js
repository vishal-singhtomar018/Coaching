const express = require("express");
const router = express.Router();

const mentorController = require("../controllers/mentorController");
const { upload } = require("../utils/cloudinary");
const { isLoggedIn } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// All mentors
router.get("/mentors", mentorController.mentorsPage);

router.get("/mentors/:id",isLoggedIn, mentorController.mentorDetails);

router.get("/join-tutor", mentorController.joinTutorPage);

router.get("/admin/mentors/add",isLoggedIn, isAdmin, mentorController.addMentorPage);

router.post(
  "/admin/mentors/add",
  upload.single("image"),
  mentorController.addMentor,
);
module.exports = router;
