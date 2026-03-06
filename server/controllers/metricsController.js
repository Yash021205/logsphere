const Telemetry = require("../models/telemetryModel");

const getCPU = async (req, res) => {
  try {
    const { last = 30, host, minutes } = req.query;

    let query = host ? { host } : {};

    //  If time range provided, override 'last'
    if (minutes) {
      const secondsAgo = Math.floor(Date.now() / 1000) - (minutes * 60);
      query.timestamp = { $gte: secondsAgo };
    }

    const data = await Telemetry.find(query)
      .sort({ timestamp: minutes ? 1 : -1 })
      .limit(minutes ? 1000 : parseInt(last)); // limit safety

    res.json(data.map(d => ({
      time: d.timestamp,
      value: d.cpu
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching CPU");
  }
};

const getMemory = async (req, res) => {
  try {
    const { last = 30, host, minutes } = req.query;

    let query = host ? { host } : {};

    if (minutes) {
      const secondsAgo = Math.floor(Date.now() / 1000) - (minutes * 60);
      query.timestamp = { $gte: secondsAgo };
    }

    const data = await Telemetry.find(query)
      .sort({ timestamp: minutes ? 1 : -1 })
      .limit(minutes ? 1000 : parseInt(last));

    res.json(data.map(d => ({
      time: d.timestamp,
      value: d.memory
    })));
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching memory");
  }
};

module.exports = { getCPU, getMemory };


