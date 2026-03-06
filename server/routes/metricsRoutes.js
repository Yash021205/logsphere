const express = require("express");
const { getCPU, getMemory } = require("../controllers/metricsController");

const router = express.Router();

router.get("/metrics/cpu", getCPU);
router.get("/metrics/memory", getMemory);

module.exports = router;

