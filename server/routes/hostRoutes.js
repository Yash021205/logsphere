const express = require("express");
const { getHosts, getHostStatus } = require("../controllers/hostController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/hosts", authMiddleware, getHosts);
router.get("/hosts/status", authMiddleware, getHostStatus);
module.exports = router;