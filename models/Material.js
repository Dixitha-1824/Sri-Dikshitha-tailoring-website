const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  url: String,
  filename: String
});

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    images: [imageSchema],

    description: {
      en: String,
      te: String
    },

    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Material", materialSchema);
