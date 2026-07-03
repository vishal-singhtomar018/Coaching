const express = require("express");
const router = express.Router();

const mentorController = require("../controllers/mentorController");
const { upload } = require("../utils/cloudinary");

// All mentors
router.get("/mentors", mentorController.mentorsPage);

router.get("/mentors/:id", mentorController.mentorDetails);

router.get("/join-tutor", mentorController.joinTutorPage);

router.get("/admin/mentors/add", mentorController.addMentorPage);

router.post(
  "/admin/mentors/add",
  upload.single("image"),
  mentorController.addMentor,
);
module.exports = router;
