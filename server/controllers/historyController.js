const Telemetry = require("../models/telemetryModel");

exports.getComparison = async (req, res) => {
  try {
    const systemId = req.systemId;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const todayStart = new Date(now - oneDay);
    const yesterdayStart = new Date(now - 2 * oneDay);

    const todayData = await Telemetry.find({
      systemId,
      timestamp: { $gte: todayStart }
    });

    const yesterdayData = await Telemetry.find({
      systemId,
      timestamp: { $gte: yesterdayStart, $lt: todayStart }
    });

    const avg = arr => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

    const todayCPU = avg(todayData.map(d => d.cpu));
    const todayMem = avg(todayData.map(d => d.memory));

    const yCPU = avg(yesterdayData.map(d => d.cpu));
    const yMem = avg(yesterdayData.map(d => d.memory));

    const change = (t, y) => (((t - y) / (y || 1)) * 100).toFixed(1);

    res.json({
      cpu: {
        today: todayCPU.toFixed(2),
        yesterday: yCPU.toFixed(2),
        change: change(todayCPU, yCPU)
      },
      memory: {
        today: todayMem.toFixed(2),
        yesterday: yMem.toFixed(2),
        change: change(todayMem, yMem)
      }
    });

  } catch (err) {
    res.status(500).send("Comparison error");
  }
};
