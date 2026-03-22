const Telemetry = require("../models/telemetryModel");

const getLogs = async (req, res) => {
  try {
    const systemId = req.systemId;
    const data = await Telemetry.find({ systemId })
      .sort({ timestamp: -1 })
      .limit(50);
    const logs = [];

    data.forEach(entry => {
      if (entry.logs && entry.logs.length > 0) {
        entry.logs.forEach(log => {
          logs.push({
            time: entry.timestamp,
            host: entry.host,
            message: log.message || log,
            count: log.count || 1
          });
        });
      }
    });

    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching logs");
  }
};

module.exports = { getLogs };
