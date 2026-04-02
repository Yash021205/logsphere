const express = require("express");
const rateLimit = require("express-rate-limit");
const { ingestTelemetry } = require("../controllers/ingestController");

const router = express.Router();

const ingestLimiter = rateLimit({
  windowMs: 5 * 1000, 
  max: 5, // Limit each system to 5 requests per 5 seconds
  message: "Too many telemetry requests from this system"
});

router.post("/ingest", ingestLimiter, ingestTelemetry);

module.exports = router;
