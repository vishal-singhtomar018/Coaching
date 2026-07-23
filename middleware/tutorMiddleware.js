exports.isTutor = (req, res, next) => {

    if (
        !req.session.user ||
        req.session.user.role !== "tutor"
    ) {
        return res.redirect("/");
    }

    next();
};