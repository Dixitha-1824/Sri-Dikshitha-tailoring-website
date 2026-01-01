const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer"
      }
    },

    comment: {
      type: String,
      required: true,
      trim: true
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
      default: null
    },

    material: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
      default: null
    },

    gold: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gold",
      default: null
    },

    approved: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

// Ensure review belongs to exactly one item
reviewSchema.pre("validate", function () {
  const targets = [this.design, this.material, this.gold].filter(Boolean);

  if (targets.length !== 1) {
    throw new Error("Review must belong to exactly one item");
  }
});

module.exports = mongoose.model("Review", reviewSchema);
