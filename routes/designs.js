const express = require("express");
const router = express.Router();

const Design = require("../models/Design");
const Review = require("../models/Review");
const isLoggedIn = require("../middleware/isLoggedIn");
const isAdmin = require("../middleware/isAdmin");

const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary");
const upload = multer({ storage });

// Show all designs
router.get("/", async (req, res) => {
  const designs = await Design.find({})
    .populate({
      path: "reviews",
      match: { approved: true }
    });

  res.render("designs/index", { designs });
});

// New design form (admin)
router.get("/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("designs/new");
});

// Create design (admin)
router.post(
  "/",
  isLoggedIn,
  isAdmin,
  upload.array("images[]", 5),
  async (req, res) => {
    const { title, descriptionEn, descriptionTe } = req.body || {};

    if (!title) {
      req.flash("error", "Title required");
      return res.redirect("/designs/new");
    }

    const design = new Design({
      title,
      description: {
        en: descriptionEn,
        te: descriptionTe
      },
      images: (req.files || []).map(f => ({
        url: f.path,
        filename: f.filename
      }))
    });

    await design.save();
    req.flash("success", "Design added successfully");
    res.redirect("/designs");
  }
);

// Show single design
router.get("/:id", async (req, res) => {
  const design = await Design.findById(req.params.id)
    .populate({
      path: "reviews",
      match: { approved: true },
      populate: { path: "author", select: "username" }
    });

  if (!design) {
    req.flash("error", "Design not found");
    return res.redirect("/designs");
  }

  res.render("designs/show", { design });
});

// Create review (customer)
router.post(
  "/:id/reviews",
  isLoggedIn,
  async (req, res) => {
    const { rating, commentEn } = req.body;

    const design = await Design.findById(req.params.id);
    if (!design) {
      req.flash("error", "Design not found");
      return res.redirect("/designs");
    }

    const review = new Review({
      rating,
      comment: commentEn,
      author: req.session.userId,
      design: design._id,
      approved: false
    });

    await review.save();

    design.reviews.push(review._id);
    await design.save();

    req.flash("success", "Review sent for admin approval");
    res.redirect(`/designs/${design._id}`);
  }
);

// Edit design form (admin)
router.get("/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  const design = await Design.findById(req.params.id);

  if (!design) {
    req.flash("error", "Design not found");
    return res.redirect("/designs");
  }

  res.render("designs/edit", { design });
});

// Update design (admin)
router.put(
  "/:id",
  isLoggedIn,
  isAdmin,
  upload.array("images[]", 5),
  async (req, res) => {

    const { title, descriptionEn, descriptionTe, deleteImages } = req.body || {};

    const design = await Design.findById(req.params.id);
    if (!design) {
      req.flash("error", "Design not found");
      return res.redirect("/designs");
    }

    design.title = title;
    design.description.en = descriptionEn;
    design.description.te = descriptionTe;

    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : [deleteImages];

      for (let filename of imagesToDelete) {
        await cloudinary.uploader.destroy(filename);
        design.images = design.images.filter(
          img => img.filename !== filename
        );
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        url: f.path,
        filename: f.filename
      }));
      design.images.push(...newImages);
    }

    await design.save();
    req.flash("success", "Design updated successfully");
    res.redirect(`/designs/${design._id}`);
  }
);

// Delete design (admin)
router.delete("/:id", isLoggedIn, isAdmin, async (req, res) => {
  await Design.findByIdAndDelete(req.params.id);
  req.flash("success", "Design deleted successfully");
  res.redirect("/designs");
});

module.exports = router;
