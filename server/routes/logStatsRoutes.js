const express = require("express");
const router = express.Router();
const { getLogStats } = require("../controllers/logStatsController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getLogStats);
module.exports = router;