const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  shopOpen: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model("Availability", availabilitySchema);
