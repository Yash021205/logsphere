const express = require("express");
const { registerSystem } = require("../controllers/systemController");

const router = express.Router();

router.post("/system/register", registerSystem);

module.exports = router;