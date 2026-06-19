const express = require("express");
const { register, login, refresh, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
// Re-issues a fresh JWT with the latest systemId from DB.
// Called by the dashboard after a device is successfully claimed.
router.post("/auth/refresh", refresh);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

module.exports = router;