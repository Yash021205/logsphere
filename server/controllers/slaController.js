const Telemetry = require("../models/telemetryModel");

exports.checkSLA = async (req, res) => {
  try {
    const systemId = req.systemId;
    const fiveMinutesAgo = new Date(Date.now() - 300 * 1000);

    const recent = await Telemetry.find({
      systemId,
      timestamp: { $gte: fiveMinutesAgo }
    });

    if (recent.length === 0) return res.json({ violation: false });

    const highCpu = recent.filter(d => d.cpu > 85).length;
    const highMem = recent.filter(d => d.memory > 85).length;

    const cpuRatio = highCpu / recent.length;
    const memRatio = highMem / recent.length;

    const violation = cpuRatio > 0.7 || memRatio > 0.7;

    res.json({
      violation,
      reason:
        cpuRatio > 0.7 ? "CPU overloaded for sustained period" :
        memRatio > 0.7 ? "Memory overloaded for sustained period" :
        null
    });

  } catch (err) {
    res.status(500).send("SLA check error");
  }
};
