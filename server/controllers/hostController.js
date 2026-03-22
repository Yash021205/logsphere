const Telemetry = require("../models/telemetryModel");

const getHosts = async (req, res) => {
  try {
    const systemId = req.systemId;
    const hosts = await Telemetry.distinct("host", { systemId });
    res.json(hosts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching hosts");
  }
};

const Host = require("../models/hostModel");

const getHostStatus = async (req, res) => {
  try {

    const systemId = req.systemId;

    const hosts = await Host.find({ systemId });

    const now = Date.now();

    const result = hosts.map(h => {

      const diff = now - h.lastSeen;

      return {
        host: h.host,
        status: diff < 15000 ? "ONLINE" : "OFFLINE",
        lastSeen: h.lastSeen
      };

    });

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching host status");
  }
};

module.exports = { getHosts, getHostStatus };
