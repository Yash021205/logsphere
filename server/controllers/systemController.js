const System = require("../models/systemModel");
const crypto = require("crypto");
const registerSystem = async (req, res) => {
  try {
    const { systemId } = req.body;
    if (!systemId) {
      return res.status(400).send("systemId required");
    }
    // generate random system key
    const systemKey = crypto.randomBytes(16).toString("hex");
    const system = new System({
      systemId,
      systemKey
    });

    await system.save();

    res.json({
      systemId,
      systemKey
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("System registration failed");
  }
};

module.exports = { registerSystem };