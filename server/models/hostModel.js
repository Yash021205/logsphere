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

  firstSeen: {
    type: Number
  },

  lastSeen: {
    type: Number
  }

});

module.exports = mongoose.model("Host", HostSchema);