// server/models/Device.js

const mongoose = require("mongoose");
const crypto = require("crypto");

const DeviceSchema = new mongoose.Schema(
    {
        // ── Identity (set by agent before claiming) ──────────────────
        fingerprint: {
            type: String,
            required: true,
            unique: true,  // one record per physical machine
            index: true,
        },
        hostname: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            enum: ["windows", "linux", "unknown"],
            default: "unknown",
        },
        agentVersion: {
            type: String,
            default: "1.0.0",
        },

        // ── Lifecycle status ─────────────────────────────────────────
        status: {
            type: String,
            enum: ["pending", "claimed", "active", "offline"],
            default: "pending",
            index: true,
        },

        // ── Credentials (assigned only after claiming) ────────────────
        systemId: {
            type: String,
            unique: true,
            sparse: true,   // allows multiple nulls (unclaimed devices)
        },
        systemKey: {
            type: String,
            sparse: true,
        },

        // ── Ownership ─────────────────────────────────────────────────
        ownerEmail: {
            type: String,
            default: null,
            index: true
        },
        ownerAdminEmail: {
            type: String,
            default: null,
            index: true
        },

        // ── Security: credentials delivered only once ─────────────────
        credentialsDelivered: {
            type: Boolean,
            default: false,
        },

        // ── Timestamps ────────────────────────────────────────────────
        firstSeen: { type: Date, default: Date.now },
        claimedAt: { type: Date, default: null },
        lastSeen: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

// Auto-generate systemId and systemKey when a device is claimed
DeviceSchema.methods.provision = function () {
    this.systemId = crypto.randomUUID();
    this.systemKey = crypto.randomBytes(32).toString("hex"); // 64-char hex
    this.status = "claimed";
    this.claimedAt = new Date();
};

module.exports = mongoose.model("Device", DeviceSchema);