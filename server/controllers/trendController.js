const Telemetry = require("../models/telemetryModel");

exports.getTrends = async (req, res) => {
  try {
    const { systemId: tokenSystemId, role } = req;
    const { systemId: querySystemId } = req.query;

    let query = {};
    if (role === "Admin") {
      if (querySystemId) query.systemId = querySystemId;
    } else {
      query.systemId = tokenSystemId;
    }

    const data = await Telemetry.find(query)
      .sort({ timestamp: -1 })
      .limit(20);

    if (data.length < 5) return res.json({});

    const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

    const firstHalf = data.slice(10);
    const secondHalf = data.slice(0, 10);

    const cpuOld = avg(firstHalf.map(d => d.cpu));
    const cpuNew = avg(secondHalf.map(d => d.cpu));

    const memOld = avg(firstHalf.map(d => d.memory));
    const memNew = avg(secondHalf.map(d => d.memory));

    const getTrend = (oldVal, newVal) => {
      if (newVal > oldVal * 1.05) return "up";
      if (newVal < oldVal * 0.95) return "down";
      return "stable";
    };

    res.json({
      cpuAvg: cpuNew.toFixed(2),
      cpuTrend: getTrend(cpuOld, cpuNew),
      memAvg: memNew.toFixed(2),
      memTrend: getTrend(memOld, memNew)
    });

  } catch (err) {
    res.status(500).send("Trend error");
  }
};
