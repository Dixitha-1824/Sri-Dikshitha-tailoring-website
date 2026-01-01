const User = require("../models/User");

// Admin registration
module.exports.register = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      req.flash("error", "All fields are required");
      return res.redirect("/register");
    }

    if (password.length < 6) {
      req.flash("error", "Password must be at least 6 characters");
      return res.redirect("/register");
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { phone }]
    });

    if (existingUser) {
      req.flash("error", "Username or phone already exists");
      return res.redirect("/register");
    }

    const user = new User({ username, phone, password });
    await user.save();

    req.flash("success", "Registration successful. Please login.");
    res.redirect("/login");

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong. Try again.");
    res.redirect("/register");
  }
};
