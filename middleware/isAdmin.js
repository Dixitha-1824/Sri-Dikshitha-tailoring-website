const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      req.flash("error", "Please login as admin first");
      req.session.returnTo = req.originalUrl;

      return req.session.save(() => {
        res.redirect("/login");
      });
    }

    const user = await User.findById(req.session.userId);
    if (!user || user.role !== "admin") {
      req.flash("error", "Access denied");
      return req.session.save(() => {
        res.redirect("/");
      });
    }

    next();

  } catch (err) {
    console.error(err);
    req.flash("error", "Authorization failed");
    res.redirect("/");
  }
};
