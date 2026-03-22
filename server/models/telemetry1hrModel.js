const mongoose = require("mongoose");

const Telemetry1HourSchema = new mongoose.Schema({

  systemId: String,
  host: String,

  cpu: Number,
  memory: Number,
  processes: Number,

  timestamp: {
    type: Date,
    index: { expires: 604800 } // 1 week
  }

});

module.exports = mongoose.model("Telemetry1Hour", Telemetry1HourSchema);