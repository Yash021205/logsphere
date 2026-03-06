const Telemetry = require("../models/telemetryModel");

exports.getPrediction = async (req, res) => {
  try {
    const data = await Telemetry.find()
      .sort({ timestamp: -1 })
      .limit(10);

    if (data.length < 5) return res.json({});

    const latest = data[0];
    const oldest = data[data.length - 1];

    const interval = 5; // seconds between samples

    const cpuRate = (latest.cpu - oldest.cpu) / data.length;
    const memRate = (latest.memory - oldest.memory) / data.length;

    const predictTime = (current, rate, threshold) => {
      if (rate <= 0) return "Stable";
      const steps = (threshold - current) / rate;
      return `${Math.max(steps * interval, 0).toFixed(0)} sec`;
    };

    res.json({
      cpuPrediction: predictTime(latest.cpu, cpuRate, 90),
      memPrediction: predictTime(latest.memory, memRate, 90)
    });

  } catch (err) {
    res.status(500).send("Prediction error");
  }
};
