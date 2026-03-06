const express = require("express");
const { getBaseline } = require("../controllers/anomalyController");

const router = express.Router();
router.get("/baseline", getBaseline);

module.exports = router;
