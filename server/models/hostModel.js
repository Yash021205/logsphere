const mongoose = require("mongoose");

const HostSchema = new mongoose.Schema({

  systemId: {
    type: String,
    required: true,
    index: true
  },

  host: {
    type: String,
    required: true
  },

  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    default: null
  },

  firstSeen: {
    type: Number
  },

  lastSeen: {
    type: Number
  }

});

module.exports = mongoose.model("Host", HostSchema);