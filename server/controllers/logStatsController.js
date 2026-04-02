const Telemetry = require("../models/telemetryModel");

exports.getLogStats = async (req, res) => {
  let query = { ...req.systemFilter };

  const recent = await Telemetry.find(query).sort({ timestamp: -1 }).limit(50);

  const stats = { Error:0, Warning:0, Network:0, Resource:0, Info:0 };

  recent.forEach(entry => {
    (entry.logs || []).forEach(log => {
      stats[log.type] = (stats[log.type] || 0) + log.count;
    });
  });

  res.json(stats);
};
