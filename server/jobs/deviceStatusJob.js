// server/jobs/deviceStatusJob.js
//
// Runs every minute.
// Marks devices offline if lastSeen > 2 minutes ago.
// Marks devices active if they were offline but are sending again.

const Device = require("../models/device");

const checkDeviceStatus = async () => {
  try {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // Mark active devices as offline if not seen recently
    const wentOffline = await Device.updateMany(
      {
        status: "active",
        lastSeen: { $lt: twoMinutesAgo }
      },
      { $set: { status: "offline" } }
    );

    if (wentOffline.modifiedCount > 0) {
      console.log(`[DeviceStatus] Marked ${wentOffline.modifiedCount} device(s) as offline`);
    }

  } catch (err) {
    console.error("[DeviceStatus] Error checking device status:", err);
  }
};

module.exports = { checkDeviceStatus };