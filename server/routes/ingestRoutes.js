const express = require("express");
const rateLimit = require("express-rate-limit");
const { ingestTelemetry } = require("../controllers/ingestController");

const router = express.Router();

const ingestLimiter = rateLimit({
  windowMs: 5 * 1000, 
  max: 5, // Limit each specific host to 5 requests per 5 seconds
  message: "Too many telemetry requests from this host",
  keyGenerator: (req) => {
    // Key by systemId and host if available to avoid blocking entire corporate NATs
    if (req.body && req.body.systemId && req.body.host) {
      return `${req.body.systemId}:${req.body.host}`;
    }
    // Extract IP securely
    const fallbackIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip";
    return fallbackIp.replace(/:/g, "_");
  }
});

router.post("/ingest", ingestLimiter, ingestTelemetry);

module.exports = router;
