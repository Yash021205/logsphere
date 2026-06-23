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

    // Return system details with labels (hostname + owner) for the dropdown
    const Device = require("../models/device");
    const User = require("../models/userModel");
    
    const filter = req.systemFilter;
    const systemIds = await System.find(filter).distinct("systemId");
    
    // Build labeled list
    const labeled = await Promise.all(systemIds.map(async (sysId) => {
      const device = await Device.findOne({ systemId: sysId }).select("hostname ownerEmail");
      const label = device 
        ? `${device.hostname} (${device.ownerEmail || "you"})`
        : sysId;
      return { systemId: sysId, label };
    }));

    res.json(labeled);
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

// Returns the correct one-liner install command for the current server URL.
// The new agent provisions itself — no credentials in the command.
const getInstallCommand = async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const baseUrl = `${protocol}://${req.headers.host}`;

    res.json({
      linux:   `curl -sL "${baseUrl}/install.sh" | bash -s -- --ingestUrl "${baseUrl}"`,
      windows: `Invoke-WebRequest -Uri "${baseUrl}/install.ps1" -OutFile install.ps1; .\\install.ps1 -ingestUrl "${baseUrl}"`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to generate install command");
  }
};

module.exports = { registerSystem, getSystemConfig, getSystems, downloadAgent, downloadWindowsAgent, getInstallCommand };