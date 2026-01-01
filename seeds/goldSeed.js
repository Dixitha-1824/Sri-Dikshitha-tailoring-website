require("dotenv").config();
const mongoose = require("mongoose");
const Gold = require("../models/Gold");
const goldData = require("./gold.json");

async function seedGold() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    await Gold.deleteMany({});
    await Gold.insertMany(goldData);

    console.log("Gold data seeded successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

seedGold();
