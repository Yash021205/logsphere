const express = require("express");
const { getCPU, getMemory , getHostSummary } = require("../controllers/metricsController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/metrics/cpu", authMiddleware, getCPU);
router.get("/metrics/memory", authMiddleware, getMemory);
router.get("/metrics/summary", authMiddleware, getHostSummary);
module.exports = router;

