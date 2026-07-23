exports.isStudent = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  if (req.session.user.role !== "student") {
    return res.redirect("/");
  }

  next();
};