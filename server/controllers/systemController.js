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

const getSystemConfig = async (req, res) => {
  try {
    let query = { ...req.systemFilter };
    if (!Object.keys(query).length || query.systemId === "unauthorized_system_id") {
       return res.status(404).send("No system associated with this user");
    }

    const system = await System.findOne(query);
    if (!system) {
      return res.status(404).send("System records not found");
    }

    res.json({
      systemId: system.systemId,
      systemKey: system.systemKey,
      ingestUrl: `http://${req.headers.host}/ingest`,
      logPaths: [] 
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch system config");
  }
};

const getSystems = async (req, res) => {
  try {
    if (req.role !== "Admin") {
      return res.status(403).send("Forbidden");
    }

    const systems = await System.find(req.systemFilter).distinct("systemId");
    res.json(systems);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch systems");
  }
};

const downloadAgent = (req, res) => {
  const path = require("path");
  const fs = require("fs");
  const scriptPath = path.join(__dirname, "../../agent/install.sh");
  
  if (fs.existsSync(scriptPath)) {
    res.setHeader("Content-Disposition", "attachment; filename=install.sh");
    res.setHeader("Content-Type", "text/x-shellscript");
    const scriptContent = fs.readFileSync(scriptPath, "utf8");
    res.send(scriptContent);
  } else {
    res.status(404).send("Installation script not found.");
  }
};

const downloadWindowsAgent = (req, res) => {
  const path = require("path");
  const fs = require("fs");
  const scriptPath = path.join(__dirname, "../../agent/install.ps1");
  
  if (fs.existsSync(scriptPath)) {
    res.setHeader("Content-Disposition", "attachment; filename=install.ps1");
    res.setHeader("Content-Type", "text/plain");
    const scriptContent = fs.readFileSync(scriptPath, "utf8");
    res.send(scriptContent);
  } else {
    res.status(404).send("Installation script not found.");
  }
};

const getInstallCommand = async (req, res) => {
  try {
    const { systemId } = req.query;
    if (!systemId) {
      return res.status(400).send("systemId query param required");
    }

    const system = await System.findOne({ systemId });
    if (!system) {
      return res.status(404).send("System not found");
    }

    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.headers.host}`;
    const command = `curl -sL ${baseUrl}/install.sh | sudo bash -s -- --systemId \"${system.systemId}\" --systemKey \"${system.systemKey}\" --ingestUrl \"${baseUrl}\"`;

    res.json({ command });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate install command");
  }
};

module.exports = { registerSystem, getSystemConfig, getSystems, downloadAgent, downloadWindowsAgent, getInstallCommand };