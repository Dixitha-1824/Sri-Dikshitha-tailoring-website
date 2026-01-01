const mongoose = require("mongoose");

const goldSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  images: [
    {
      url: String,
      filename: String
    }
  ],

  description: {
    en: String,
    te: String
  },

  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],

  isSold: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Gold", goldSchema);
