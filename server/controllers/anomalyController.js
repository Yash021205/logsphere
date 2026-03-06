const Telemetry = require("../models/telemetryModel");

const getBaseline = async (req, res) => {
  try {
    const { host } = req.query;
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;

    const query = { timestamp: { $gte: fiveMinutesAgo } };
    if (host) query.host = host;

    const data = await Telemetry.find(query);

    if (data.length === 0) return res.json({ cpu: 0, memory: 0 });

    const avgCPU = data.reduce((sum, d) => sum + d.cpu, 0) / data.length;
    const avgMem = data.reduce((sum, d) => sum + d.memory, 0) / data.length;

    res.json({ cpu: avgCPU, memory: avgMem });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error computing baseline");
  }
};

module.exports = { getBaseline };
