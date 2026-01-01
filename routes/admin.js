const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/isLoggedIn");
const isAdmin = require("../middleware/isAdmin");

const adminController = require("../controllers/adminController");
const Availability = require("../models/Availability");
const Review = require("../models/Review");

// Protect all admin routes
router.use(isLoggedIn, isAdmin);

// Admin root
router.get("/", (req, res) => {
  res.redirect("/admin/dashboard");
});

// Dashboard
router.get("/dashboard", adminController.dashboard);

// Toggle shop open / close
router.put("/shop-toggle", async (req, res) => {
  try {
    let status = await Availability.findOne();

    if (!status) {
      status = new Availability({ shopOpen: true });
    } else {
      status.shopOpen = !status.shopOpen;
      status.updatedAt = Date.now();
    }

    await status.save();
    req.flash("success", "Shop availability updated");
    res.redirect("/admin/dashboard");

  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to update shop status");
    res.redirect("/admin/dashboard");
  }
});

// View all reviews
router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate("author", "username")
      .populate("design", "title")
      .populate("material", "title")
      .populate("gold", "title")
      .sort({ approved: 1, createdAt: -1 });

    res.render("admin/reviews", { reviews });

  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to load reviews");
    res.redirect("/admin/dashboard");
  }
});

// Approve review
router.put("/reviews/:id/approve", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect("/admin/reviews");
    }

    review.approved = true;
    await review.save();

    req.flash("success", "Review approved");

    if (review.design) return res.redirect(`/designs/${review.design}`);
    if (review.material) return res.redirect(`/materials/${review.material}`);
    if (review.gold) return res.redirect(`/gold/${review.gold}`);

    res.redirect("/admin/reviews");

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to approve review");
    res.redirect("/admin/reviews");
  }
});

// Delete review
router.delete("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect("/admin/reviews");
    }

    await review.deleteOne();

    req.flash("success", "Review deleted");
    res.redirect("/admin/reviews");

  } catch (err) {
    console.error(err);
    req.flash("error", "Failed to delete review");
    res.redirect("/admin/reviews");
  }
});

module.exports = router;
