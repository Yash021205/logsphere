const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema({
  systemId: {
    type: String,
    required: true,
    index:true
  },
  host: String,
  cpu: Number,
  memory: Number,
  processes: Number,
  logs: Array,
  alerts: Array,  
  timestamp: Number
});

module.exports = mongoose.model("Telemetry", TelemetrySchema);
