const express = require("express");
const router = express.Router();
const { getPrediction } = require("../controllers/predictController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getPrediction);

module.exports = router;
