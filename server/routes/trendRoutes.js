const express = require("express");
const router = express.Router();
const { getTrends } = require("../controllers/trendController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getTrends);

module.exports = router;
