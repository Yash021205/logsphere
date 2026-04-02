const http = require("http");
require("dotenv").config();
const { Server } = require("socket.io");
const express = require("express");
const connectDB = require("./config/database");
const ingestRoutes = require("./routes/ingestRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const alertRoutes = require("./routes/alertRoutes");
const hostRoutes = require("./routes/hostRoutes");
const cors = require("cors");
const logRoutes = require("./routes/logRoutes");
const anomalyRoutes = require("./routes/anomalyroutes");
const systemRoutes = require("./routes/systemRoutes");
const authRoutes = require("./routes/authRoutes");
const { aggregate5Min, aggregate1Hour } = require("./jobs/aggregationJob");
setInterval(aggregate5Min, 5 * 60 * 1000); // every 5 min
setInterval(aggregate1Hour, 60 * 60 * 1000); // every hour
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use("/", anomalyRoutes);
app.use("/", systemRoutes);
app.use("/", authRoutes);
connectDB();
app.use("/trends", require("./routes/trendRoutes"));
app.use("/history", require("./routes/historyRoutes"));
app.use("/predict", require("./routes/predictRoutes"));
app.use("/alert-rules", require("./routes/alertRuleRoutes"));
app.use("/health", require("./routes/healthRoutes"));
app.use("/log-stats", require("./routes/logStatsRoutes"));
app.use("/sla", require("./routes/slaRoutes"));
app.use("/", metricsRoutes);
app.use("/", ingestRoutes);
app.use("/", alertRoutes);
app.use("/", logRoutes);
app.use("/", hostRoutes);
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true }
});

const jwt = require("jsonwebtoken");

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("authenticate", (token) => {
    try {
      if (!token) return;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      socket.join(decoded.systemId);
      console.log(`Socket authenticated: ${decoded.email} (${decoded.role})`);
    } catch (err) {
      console.error("Socket authentication failed");
    }
  });

  socket.on("join-system", (systemId) => {
    if (socket.user && socket.user.role === "Admin") {
      // Leave previous system rooms if any (optional, but cleaner)
      // For now, just join the new one
      socket.join(systemId);
      console.log(`Admin joined system room: ${systemId}`);
    }
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`LogSphere server running on port ${PORT}`);
});

