const axios = require("axios");

setInterval(async () => {
    const payload = {
        systemId: "companyA",
        systemKey: "e791d1db4d00309e3f03804efb0538ac",
        host: "windows-mock",
        cpu: (Math.random() * 50 + 100).toFixed(2),
        memory: (Math.random() * 40 + 95).toFixed(2),
        processes: 300 + Math.floor(Math.random() * 30),
        logs: [
            {
                message: "Error: database timeout",
                count: Math.floor(Math.random() * 5) + 1,
                first_seen: Date.now() - 60000,
                last_seen: Date.now()
            }
        ],
        timestamp: Date.now()
    };

    try {
        await axios.post("http://localhost:5000/ingest", payload);
        console.log("Mock telemetry sent");
    } catch (err) {
        console.error("ERROR:", err.response?.data || err.message);
    }
}, 5000);
