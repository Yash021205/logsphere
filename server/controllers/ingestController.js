const Telemetry = require("../models/telemetryModel");
const { checkAlerts } = require("../services/alertService");
const { classifyLog } = require("../services/logClassifier");

const ingestTelemetry = async (req, res) => {
  try {
    const data = req.body;

    // 🔥 1. Classify logs
    const processedLogs = (data.logs || []).map(log => ({
      message: log.message || log,
      type: classifyLog(log.message || log),
      count: log.count || 1
    }));

    // 🔥 2. Generate dynamic threshold alerts
    const alerts = await checkAlerts(data);

    // 🔥 3. Baseline calculation (last 5 minutes)
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;

    const recentData = await Telemetry.find({
      host: data.host,
      timestamp: { $gte: fiveMinutesAgo }
    });

    let avgCPU = 0;
    let avgMem = 0;

    if (recentData.length > 0) {
      avgCPU = recentData.reduce((sum, d) => sum + d.cpu, 0) / recentData.length;
      avgMem = recentData.reduce((sum, d) => sum + d.memory, 0) / recentData.length;
    }

    // 🔥 4. Anomaly detection
    let anomalies = [];

    if (avgCPU > 0 && data.cpu > avgCPU * 1.1) {
      anomalies.push({
        type: "CPU",
        message: "CPU spike detected (above baseline)"
      });
    }

    if (avgMem > 0 && data.memory > avgMem * 1.1) {
      anomalies.push({
        type: "Memory",
        message: "Memory spike detected (above baseline)"
      });
    }

    // 🔥 5. Store telemetry WITH alerts + classified logs
    const telemetry = new Telemetry({
      ...data,
      logs: processedLogs,
      alerts
    });

    await telemetry.save();

    // 🔥 6. Emit real-time telemetry
    const io = req.app.get("io");

    io.emit("telemetry", {
      host: data.host,
      cpu: data.cpu,
      memory: data.memory,
      logs: processedLogs,
      timestamp: data.timestamp
    });

    // 🔥 7. Emit anomalies if found
    if (anomalies.length > 0) {
      io.emit("anomaly", anomalies);
    }

    res.status(200).send("Telemetry Stored");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error storing telemetry");
  }
};

module.exports = { ingestTelemetry };



