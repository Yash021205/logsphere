const { spawn } = require("child_process");

const SYSTEM_ID = process.env.SYSTEM_ID || "native-laptop";
const SYSTEM_KEY = process.env.SYSTEM_KEY || "secret-key";
const BACKEND_URL = "http://localhost:5000/ingest";

console.log(`Starting agent relay for ${SYSTEM_ID}...`);

const agent = spawn("stdbuf", ["-oL", "./agent"], {
  env: { ...process.env, SYSTEM_ID }
});

agent.stdout.on("data", async (data) => {
  const lines = data.toString().split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    console.log(`Agent: ${line}`);
    if (line.includes("Sending: ")) {
      const parts = line.split("Sending: ");
      const jsonStr = parts[1].trim();
      try {
        const payload = JSON.parse(jsonStr);
        // Add systemKey which is required by backend but not present in agent output
        payload.systemKey = SYSTEM_KEY;
        
        console.log("Relaying telemetry to backend...");
        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (response.ok) {
          console.log("Telemetry sent successfully.");
        } else {
          const errorText = await response.text();
          console.error("Failed to relay telemetry:", errorText);
        }
      } catch (err) {
        console.error("Failed to relay telemetry:", err.message);
      }
    }
  }
});

agent.stderr.on("data", (data) => {
  console.error(`Agent Error: ${data.toString()}`);
});

agent.on("close", (code) => {
  console.log(`Agent process exited with code ${code}`);
});
