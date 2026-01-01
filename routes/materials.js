const express = require("express");
const router = express.Router();
const Material = require("../models/Material");

const isLoggedIn = require("../middleware/isLoggedIn");
const isAdmin = require("../middleware/isAdmin");

const multer = require("multer");
const { storage, cloudinary } = require("../cloudinary");
const upload = multer({ storage });

// Show all materials
router.get("/", async (req, res) => {
  const materials = await Material.find({}).populate({
    path: "reviews",
    match: { approved: true }
  });

  res.render("materials/index", { materials });
});

// New material form (admin)
router.get("/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("materials/new");
});

// Create material (admin)
router.post(
  "/",
  isLoggedIn,
  isAdmin,
  upload.any(),
  async (req, res) => {
    const { title, descriptionEn, descriptionTe } = req.body || {};

    if (!title) {
      req.flash("error", "Title required");
      return res.redirect("/materials/new");
    }

    const material = new Material({
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

    await material.save();
    req.flash("success", "Material added successfully");
    res.redirect("/materials");
  }
);

// Show single material
router.get("/:id", async (req, res) => {
  const material = await Material.findById(req.params.id).populate({
    path: "reviews",
    match: { approved: true },
    populate: { path: "author", select: "username" }
  });

  if (!material) {
    req.flash("error", "Material not found");
    return res.redirect("/materials");
  }

  res.render("materials/show", { material });
});

// Edit material form (admin)
router.get("/:id/edit", isLoggedIn, isAdmin, async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    req.flash("error", "Material not found");
    return res.redirect("/materials");
  }

  res.render("materials/edit", { material });
});

// Update material (admin)
router.put(
  "/:id",
  isLoggedIn,
  isAdmin,
  upload.any(),
  async (req, res) => {
    const { title, descriptionEn, descriptionTe, deleteImages } = req.body || {};
    const material = await Material.findById(req.params.id);

    if (!material) {
      req.flash("error", "Material not found");
      return res.redirect("/materials");
    }

    material.title = title;
    material.description.en = descriptionEn;
    material.description.te = descriptionTe;

    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : [deleteImages];

      for (let filename of imagesToDelete) {
        await cloudinary.uploader.destroy(filename);
        material.images = material.images.filter(
          img => img.filename !== filename
        );
      }
    }

    if (req.files && req.files.length > 0) {
      material.images.push(
        ...req.files.map(f => ({
          url: f.path,
          filename: f.filename
        }))
      );
    }

    await material.save();
    req.flash("success", "Material updated successfully");
    res.redirect(`/materials/${material._id}`);
  }
);

// Delete material (admin)
router.delete("/:id", isLoggedIn, isAdmin, async (req, res) => {
  const material = await Material.findById(req.params.id);

  if (!material) {
    req.flash("error", "Material not found");
    return res.redirect("/materials");
  }

  for (let img of material.images) {
    await cloudinary.uploader.destroy(img.filename);
  }

  await material.deleteOne();
  req.flash("success", "Material deleted successfully");
  res.redirect("/materials");
});

module.exports = router;
