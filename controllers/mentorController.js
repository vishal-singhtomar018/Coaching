const Mentor = require("../models/Mentor");

// All mentors page
exports.mentorsPage = async (req, res) => {
  try {
    const mentors = await Mentor.find();

    res.render("pages/mentors", {
      mentors,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

// Single mentor details page
exports.mentorDetails = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id);

    if (!mentor) {
      return res.redirect("/mentors");
    }

    res.render("pages/mentor-details", {
      mentor,
      user: req.session.user,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/mentors");
  }
};

// Join tutor page
exports.joinTutorPage = (req, res) => {
  res.render("pages/join-tutor", {
    user: req.session.user,
  });
};

// Open Add Mentor Form
exports.addMentorPage = (req, res) => {
  res.render("dashboard/add-mentor", {
    user: req.session.user,
  });
};

// Save mentor
exports.addMentor = async (req, res) => {
  try {
    await Mentor.create({
      name: req.body.name,
      subject: req.body.subject,
      experience: req.body.experience,
      qualification: req.body.qualification,
      description: req.body.description,
      image: {
        url: req.file.path,
        filename: req.file.filename,
      },
    });

    res.redirect("/mentors");
  } catch (err) {
    console.log(err);
    res.redirect("/admin/mentors/add");
  }
};
