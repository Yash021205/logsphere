const express = require("express");
const { getHosts } = require("../controllers/hostController");

const router = express.Router();
router.get("/hosts", getHosts);

module.exports = router;
