// server/jobs/deviceStatusJob.js
//
// Runs every minute.
// Marks devices offline if lastSeen > 2 minutes ago.
// Emits socket event so dashboard updates in real-time.

const Device = require("../models/device");

let _io = null;

const setIo = (io) => { _io = io; };

const checkDeviceStatus = async () => {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Find devices about to go offline (so we can emit events with details)
    const goingOffline = await Device.find({
      status: "active",
      lastSeen: { $lt: twoMinutesAgo }
    });

    if (goingOffline.length > 0) {
      // Mark active devices as offline if not seen recently
      await Device.updateMany(
        {
          status: "active",
          lastSeen: { $lt: twoMinutesAgo }
        },
        { $set: { status: "offline" } }
      );

      console.log(`[DeviceStatus] Marked ${goingOffline.length} device(s) as offline`);

      // Emit socket event for each device that went offline
      if (_io) {
        for (const device of goingOffline) {
          if (device.systemId) {
            _io.to(device.systemId).emit("device-status", {
              deviceId: device._id,
              hostname: device.hostname,
              status: "offline",
              systemId: device.systemId
            });
          }
        }
      }
    }

  } catch (err) {
    console.error("[DeviceStatus] Error checking device status:", err);
  }
};

module.exports = { checkDeviceStatus, setIo };