const Telemetry = require("../models/telemetryModel");

const getHosts = async (req, res) => {
  try {
    const hosts = await Telemetry.distinct("host");
    res.json(hosts);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching hosts");
  }
};

module.exports = { getHosts };
