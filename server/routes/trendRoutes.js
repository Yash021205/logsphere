const express = require("express");
const router = express.Router();
const { getTrends } = require("../controllers/trendController");

router.get("/", getTrends);

module.exports = router;
