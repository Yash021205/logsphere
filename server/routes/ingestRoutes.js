const express = require("express");
const { ingestTelemetry } = require("../controllers/ingestController");

const router = express.Router();

router.post("/ingest", ingestTelemetry);

module.exports = router;
