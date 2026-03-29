const express = require("express");
const { registerSystem, getSystemConfig, getSystems, downloadAgent } = require("../controllers/systemController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/system/register", registerSystem);
router.get("/system/config", authMiddleware, getSystemConfig);
router.get("/system/agent", downloadAgent);
router.get("/systems", authMiddleware, getSystems);

module.exports = router;