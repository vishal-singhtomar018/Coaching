// const router = require("express").Router();

// router.get("/dashboard", (req, res) => {
//   if (!req.session.user) {
//     return res.redirect("/login");
//   }

//   if (req.session.user.role !== "admin") {
//     return res.redirect("/");
//   }

//   res.render("dashboard/admin-dashboard");
// });

// module.exports = router;