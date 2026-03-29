const mongoose = require("mongoose");
const User = require("./models/userModel");

async function checkUsers() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/logsphere");
    const users = await User.find({});
    console.log("Users in DB:", users.map(u => ({ email: u.email, role: u.role })));
    mongoose.disconnect();
  } catch (err) {
    console.error("Failed to check users:", err);
    process.exit(1);
  }
}

checkUsers();
