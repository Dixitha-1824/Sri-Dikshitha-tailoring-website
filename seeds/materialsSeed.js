require("dotenv").config();
const mongoose = require("mongoose");
const Material = require("../models/Material");
const materialsData = require("./materials.json");

async function seedMaterials() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB connected");

    await Material.deleteMany({});
    await Material.insertMany(materialsData);

    console.log("Materials data seeded successfully");
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

seedMaterials();
