const Telemetry = require("../models/telemetryModel");

const getBaseline = async (req, res) => {
  try {
    const { host, systemId: querySystemId } = req.query;
    const { systemId: tokenSystemId, role } = req;
    const fiveMinutesAgo = new Date(Date.now() - 300 * 1000);

    let query = { timestamp: { $gte: fiveMinutesAgo } };
    
    if (role === "Admin") {
      if (querySystemId) query.systemId = querySystemId;
    } else {
      query.systemId = tokenSystemId;
    }

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
