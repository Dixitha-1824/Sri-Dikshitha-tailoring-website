require("dotenv").config();
const mongoose = require("mongoose");
const Design = require("../models/Design");
const designs = require("./designs.json");

async function seedDB() {
  await mongoose.connect(process.env.MONGO_URL);

  console.log("MongoDB connected for seeding");

  await Design.deleteMany({});
  console.log("Old designs deleted");

  await Design.insertMany(designs);
  console.log("Sample designs inserted");

  mongoose.connection.close();
}

seedDB().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
