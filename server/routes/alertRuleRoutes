const express = require("express");
const router = express.Router();
const {
  getRules,
  updateRules
} = require("../controllers/alertruleController");

router.get("/", getRules);
router.post("/", updateRules);

module.exports = router;
