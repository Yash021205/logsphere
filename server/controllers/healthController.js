const Telemetry = require("../models/telemetryModel");

exports.getHealth = async (req, res) => {
  try {
    const systemId = req.systemId;
    const latest = await Telemetry.findOne({ systemId }).sort({ timestamp: -1 });

    if (!latest) return res.json({ score: 100, status: "Healthy" });

    // weights
    const cpuWeight = 0.6;
    const memWeight = 0.4;

    const cpuImpact = latest.cpu * cpuWeight;
    const memImpact = latest.memory * memWeight;

    const score = Math.max(0, 100 - (cpuImpact + memImpact));

    let status = "Healthy";
    if (score < 50) status = "Critical";
    else if (score < 80) status = "Warning";

    res.json({
      score: score.toFixed(1),
      status
    });

  } catch (err) {
    res.status(500).send("Health calc error");
  }
};
