const express = require("express");
const router = express.Router();
const { getComparison } = require("../controllers/historyController");

router.get("/", getComparison);

module.exports = router;
