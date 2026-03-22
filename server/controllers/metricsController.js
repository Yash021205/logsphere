const Telemetry = require("../models/telemetryModel");

const getCPU = async (req, res) => {
  try {

    const { last = 30, host, minutes } = req.query;
    const systemId = req.systemId;

    let query = { systemId };

    if (host) {
      query.host = host;
    }

    if (minutes) {
      const secondsAgo = Math.floor(Date.now() / 1000) - (minutes * 60);
      query.timestamp = { $gte: secondsAgo };
    }

    const data = await Telemetry.find(query)
      .sort({ timestamp: minutes ? 1 : -1 })
      .limit(minutes ? 1000 : parseInt(last));

    res.json(data.map(d => ({
      time: d.timestamp,
      value: d.cpu,
      host: d.host
    })));

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching CPU");
  }
};

const getMemory = async (req, res) => {
  try {

    const { last = 30, host, minutes } = req.query;
    const systemId = req.systemId;

    let query = { systemId };

    if (host) {
      query.host = host;
    }

    if (minutes) {
      const secondsAgo = Math.floor(Date.now() / 1000) - (minutes * 60);
      query.timestamp = { $gte: secondsAgo };
    }

    const data = await Telemetry.find(query)
      .sort({ timestamp: minutes ? 1 : -1 })
      .limit(minutes ? 1000 : parseInt(last));

    res.json(data.map(d => ({
      time: d.timestamp,
      value: d.memory,
      host: d.host
    })));

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching memory");
  }
};

const getHostSummary = async (req, res) => {
  try {

    const  systemId  = req.systemId;

    const data = await Telemetry.aggregate([
      { $match: { systemId } },

      { $sort: { timestamp: -1 } },

      {
        $group: {
          _id: "$host",
          cpu: { $first: "$cpu" },
          memory: { $first: "$memory" },
          processes: { $first: "$processes" },
          timestamp: { $first: "$timestamp" }
        }
      },

      {
        $project: {
          _id: 0,
          host: "$_id",
          cpu: 1,
          memory: 1,
          processes: 1,
          timestamp: 1
        }
      }

    ]);

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching host summary");
  }
};

module.exports = { getCPU, getMemory, getHostSummary };
