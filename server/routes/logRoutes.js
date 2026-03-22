const express = require("express");
const { getLogs } = require("../controllers/logController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/logs", authMiddleware, getLogs);

module.exports = router;
