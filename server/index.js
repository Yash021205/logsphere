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
const deviceRoutes = require("./routes/devices");
setInterval(aggregate5Min, 5 * 60 * 1000); // every 5 min
setInterval(aggregate1Hour, 60 * 60 * 1000); // every hour
const app = express();

const allowedOrigins = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigins, credentials: true }));
const { checkDeviceStatus } = require("./jobs/deviceStatusJob");
setInterval(checkDeviceStatus, 60 * 1000); // every minute
app.use(express.json());
// Serve static OTA deployment binaries & installation scripts
app.use(express.static("public"));
app.use("/", anomalyRoutes);
app.use("/", systemRoutes);
app.use("/", authRoutes);
connectDB();
app.use("/trends", require("./routes/trendRoutes"));
app.use("/api/devices", deviceRoutes);
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

  socket.on("join-system", async (systemId) => {
    if (socket.user && socket.user.role === "Admin") {
      // Allow if it's the Admin's own system
      if (socket.user.systemId === systemId) {
        socket.join(systemId);
        console.log(`Admin joined own system room: ${systemId}`);
        return;
      }
      
      // Look up if this systemId belongs to a Client owned by this Admin
      const User = require("./models/userModel");
      const client = await User.findOne({ systemId: systemId, adminEmail: socket.user.email, role: "Client" });
      
      if (!client) {
        console.warn(`Security Warning: User ${socket.user.email} attempted to join unauthorized system ${systemId}`);
        return;
      }
      
      socket.join(systemId);
      console.log(`Admin joined client system room: ${systemId}`);
    }
  });
});

app.set("io", io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`LogSphere server running on port ${PORT}`);
});

