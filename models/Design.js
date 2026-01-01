const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: String,
  filename: String
});

const designSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      en: String,
      te: String
    },

    images: [imageSchema],

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Design", designSchema);
