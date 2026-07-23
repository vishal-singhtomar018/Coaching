const express = require("express");
const router = express.Router();

const tutorController = require("../controllers/tutorController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const {isTutor}=require("../middleware/tutorMiddleware")


// Student Profile
router.get(
    "/student/:id",
    isLoggedIn,
    isTutor,
    tutorController.studentProfile
);

module.exports = router;