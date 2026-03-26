const mongoose = require("mongoose");
const System = require("./models/systemModel");

async function seed() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/logsphere");
    console.log("Connected to MongoDB for seeding");

    const systemId = "native-laptop";
    const systemKey = "secret-key";

    const existing = await System.findOne({ systemId });
    if (existing) {
      console.log("System already exists");
    } else {
      await new System({ systemId, systemKey }).save();
      console.log("System seeded: native-laptop / secret-key");
    }

    mongoose.disconnect();
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
