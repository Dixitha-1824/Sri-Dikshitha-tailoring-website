const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const designReviewSchema = new Schema(
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

    design: {
      type: Schema.Types.ObjectId,
      ref: "Design"
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

module.exports = mongoose.model("DesignReview", designReviewSchema);
