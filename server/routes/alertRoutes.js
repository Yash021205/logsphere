const express = require("express");
const { getAlerts } = require("../controllers/alertController");

const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/alerts", authMiddleware, getAlerts);

module.exports = router;
