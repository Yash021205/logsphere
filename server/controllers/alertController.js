const Telemetry = require("../models/telemetryModel");

const getAlerts = async (req, res) => {
  const systemId = req.systemId;
  const data = await Telemetry.find({ systemId, alerts: { $ne: [] } })
    .sort({ timestamp: -1 })
    .limit(10);

  res.json(data.map(d => d.alerts).flat());
};

module.exports = { getAlerts };
