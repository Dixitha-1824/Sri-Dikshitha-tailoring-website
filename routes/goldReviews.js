const express = require("express");
const router = express.Router({ mergeParams: true });

const Gold = require("../models/Gold");
const Review = require("../models/Review");

const isLoggedIn = require("../middleware/isLoggedIn");

// Create gold review
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { rating, commentEn } = req.body;
    const { id } = req.params;

    const gold = await Gold.findById(id);
    if (!gold) {
      req.flash("error", "Gold item not found");
      return res.redirect("/gold");
    }

    const review = new Review({
      rating,
      comment: commentEn,
      author: req.session.userId,
      gold: gold._id,
      approved: false
    });

    await review.save();

    gold.reviews.push(review._id);
    await gold.save();

    req.flash("success", "Review submitted for approval");
    res.redirect(`/gold/${gold._id}`);

  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to submit review");
    res.redirect("/gold");
  }
});

module.exports = router;
