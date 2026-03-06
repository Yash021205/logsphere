const express = require("express");
const router = express.Router();
const { checkSLA } = require("../controllers/slaController");

router.get("/", checkSLA);

module.exports = router;