require("dotenv").config();

const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
// const adminRoutes = require("./routes/admin");
// const userRoutes = require("./routes/user");
const mentorRoutes = require("./routes/mentorRoutes");
const session = require("express-session");
const User = require("./models/User");

connectDB();
const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(express.json());

app.use(express.static("public"));

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "coaching-secret-key",
    resave: false,
    saveUninitialized: false,

    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
    },
  }),
);


app.use(async (req, res, next) => {
  res.locals.user = req.session.user || null;

  res.locals.adminExists = await User.exists({
    role: "admin",
  });

  next();
});

app.locals.site = {
  name: process.env.ACADEMY_NAME,
  phone: process.env.PHONE,
  email: process.env.EMAIL,
  address: process.env.ADDRESS,
};

app.use("/", require("./routes/web"));
app.use("/", mentorRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
