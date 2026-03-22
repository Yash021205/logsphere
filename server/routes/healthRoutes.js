const express = require("express");
const router = express.Router();
const { getHealth } = require("../controllers/healthController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getHealth);

module.exports = router;
