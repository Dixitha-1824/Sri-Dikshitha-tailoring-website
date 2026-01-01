const express = require("express");
const router = express.Router();
const Gold = require("../models/Gold");

const isLoggedIn = require("../middleware/isLoggedIn");
const isAdmin = require("../middleware/isAdmin");

const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary");
const upload = multer({ storage });

// Show all gold items
router.get("/", async (req, res) => {
  const goldItems = await Gold.find({}).sort({ isSold: 1 });
  res.render("gold/index", { goldItems });
});

// Add gold form (admin)
router.get("/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("gold/new");
});

// Create gold item (admin)
router.post(
  "/",
  isLoggedIn,
  isAdmin,
  upload.array("images[]", 5),
  async (req, res) => {
    const { title, descriptionEn, descriptionTe } = req.body || {};

    const gold = new Gold({
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

    await gold.save();
    req.flash("success", "Gold item added");
    res.redirect("/gold");
  }
);

// Show single gold item
router.get("/:id", async (req, res) => {
  const goldItem = await Gold.findById(req.params.id)
    .populate({
      path: "reviews",
      match: { approved: true },
      populate: { path: "author", select: "username" }
    });

  if (!goldItem) {
    req.flash("error", "Gold item not found");
    return res.redirect("/gold");
  }

  res.render("gold/show", { goldItem });
});

// Edit gold form (admin)
router.get("/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  const gold = await Gold.findById(req.params.id);

  if (!gold) {
    req.flash("error", "Gold item not found");
    return res.redirect("/gold");
  }

  res.render("gold/edit", { gold });
});

// Update gold (admin)
router.put(
  "/:id",
  isLoggedIn,
  isAdmin,
  upload.array("images[]", 5),
  async (req, res) => {
    const { title, descriptionEn, descriptionTe, deleteImages } = req.body || {};
    const gold = await Gold.findById(req.params.id);

    if (!gold) {
      req.flash("error", "Gold item not found");
      return res.redirect("/gold");
    }

    gold.title = title;
    gold.description.en = descriptionEn;
    gold.description.te = descriptionTe;

    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : [deleteImages];

      for (let filename of imagesToDelete) {
        await cloudinary.uploader.destroy(filename);
        gold.images = gold.images.filter(
          img => img.filename !== filename
        );
      }
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(f => ({
        url: f.path,
        filename: f.filename
      }));
      gold.images.push(...newImages);
    }

    await gold.save();
    req.flash("success", "Gold item updated");
    res.redirect(`/gold/${gold._id}`);
  }
);

// Delete gold (admin)
router.delete("/:id", isLoggedIn, isAdmin, async (req, res) => {
  const gold = await Gold.findById(req.params.id);

  if (!gold) {
    req.flash("error", "Gold item not found");
    return res.redirect("/gold");
  }

  for (let img of gold.images) {
    await cloudinary.uploader.destroy(img.filename);
  }

  await gold.deleteOne();
  req.flash("success", "Gold item deleted");
  res.redirect("/gold");
});

// Toggle sold / on-sale status
router.post("/:id/toggle", isLoggedIn, isAdmin, async (req, res) => {
  const gold = await Gold.findById(req.params.id);
  gold.isSold = !gold.isSold;
  await gold.save();
  res.redirect("/gold");
});

// Create gold review (customer)
router.post("/:id/reviews", isLoggedIn, async (req, res) => {
  const { rating, commentEn } = req.body;

  const gold = await Gold.findById(req.params.id);
  if (!gold) {
    req.flash("error", "Gold item not found");
    return res.redirect("/gold");
  }

  const Review = require("../models/Review");

  const review = new Review({
    rating,
    comment: commentEn,
    author: req.session.userId,
    gold: gold._id,
    approved: false
  });

  await review.save();

  gold.reviews = gold.reviews || [];
  gold.reviews.push(review._id);
  await gold.save();

  req.flash("success", "Review submitted for admin approval");
  res.redirect(`/gold/${gold._id}`);
});

module.exports = router;
