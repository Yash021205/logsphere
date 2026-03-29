# LogSphere: Real-time System Monitoring & Analytics

LogSphere is a powerful, cross-platform desktop application designed to provide real-time insights into your system's health. It collects CPU usage, memory consumption, process information, and application logs, aggregating them into a unified, interactive dashboard.

## 🚀 Key Features

- **Real-time Telemetry**: Monitor CPU, Memory, and Process count with second-by-second accuracy.
- **Log Aggregation**: Collects logs from specified directories and analyzes them for anomalies.
- **Smart Deduplication**: Uses advanced pattern matching to group similar logs, reducing noise.
- **Cross-Platform**: Built with C++ for native performance on both Windows and Linux.
- **Modern Dashboard**: A beautiful, responsive web interface built with React and Node.js.

## 🛠️ Tech Stack

- **Agent**: C++ (Native Performance)
- **Backend**: Node.js (Express)
- **Frontend**: React + Recharts (Data Visualization)
- **Database**: MongoDB (Log Storage)
- **Real-time**: Socket.IO

## 📂 Project Structure

```
logsphere/
├── agent/          # C++ Agent (Data Collector)
│   ├── agent.cpp   # Main agent logic
│   ├── config.json # System configuration
│   └── CMakeLists.txt
├── backend/        # Node.js API & WebSocket Server
│   ├── server.js   # API endpoints
│   ├── routes/     # API routes
│   └── models/     # Database models
├── frontend/       # React Dashboard
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── pages/      # Page Views
│   │   └── services/   # API Services
│   └── package.json
├── Dockerfile      # Docker configurations
└── docker-compose.yml # Multi-container setup
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Running locally or cloud-hosted)
- **C++ Compiler** (GCC/Clang for Linux, MSVC for Windows)
- **CMake** (for building the agent)

### 1. Build the Agent

```bash
cd agent
mkdir build
cd build
cmake ..
make
```

### 2. Configure the Agent

Create a `config.json` file in the `agent/` directory (or set environment variables):

```json
{
  "systemId": "your-system-id",
  "systemKey": "your-system-key"
}
```

### 3. Start the Backend

```bash
cd backend
npm install
npm start
```

### 4. Start the Frontend

```bash
cd frontend
npm install
npm start
```

### 5. Run the Agent

```bash
cd agent/build
./agent
```

## 🧪 Testing

1. Open the dashboard at `http://localhost:3000`
2. Log in with the default credentials (if applicable) or sign up.
3. Verify that the agent appears in the "Systems" list.
4. Check the "Metrics" and "Logs" tabs for real-time data.