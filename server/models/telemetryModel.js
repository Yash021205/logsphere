const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema({
  host: String,
  cpu: Number,
  memory: Number,
  processes: Number,
  logs: Array,
  alerts: Array,  
  timestamp: Number
});

module.exports = mongoose.model("Telemetry", TelemetrySchema);
