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
  const agentScript = `const http = require("http");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

async function run() {
  try {
    const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
    const url = new URL(config.ingestUrl || "http://localhost:5000/ingest");
    const platform = os.platform();
    const watchedFiles = {};

    console.log("Starting LogSphere Agent v2.1 (Aggregated) for:", config.systemId);
    console.log("Platform:", platform);

    // Helper to extract description from wevtutil output
    const extractDescription = (text) => {
      const match = text.match(/Description:\\s*([\\s\\S]*$)/i);
      if (match && match[1]) return match[1].trim().substring(0, 500);
      return text.split("\\n")[0].trim(); // Fallback to first line
    };

    // Periodic telemetry
    setInterval(() => {
      let rawLogs = [];

      // 1. Get system logs
      try {
        if (platform === "win32") {
          const cmd = 'wevtutil qe System "/q:*[System[(Level=2 or Level=3)]]" /c:3 /rd:true /f:text';
          const output = execSync(cmd).toString();
          if (output.trim()) {
            rawLogs.push({ message: "Windows System: " + extractDescription(output), type: "System" });
          }
        } else if (platform === "linux") {
          const output = execSync("journalctl -n 5 --no-pager").toString();
          output.split("\\n").forEach(line => {
             if (line.trim()) rawLogs.push({ message: line.trim(), type: "System" });
          });
        }
      } catch (e) { /* ignore command errors */ }

      // 2. Read from configured log paths
      (config.logPaths || []).forEach(path => {
        try {
          if (fs.existsSync(path)) {
            const stats = fs.statSync(path);
            const fd = fs.openSync(path, 'r');
            const currentSize = stats.size;
            const lastSize = watchedFiles[path] || 0;

            if (currentSize > lastSize) {
              const buffer = Buffer.alloc(currentSize - lastSize);
              fs.readSync(fd, buffer, 0, currentSize - lastSize, lastSize);
              const newContent = buffer.toString();
              newContent.split("\\n").forEach(line => {
                if (line.trim()) rawLogs.push({ message: line.trim(), type: "App" });
              });
              watchedFiles[path] = currentSize;
            }
            fs.closeSync(fd);
          }
        } catch (e) { console.error("Error reading file:", path, e.message); }
      });

      // 3. AGGREGATION LOGIC
      const aggregatedLogs = [];
      const logMap = {};

      rawLogs.forEach(log => {
        const key = log.message + "|" + log.type;
        if (logMap[key]) {
          logMap[key].count++;
        } else {
          logMap[key] = { ...log, count: 1 };
        }
      });

      for (const key in logMap) {
        aggregatedLogs.push(logMap[key]);
      }

      // 4. Send Payload
      const payload = JSON.stringify({
        systemId: config.systemId,
        systemKey: config.systemKey,
        host: os.hostname(),
        cpu: (Math.random() * 20 + 5).toFixed(2),
        memory: (Math.random() * 30 + 20).toFixed(2),
        processes: 50 + Math.floor(Math.random() * 100),
        logs: aggregatedLogs,
        timestamp: Date.now()
      });

      const options = {
        hostname: url.hostname,
        port: url.port || 80,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      };

      const req = http.request(options, (res) => {
        if (res.statusCode === 200 && aggregatedLogs.length > 0) {
          console.log("Sent " + aggregatedLogs.length + " aggregated logs");
        }
      });
      req.on("error", (err) => console.error("Ingest Error:", err.message));
      req.write(payload);
      req.end();
    }, 5000);

  } catch (err) {
    console.error("Agent Error:", err.message);
    process.exit(1);
  }
}

run();
`;
  res.setHeader("Content-Disposition", "attachment; filename=agent.js");
  res.setHeader("Content-Type", "text/javascript");
  res.send(agentScript);
};

module.exports = { registerSystem, getSystemConfig, getSystems, downloadAgent };