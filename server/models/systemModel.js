const mongoose = require("mongoose");
const SystemSchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true,
    unique: true
  },
  systemKey: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("System", SystemSchema);