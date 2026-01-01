const express = require("express");
const router = express.Router({ mergeParams: true });

const Material = require("../models/Material");
const Review = require("../models/Review");

const isLoggedIn = require("../middleware/isLoggedIn");

// Create material review
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { rating, commentEn } = req.body;
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) {
      req.flash("error", "Material not found");
      return res.redirect("/materials");
    }

    const review = new Review({
      rating,
      comment: commentEn,
      author: req.session.userId,
      material: material._id,
      approved: false
    });

    await review.save();

    material.reviews.push(review._id);
    await material.save();

    req.flash("success", "Review submitted for approval");
    res.redirect(`/materials/${material._id}`);

  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to submit review");
    res.redirect("/materials");
  }
});

// Delete material review
router.delete("/:reviewId", isLoggedIn, async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Review not found");
      return res.redirect("back");
    }

    // Allow only author or admin
    if (
      !review.author.equals(req.session.userId) &&
      req.session.role !== "admin"
    ) {
      req.flash("error", "Not authorized");
      return res.redirect("back");
    }

    await Material.findByIdAndUpdate(review.material, {
      $pull: { reviews: review._id }
    });

    await review.deleteOne();

    req.flash("success", "Review deleted");
    res.redirect("back");

  } catch (err) {
    console.error(err);
    req.flash("error", "Unable to delete review");
    res.redirect("back");
  }
});

module.exports = router;
