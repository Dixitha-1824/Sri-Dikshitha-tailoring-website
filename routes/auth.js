const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register
router.get("/register", (req, res) => {
  res.render("auth/register");
});

router.post("/register", async (req, res) => {
  try {
    const { username, phone, countryCode, password } = req.body;

    if (!username || !phone || !countryCode || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    const fullPhone = `${countryCode}${phone}`;

    const existingUser = await User.findOne({
      $or: [{ username }, { phone: fullPhone }]
    });

    if (existingUser) {
      req.flash("error", "Username or phone already exists");
      return res.redirect("/register");
    }

    // Password hashing handled in User model
    const user = new User({
      username,
      phone: fullPhone,
      password
    });

    await user.save();

    req.flash("success", "Registration successful. Please login.");
    res.redirect("/login");

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Try again.");
    res.redirect("/register");
  }
});

// Login
router.get("/login", (req, res) => {
  res.render("auth/login");
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/login");
    }

    const user = await User.findOne({ username });
    if (!user) {
      req.flash("error", "Invalid username or password");
      return req.session.save(() => res.redirect("/login"));
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      req.flash("error", "Invalid username or password");
      return req.session.save(() => res.redirect("/login"));
    }

    req.session.userId = user._id;
    req.session.role = user.role;

    req.flash("success", `Welcome ${user.username}`);
    req.session.save(() => res.redirect("/"));

  } catch (err) {
    console.error(err);
    req.flash("error", "Login failed. Try again.");
    res.redirect("/login");
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.flash("success", "Logged out successfully");
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      return res.redirect("/");
    }
    res.clearCookie("sri-deekshitha-session");
    res.redirect("/");
  });
});

module.exports = router;
