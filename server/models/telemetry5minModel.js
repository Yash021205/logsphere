const mongoose = require("mongoose");

const Telemetry5MinSchema = new mongoose.Schema({

  systemId: String,
  host: String,

  cpu: Number,
  memory: Number,
  processes: Number,

  timestamp: {
    type: Date,
    index: { expires: 86400 } // 1 day
  }

});

module.exports = mongoose.model("Telemetry5Min", Telemetry5MinSchema);