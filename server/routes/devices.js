// server/routes/devices.js

const express = require("express");
const router = express.Router();
const Device = require("../models/device");
const User = require("../models/userModel");
const System = require("../models/systemModel");
const authMiddleware = require("../middleware/authMiddleware");


// ════════════════════════════════════════════════════════════════
// ENDPOINT 1 — Agent announces itself (PUBLIC)
// ════════════════════════════════════════════════════════════════
router.post("/announce", async (req, res) => {
    try {
        const { fingerprint, hostname, platform, agentVersion } = req.body;

        if (!fingerprint || !hostname) {
            return res.status(400).json({ error: "fingerprint and hostname are required" });
        }

        const device = await Device.findOneAndUpdate(
            { fingerprint },
            {
                $set: {
                    hostname,
                    platform: platform || "unknown",
                    agentVersion: agentVersion || "1.0.0",
                    lastSeen: new Date(),
                },
                $setOnInsert: {
                    fingerprint,
                    status: "pending",
                },
            },
            { upsert: true, new: true }
        );

        if (device.status === "claimed" || device.status === "active") {
            return res.json({
                status: device.status,
                message: "Device already claimed"
            });
        }

        return res.json({
            status: "pending",
            message: "Device registered. Waiting to be claimed on dashboard.",
            deviceId: device._id
        });

    } catch (err) {
        console.error("Announce error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ════════════════════════════════════════════════════════════════
// ENDPOINT 2 — Agent polls for credentials (PUBLIC)
// ════════════════════════════════════════════════════════════════
router.get("/credentials", async (req, res) => {
    try {
        const { fingerprint } = req.query;

        if (!fingerprint) {
            return res.status(400).json({ error: "fingerprint is required" });
        }

        const device = await Device.findOne({ fingerprint });

        if (!device) {
            return res.status(404).json({ status: "not_found" });
        }

        if (device.status === "pending") {
            return res.json({ status: "pending" });
        }

        if (device.credentialsDelivered) {
            return res.json({ status: "already_delivered" });
        }

        // First delivery — mark it and return credentials
        device.credentialsDelivered = true;
        device.status = "active";
        await device.save();

        return res.json({
            status: "claimed",
            systemId: device.systemId,
            systemKey: device.systemKey,
        });

    } catch (err) {
        console.error("Credentials error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ════════════════════════════════════════════════════════════════
// ENDPOINT 3 — Dashboard fetches pending devices (PRIVATE)
//
// Admin sees ALL pending devices (their own + their clients')
// Client sees only unclaimed devices (no owner yet)
// ════════════════════════════════════════════════════════════════
router.get("/pending", authMiddleware, async (req, res) => {
    try {
        let query = { status: "pending" };

        if (req.role === "Admin") {
            // Admin sees devices claimed under their email
            // AND devices not yet claimed by anyone
            query = {
                status: "pending",
                $or: [
                    { ownerAdminEmail: req.email },
                    { ownerAdminEmail: null }
                ]
            };
        }
        // Client just sees globally unclaimed devices
        // (they can claim one for themselves)

        const pending = await Device.find(query)
            .select("_id hostname platform agentVersion firstSeen lastSeen")
            .sort({ firstSeen: -1 });

        return res.json({ devices: pending });

    } catch (err) {
        console.error("Pending devices error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


// ════════════════════════════════════════════════════════════════
// ENDPOINT 4 — User claims a device (PRIVATE)
//
// This is the most important endpoint.
// When user clicks [Claim], we:
//   1. Generate systemId + systemKey via device.provision()
//   2. Save ownerEmail + ownerAdminEmail on device
//   3. Update the User record's systemId field
//      (so existing JWT/auth flow keeps working unchanged)
// ════════════════════════════════════════════════════════════════
router.post("/claim/:deviceId", authMiddleware, async (req, res) => {
    try {
        const device = await Device.findById(req.params.deviceId);

        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }

        if (device.status !== "pending") {
            return res.status(400).json({ error: "Device is already claimed" });
        }

        // Generate systemId + systemKey, set status = "claimed"
        device.provision();

        // Store who owns this device (using emails, matching your User model)
        device.ownerEmail = req.email;
        device.ownerAdminEmail = req.role === "Admin" ? req.email : null;

        await device.save();

        await System.create({
            systemId: device.systemId,
            systemKey: device.systemKey
        });
        
        // ── CRITICAL: update the User's systemId ──────────────────────
        // Your existing auth flow puts systemId in the JWT and uses it
        // for all metric queries. We must update the User record so the
        // next time this user logs in, their JWT has the new systemId.
        await User.findOneAndUpdate(
            { email: req.email },
            { $set: { systemId: device.systemId } }
        );

        return res.json({
            message: "Device claimed successfully. Monitoring will start shortly.",
            hostname: device.hostname,
        });

    } catch (err) {
        console.error("Claim error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// ════════════════════════════════════════════════════════════════
// ENDPOINT 5 — User Status is displayed on Dashboard
// ════════════════════════════════════════════════════════════════

router.get("/all", authMiddleware, async (req, res) => {
  try {
    let query = {};

    if (req.role === "Admin") {
      query = {
        status: { $in: ["active", "offline", "claimed"] },
        ownerAdminEmail: req.email
      };
    } else {
      query = {
        status: { $in: ["active", "offline", "claimed"] },
        ownerEmail: req.email
      };
    }

    const devices = await Device.find(query)
      .select("_id hostname platform status lastSeen agentVersion")
      .sort({ lastSeen: -1 });

    return res.json({ devices });

  } catch (err) {
    console.error("All devices error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;