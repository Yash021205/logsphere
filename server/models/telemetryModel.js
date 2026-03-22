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
  timestamp: {
    type: Date,
    index: { expires: 3600 }
  }
});

module.exports = mongoose.model("Telemetry", TelemetrySchema);
