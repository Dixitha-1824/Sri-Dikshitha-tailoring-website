const express = require("express");
const router = express.Router();

const Review = require("../models/Review");
const Design = require("../models/Design");
const isLoggedIn = require("../middleware/isLoggedIn");

/* =========================
   CUSTOMER: ADD DESIGN REVIEW
   POST /designs/:id/reviews
========================= */
router.post("/designs/:id/reviews", isLoggedIn, async (req, res) => {
  const { rating, commentEn } = req.body;

  const design = await Design.findById(req.params.id);
  if (!design) {
    req.flash("error", "Design not found");
    return res.redirect("/designs");
  }

  const review = new Review({
    rating,
    comment: commentEn,               // ✅ STRING (NOT OBJECT)
    author: req.session.userId,       // ✅ SESSION BASED
    design: design._id,
    approved: false                   // ✅ pending
  });

  await review.save();

  design.reviews.push(review._id);
  await design.save();

  req.flash("success", "Review sent for admin approval");
  res.redirect(`/designs/${design._id}`);
});

module.exports = router;
