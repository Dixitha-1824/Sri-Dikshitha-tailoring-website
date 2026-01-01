const express = require("express");
const router = express.Router();

const Design = require("../models/Design");
const Review = require("../models/Review");
const isLoggedIn = require("../middleware/isLoggedIn");

// Add design review (customer)
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { rating, commentEn } = req.body;
    const { designId } = req.params;

    const design = await Design.findById(designId);
    if (!design) {
      req.flash("error", "Design not found");
      return res.redirect("/designs");
    }

    const review = new Review({
      rating,
      comment: commentEn,
      author: req.session.userId,
      design: design._id
    });

    await review.save();

    design.reviews.push(review._id);
    await design.save();

    req.flash("success", "Review submitted for approval");
    res.redirect(`/designs/${designId}`);

  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to submit review");
    res.redirect("/designs");
  }
});

module.exports = router;
