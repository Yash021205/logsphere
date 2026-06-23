const Telemetry = require("../models/telemetryModel");

const getLogs = async (req, res) => {
  try {
    const { host } = req.query;

    let query = { ...req.systemFilter };

    if (host) query.host = host;

    const data = await Telemetry.find(query)
      .sort({ timestamp: -1 })
      .limit(20)
      .select("timestamp host logs");
      
    const logs = [];

    data.forEach(entry => {
      if (entry.logs && entry.logs.length > 0) {
        entry.logs.forEach(log => {
          if (logs.length >= 100) return; // cap at 100 total logs
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
