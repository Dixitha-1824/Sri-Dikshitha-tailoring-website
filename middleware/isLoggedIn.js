module.exports = (req, res, next) => {
  if (!req.session.userId) {
    req.flash("error", "Please login to continue");
    req.session.returnTo = req.originalUrl;

    return req.session.save(() => {
      res.redirect("/login");
    });
  }

  next();
};
