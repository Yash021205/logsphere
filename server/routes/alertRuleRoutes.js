const express = require("express");
const router = express.Router();
const {
  getRules,
  updateRules
} = require("../controllers/alertruleController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getRules);
router.post("/", authMiddleware, updateRules);

module.exports = router;
