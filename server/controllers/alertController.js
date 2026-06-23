const Telemetry = require("../models/telemetryModel");
const AlertRule  = require("../models/alertruleModel");

const getAlerts = async (req, res) => {
  // Get the current threshold rule for this system
  const systemId = req.systemFilter?.systemId;
  const rule = typeof systemId === "string"
    ? await AlertRule.findOne({ systemId })
    : null;

  // Default thresholds if no rule saved yet
  const cpuThreshold    = rule?.cpuThreshold    ?? 80;
  const memoryThreshold = rule?.memoryThreshold ?? 85;

  // Fetch the most recent telemetry point(s) for this system
  const recent = await Telemetry.find(req.systemFilter)
    .sort({ timestamp: -1 })
    .limit(5);

  if (!recent.length) return res.json([]);

  // Re-evaluate alerts live against current thresholds
  const alerts = [];
  for (const d of recent) {
    if (d.cpu > cpuThreshold) {
      alerts.push({
        type:    "CPU",
        message: `CPU at ${d.cpu.toFixed(1)}% — above ${cpuThreshold}% threshold`,
        level:   d.cpu > cpuThreshold + 10 ? "CRITICAL" : "WARNING"
      });
    }
    if (d.memory > memoryThreshold) {
      alerts.push({
        type:    "Memory",
        message: `Memory at ${d.memory.toFixed(1)}% — above ${memoryThreshold}% threshold`,
        level:   d.memory > memoryThreshold + 10 ? "CRITICAL" : "WARNING"
      });
    }
    // Stop after first point that has a breach, to avoid spamming duplicates
    if (alerts.length) break;
  }

  res.json(alerts);
};

module.exports = { getAlerts };
