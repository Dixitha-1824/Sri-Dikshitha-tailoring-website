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

/* =========================
   DATABASE
========================= */
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* =========================
   APP CONFIG
========================= */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.set("trust proxy", 1); // 🔥 REQUIRED for Render + Mobile

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

/* =========================
   SESSION (FINAL FIX)
========================= */
app.use(
  session({
    name: "sri-deekshitha-session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true, // 🔥 IMPORTANT
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 🔥 mobile fix
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use(flash());

/* =========================
   GLOBAL MIDDLEWARE
========================= */
app.use(async (req, res, next) => {
  try {
    res.locals.currentUser = null;

    if (req.session.userId) {
      res.locals.currentUser = await User.findById(req.session.userId);
    }

    res.locals.flashSuccess = req.flash("success");
    res.locals.flashError = req.flash("error");

    next(); // ✅ ALWAYS REACHED
  } catch (err) {
    console.error("Global middleware error:", err);
    next(err); // 🔥 important
  }
});

/* =========================
   HOME
========================= */
app.get("/", async (req, res) => {
  let status = await Availability.findOne();

  if (!status) {
    status = new Availability({ shopOpen: true });
    await status.save();
  }

  res.render("home", { status });
});

/* =========================
   ROUTES
========================= */
app.use("/", authRoutes);

app.use("/designs", designRoutes);
app.use("/designs/:designId/reviews", designReviewRoutes);

app.use("/materials", materialRoutes);
app.use("/materials/:materialId/reviews", materialReviewRoutes);

app.use("/gold", goldRoutes);
app.use("/gold/:id/reviews", goldReviewRoutes);

app.use("/admin", adminRoutes);

/* =========================
   ERROR HANDLER (IMPORTANT)
========================= */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error", { err });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
