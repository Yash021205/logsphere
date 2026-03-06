const express = require("express");
const router = express.Router();
const { getLogStats } = require("../controllers/logStatsController");

router.get("/", getLogStats);
module.exports = router;