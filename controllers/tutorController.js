const Tutor = require("../models/TutorEnrollment");
const Student = require("../models/StudentEnrollment");

exports.studentProfile = async (req, res) => {
    try {

        const tutor = await Tutor.findOne({
            user: req.session.user.id,
        });

        if (!tutor) {
            return res.redirect("/");
        }

        const student = await Student.findOne({
            _id: req.params.id,
            assignedTutor: tutor._id,
            isDeleted: false,
        }).populate("assignedTutor");

        if (!student) {
            return res.status(404).render("pages/404");
        }

        res.render("tutor/student-profile", {
            title: "Student Profile",
            tutor,
            student,
            user: req.session.user,
        });

    } catch (err) {

        console.log(err);

        res.status(500).send("Server Error");
    }
};