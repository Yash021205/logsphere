const mongoose = require("mongoose");

const AlertRuleSchema = new mongoose.Schema({
  cpuThreshold: { type: Number, default: 80 },
  memoryThreshold: { type: Number, default: 85 }
});

module.exports = mongoose.model("AlertRule", AlertRuleSchema);
