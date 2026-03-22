const express = require("express");
const router = express.Router();
const { getComparison } = require("../controllers/historyController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getComparison);

module.exports = router;
