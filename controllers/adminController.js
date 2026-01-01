const Design = require("../models/Design");
const Material = require("../models/Material");
const Gold = require("../models/Gold");
const Review = require("../models/Review");
const User = require("../models/User");
const Availability = require("../models/Availability");

// Admin dashboard overview
module.exports.dashboard = async (req, res) => {
  try {
    const designsCount = await Design.countDocuments();
    const materialsCount = await Material.countDocuments();
    const goldCount = await Gold.countDocuments();
    const usersCount = await User.countDocuments();

    const pendingReviewsCount = await Review.countDocuments({
      approved: false
    });

    let status = await Availability.findOne();
    if (!status) {
      status = new Availability({ shopOpen: true });
      await status.save();
    }

    res.render("admin/dashboard", {
      designsCount,
      materialsCount,
      goldCount,
      pendingReviewsCount,
      usersCount,
      shopOpen: status.shopOpen
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to load dashboard");
    res.redirect("/");
  }
};
