const Telemetry = require("../models/telemetryModel");
const Telemetry5Min = require("../models/telemetry5minModel");
const Telemetry1Hour = require("../models/telemetry1hrModel");
const aggregate5Min = async () => {

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);

  const data = await Telemetry.aggregate([
    { $match: { timestamp: { $gte: fiveMinAgo } } },

    {
      $group: {
        _id: {
          systemId: "$systemId",
          host: "$host"
        },
        cpu: { $avg: "$cpu" },
        memory: { $avg: "$memory" },
        processes: { $avg: "$processes" }
      }
    }
  ]);

  for (const d of data) {
    await Telemetry5Min.create({
      systemId: d._id.systemId,
      host: d._id.host,
      cpu: d.cpu,
      memory: d.memory,
      processes: d.processes,
      timestamp: new Date()
    });
  }

  console.log("5-min aggregation done");
};

const aggregate1Hour = async () => {

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const data = await Telemetry5Min.aggregate([
    { $match: { timestamp: { $gte: oneHourAgo } } },

    {
      $group: {
        _id: {
          systemId: "$systemId",
          host: "$host"
        },
        cpu: { $avg: "$cpu" },
        memory: { $avg: "$memory" },
        processes: { $avg: "$processes" }
      }
    }
  ]);

  for (const d of data) {
    await Telemetry1Hour.create({
      systemId: d._id.systemId,
      host: d._id.host,
      cpu: d.cpu,
      memory: d.memory,
      processes: d.processes,
      timestamp: new Date()
    });
  }

  console.log("1-hour aggregation done");
};

module.exports = { aggregate5Min, aggregate1Hour };