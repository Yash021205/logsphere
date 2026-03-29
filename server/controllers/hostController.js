const Telemetry = require("../models/telemetryModel");

const getHosts = async (req, res) => {
  try {
    const { systemId: tokenSystemId, role } = req;
    const { systemId: querySystemId } = req.query;

    let query = {};
    if (role === "Admin") {
      if (querySystemId) query.systemId = querySystemId;
    } else {
      query.systemId = tokenSystemId;
    }

    const hosts = await Telemetry.distinct("host", query);
    res.json(hosts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching hosts");
  }
};

const Host = require("../models/hostModel");

const getHostStatus = async (req, res) => {
  try {

    const { systemId: tokenSystemId, role } = req;
    const { systemId: querySystemId } = req.query;

    let query = {};
    if (role === "Admin") {
      if (querySystemId) query.systemId = querySystemId;
    } else {
      query.systemId = tokenSystemId;
    }

    const hosts = await Host.find(query);

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
