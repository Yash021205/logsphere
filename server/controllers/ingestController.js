const Telemetry = require("../models/telemetryModel");
const Telemetry5Min = require("../models/telemetry5minModel");
const System = require("../models/systemModel");
const Host = require("../models/hostModel");
const { checkAlerts } = require("../services/alertService");
const { classifyLog } = require("../services/logClassifier");

const ingestTelemetry = async (req, res) => {
  try {
    const data = req.body;
    const io = req.app.get("io");
    if (!data.systemId) {
      return res.status(400).send("systemId missing");
    }
    
    // Verify system authentication
    const system = await System.findOne({
      systemId: data.systemId,
      systemKey: data.systemKey
    });

    if (!system) {
      return res.status(401).send("Invalid system credentials");
    }

    // Host auto-registration
    await Host.findOneAndUpdate(
      { systemId: data.systemId, host: data.host },
      {
        $set: { lastSeen: data.timestamp },
        $setOnInsert: { firstSeen: data.timestamp }
      },
      { upsert: true }
    );

    io.to(data.systemId).emit("host-status", {
      systemId: data.systemId,
      host: data.host,
      lastSeen: data.timestamp,
      status: "ONLINE"
    });

    //  1. Classify logs

    const processedLogs = (data.logs || []).map(log => ({
      message: log.message || log,
      type: classifyLog(log.message || log),
      count: log.count || 1
    }));

    //  2. Generate dynamic threshold alerts
    const alerts = await checkAlerts(data);

    //  3. Baseline calculation
    // Instead of querying heavy raw logs, we fetch the most recent aggregated 5-min baseline
    const latestBaseline = await Telemetry5Min.findOne({
      systemId: data.systemId,
      host: data.host
    }).sort({ timestamp: -1 });

    let avgCPU = 0;
    let avgMem = 0;

    if (latestBaseline) {
      avgCPU = latestBaseline.cpu;
      avgMem = latestBaseline.memory;
    }

    //  4. Anomaly detection
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

    //  5. Store telemetry WITH alerts + classified logs
    const telemetry = new Telemetry({
      systemId: data.systemId,
      host: data.host,
      cpu: data.cpu,
      memory: data.memory,
      processes: data.processes,
      timestamp: data.timestamp,
      logs: processedLogs,
      alerts
    });
    await telemetry.save();

    //  6. Emit real-time telemetry
    io.to(data.systemId).emit("telemetry", {
      systemId: data.systemId,
      host: data.host,
      cpu: data.cpu,
      memory: data.memory,
      logs: processedLogs,
      timestamp: data.timestamp
    });

    //  7. Emit anomalies if found
    if (anomalies.length > 0) {
      const anomalyPayload = anomalies.map(a => ({ ...a, systemId: data.systemId }));
      io.to(data.systemId).emit("anomaly", anomalyPayload);
    }

    res.status(200).send("Telemetry Stored");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error storing telemetry");
  }
};

module.exports = { ingestTelemetry };



