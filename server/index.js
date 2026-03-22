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
app.use(cors());
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
  cors: { origin: "*" }
});

const jwt = require("jsonwebtoken");

io.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("authenticate", (token) => {
    try {
      if (!token) return;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(decoded.systemId);
      console.log(`Socket authenticated and joined room: ${decoded.systemId}`);
    } catch (err) {
      console.error("Socket authentication failed");
    }
  });
});

app.set("io", io);

server.listen(5000, () => {
  console.log("LogSphere server running on port 5000");
});

