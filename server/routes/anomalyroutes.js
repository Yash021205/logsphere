const express = require("express");
const { getBaseline } = require("../controllers/anomalyController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.get("/baseline", authMiddleware, getBaseline);

module.exports = router;
