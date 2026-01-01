const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const materialReviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      en: String,
      te: String
    },

    material: {
      type: Schema.Types.ObjectId,
      ref: "Material"
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    approved: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaterialReview", materialReviewSchema);
