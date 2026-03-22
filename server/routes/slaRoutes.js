const express = require("express");
const router = express.Router();
const { checkSLA } = require("../controllers/slaController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, checkSLA);

module.exports = router;