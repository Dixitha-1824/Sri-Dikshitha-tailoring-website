require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");

const Availability = require("./models/Availability");
const User = require("./models/User");

const authRoutes = require("./routes/auth");
const designRoutes = require("./routes/designs");
const designReviewRoutes = require("./routes/designReviews");
const materialRoutes = require("./routes/materials");
const materialReviewRoutes = require("./routes/materialReviews");
const goldRoutes = require("./routes/gold");
const adminRoutes = require("./routes/admin");
const goldReviewRoutes = require("./routes/goldReviews");

// Database connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.set("trust proxy", 1);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use(session({
  name: "sri-deekshitha-session",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
    sameSite: "lax"
  }
}));

app.use(flash());

// Make user & flash available in all views
app.use(async (req, res, next) => {
  res.locals.currentUser = null;

  if (req.session.userId) {
    try {
      res.locals.currentUser = await User.findById(req.session.userId);
    } catch {
      req.session.userId = null;
    }
  }

  res.locals.flashSuccess = req.flash("success");
  res.locals.flashError = req.flash("error");

  next();
});

// Home page
app.get("/", async (req, res) => {
  let status = await Availability.findOne();

  if (!status) {
    status = new Availability({ shopOpen: true });
    await status.save();
  }

  res.render("home", { status });
});

// Routes
app.use("/", authRoutes);

app.use("/designs", designRoutes);
app.use("/designs/:designId/reviews", designReviewRoutes);

app.use("/materials", materialRoutes);
app.use("/materials/:materialId/reviews", materialReviewRoutes);

app.use("/gold", goldRoutes);
app.use("/gold/:id/reviews", goldReviewRoutes);

// Admin routes
app.use("/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
