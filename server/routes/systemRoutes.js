const express = require("express");
const { registerSystem, getSystemConfig, getSystems, downloadAgent, downloadWindowsAgent, getInstallCommand } = require("../controllers/systemController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/system/register", registerSystem);
router.get("/system/config", authMiddleware, getSystemConfig);
router.get("/system/agent", downloadAgent); // kept for backwards compatibility
router.get("/install.sh", downloadAgent);
router.get("/install.ps1", downloadWindowsAgent);
router.get("/system/install-command", authMiddleware, getInstallCommand);
router.get("/systems", authMiddleware, getSystems);

module.exports = router;