# LogSphere 🌐

<p align="center">
  <strong>Real-time Infrastructure Monitoring Platform with Multi-Tenant RBAC</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/C++-00599C?style=for-the-badge&logo=c%2B%2B&logoColor=white" alt="C++" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/license-ISC-blue" alt="License" />
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-lightgrey" alt="Platform" />
</p>

---

## Overview

LogSphere is a full-stack telemetry platform that monitors CPU, memory, processes, and application logs across distributed infrastructure in real time. It features a native C++ agent (zero runtime dependencies), a Node.js backend with anomaly detection, and a React dashboard with live-updating charts.

## Screenshots

<p align="center">
  <img src="./screenshots/landing.png" width="100%" alt="Landing Page" />
</p>

<p align="center">
  <img src="./screenshots/overview.png" width="100%" alt="System Overview Dashboard" />
</p>

<p align="center">
  <img src="./screenshots/metrics.png" width="100%" alt="Live Metrics - CPU & Memory Charts" />
</p>

<p align="center">
  <img src="./screenshots/logs.png" width="100%" alt="Live Log Console with Severity Filters" />
</p>

<p align="center">
  <img src="./screenshots/devices.png" width="100%" alt="Devices & Setup - Online/Offline Status" />
</p>

**Key highlights:**
- One-command agent deployment (OTA install scripts for Linux & Windows)
- Multi-tenant RBAC — Admins oversee fleets, Clients see only their own systems
- Real-time streaming via Socket.IO (no page refreshes needed)
- Threshold-based alert rules with anomaly detection
- Historical comparison, trend analysis, and load forecasting
- Device lifecycle management (auto-discover → claim → monitor → offline detection)

---

## Architecture

<p align="center">
<svg width="100%" viewBox="0 0 780 920" role="img" xmlns="http://www.w3.org/2000/svg">
  <title>LogSphere Architecture Diagram</title>
  <desc>Full-stack architecture of LogSphere: C++ agents at the bottom send telemetry to a Node.js server, which stores data in MongoDB and streams to a React dashboard consumed by Admin and Client users.</desc>

  <defs>
    <style>
      .t  { font-family: sans-serif; font-size: 14px; font-weight: 400; fill: #3d3d3a; }
      .ts { font-family: sans-serif; font-size: 12px; font-weight: 400; fill: #73726c; }
      .th { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #3d3d3a; }

      /* Layer containers */
      .layer-user   { fill: #F1EFE8; stroke: #888780; }
      .layer-dash   { fill: #EEEDFE; stroke: #7F77DD; }
      .layer-server { fill: #E1F5EE; stroke: #1D9E75; }
      .layer-db     { fill: #EAF3DE; stroke: #639922; }
      .layer-agent  { fill: #FAEEDA; stroke: #BA7517; }

      /* Box fills */
      .box-purple { fill: #CECBF6; stroke: #534AB7; }
      .box-teal   { fill: #9FE1CB; stroke: #0F6E56; }
      .box-green  { fill: #C0DD97; stroke: #3B6D11; }
      .box-amber  { fill: #FAC775; stroke: #854F0B; }

      /* Text on colored boxes */
      .th-purple { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #3C3489; }
      .ts-purple { font-family: sans-serif; font-size: 11px; font-weight: 400; fill: #534AB7; }
      .th-teal   { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #085041; }
      .ts-teal   { font-family: sans-serif; font-size: 11px; font-weight: 400; fill: #0F6E56; }
      .th-green  { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #27500A; }
      .ts-green  { font-family: sans-serif; font-size: 11px; font-weight: 400; fill: #3B6D11; }
      .th-amber  { font-family: sans-serif; font-size: 14px; font-weight: 600; fill: #633806; }
      .ts-amber  { font-family: sans-serif; font-size: 11px; font-weight: 400; fill: #854F0B; }

      .arr { stroke: #888780; stroke-width: 1.5; fill: none; }
      .leader { stroke: #888780; stroke-width: 0.5; stroke-dasharray: 4 3; fill: none; }
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888780" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- ── USER LAYER ── -->
  <rect x="30" y="18" width="720" height="90" rx="14" stroke-width="0.5" class="layer-user"/>
  <text class="ts" x="50" y="37">User layer</text>

  <rect x="185" y="36" width="155" height="56" rx="8" stroke-width="0.5" class="box-purple"/>
  <text class="th-purple" x="262" y="60" text-anchor="middle" dominant-baseline="central">Admin</text>
  <text class="ts-purple" x="262" y="78" text-anchor="middle" dominant-baseline="central">Fleet-wide view</text>

  <rect x="440" y="36" width="155" height="56" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="517" y="60" text-anchor="middle" dominant-baseline="central">Client</text>
  <text class="ts-teal" x="517" y="78" text-anchor="middle" dominant-baseline="central">Own systems only</text>

  <!-- User → Dashboard arrows -->
  <line x1="262" y1="108" x2="262" y2="152" class="arr" marker-end="url(#arrow)"/>
  <line x1="517" y1="108" x2="517" y2="152" class="arr" marker-end="url(#arrow)"/>
  <text class="ts" x="390" y="136" text-anchor="middle">HTTPS / JWT</text>

  <!-- ── DASHBOARD LAYER ── -->
  <rect x="30" y="156" width="720" height="130" rx="14" stroke-width="0.5" class="layer-dash"/>
  <text class="ts" x="50" y="175" style="fill:#534AB7">Dashboard — React 19 + Vite</text>

  <rect x="50"  y="188" width="126" height="80" rx="8" stroke-width="0.5" class="box-purple"/>
  <text class="th-purple" x="113" y="222" text-anchor="middle" dominant-baseline="central">Overview</text>
  <text class="ts-purple" x="113" y="242" text-anchor="middle" dominant-baseline="central">Health score</text>

  <rect x="192" y="188" width="126" height="80" rx="8" stroke-width="0.5" class="box-purple"/>
  <text class="th-purple" x="255" y="222" text-anchor="middle" dominant-baseline="central">Metrics</text>
  <text class="ts-purple" x="255" y="242" text-anchor="middle" dominant-baseline="central">CPU / RAM charts</text>

  <rect x="334" y="188" width="112" height="80" rx="8" stroke-width="0.5" class="box-purple"/>
  <text class="th-purple" x="390" y="222" text-anchor="middle" dominant-baseline="central">Logs</text>
  <text class="ts-purple" x="390" y="242" text-anchor="middle" dominant-baseline="central">Live console</text>

  <rect x="462" y="188" width="126" height="80" rx="8" stroke-width="0.5" class="box-purple"/>
  <text class="th-purple" x="525" y="222" text-anchor="middle" dominant-baseline="central">Devices</text>
  <text class="ts-purple" x="525" y="242" text-anchor="middle" dominant-baseline="central">Lifecycle mgmt</text>

  <rect x="604" y="188" width="126" height="80" rx="8" stroke-width="0.5" class="box-purple"/>
  <text class="th-purple" x="667" y="222" text-anchor="middle" dominant-baseline="central">Alerts</text>
  <text class="ts-purple" x="667" y="242" text-anchor="middle" dominant-baseline="central">Threshold rules</text>

  <!-- Dashboard → Server arrow -->
  <line x1="390" y1="286" x2="390" y2="328" class="arr" marker-end="url(#arrow)"/>
  <text class="ts" x="390" y="312" text-anchor="middle">REST API + Socket.IO</text>

  <!-- ── SERVER LAYER ── -->
  <rect x="30" y="332" width="720" height="260" rx="14" stroke-width="0.5" class="layer-server"/>
  <text class="ts" x="50" y="352" style="fill:#0F6E56">Server — Node.js + Express</text>

  <!-- Gateway row -->
  <rect x="52"  y="366" width="156" height="60" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="130" y="390" text-anchor="middle" dominant-baseline="central">Auth (JWT)</text>
  <text class="ts-teal" x="130" y="408" text-anchor="middle" dominant-baseline="central">RBAC middleware</text>

  <rect x="224" y="366" width="156" height="60" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="302" y="390" text-anchor="middle" dominant-baseline="central">Ingest engine</text>
  <text class="ts-teal" x="302" y="408" text-anchor="middle" dominant-baseline="central">Rate-limited endpoint</text>

  <rect x="396" y="366" width="156" height="60" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="474" y="390" text-anchor="middle" dominant-baseline="central">Socket.IO GW</text>
  <text class="ts-teal" x="474" y="408" text-anchor="middle" dominant-baseline="central">Room-based streaming</text>

  <rect x="568" y="366" width="162" height="60" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="649" y="390" text-anchor="middle" dominant-baseline="central">Background jobs</text>
  <text class="ts-teal" x="649" y="408" text-anchor="middle" dominant-baseline="central">Aggregation + status</text>

  <!-- Processing layer -->
  <rect x="52" y="446" width="678" height="130" rx="10" stroke-width="0.5" class="box-teal" style="fill:#E1F5EE"/>
  <text class="ts" x="70" y="464" style="fill:#0F6E56">Processing layer</text>

  <rect x="68"  y="472" width="155" height="88" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="145" y="506" text-anchor="middle" dominant-baseline="central">Log classifier</text>
  <text class="ts-teal" x="145" y="526" text-anchor="middle" dominant-baseline="central">Error / Warn / Info</text>

  <rect x="239" y="472" width="155" height="88" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="316" y="506" text-anchor="middle" dominant-baseline="central">Anomaly detect</text>
  <text class="ts-teal" x="316" y="526" text-anchor="middle" dominant-baseline="central">Baseline deviation</text>

  <rect x="410" y="472" width="155" height="88" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="487" y="506" text-anchor="middle" dominant-baseline="central">Alert rules</text>
  <text class="ts-teal" x="487" y="526" text-anchor="middle" dominant-baseline="central">Threshold triggers</text>

  <rect x="581" y="472" width="136" height="88" rx="8" stroke-width="0.5" class="box-teal"/>
  <text class="th-teal" x="649" y="506" text-anchor="middle" dominant-baseline="central">Rollup jobs</text>
  <text class="ts-teal" x="649" y="526" text-anchor="middle" dominant-baseline="central">5 min + 1 hr</text>

  <!-- Server → DB arrow -->
  <line x1="390" y1="592" x2="390" y2="636" class="arr" marker-end="url(#arrow)"/>
  <text class="ts" x="390" y="620" text-anchor="middle">Mongoose ORM</text>

  <!-- ── DATABASE LAYER ── -->
  <rect x="30" y="640" width="720" height="92" rx="14" stroke-width="0.5" class="layer-db"/>
  <text class="ts" x="50" y="659" style="fill:#3B6D11">Database — MongoDB</text>

  <rect x="52"  y="668" width="214" height="48" rx="8" stroke-width="0.5" class="box-green"/>
  <text class="th-green" x="159" y="688" text-anchor="middle" dominant-baseline="central">Telemetry</text>
  <text class="ts-green" x="159" y="706" text-anchor="middle" dominant-baseline="central">raw · 5 min · 1 hr</text>

  <rect x="283" y="668" width="214" height="48" rx="8" stroke-width="0.5" class="box-green"/>
  <text class="th-green" x="390" y="688" text-anchor="middle" dominant-baseline="central">Users &amp; systems</text>
  <text class="ts-green" x="390" y="706" text-anchor="middle" dominant-baseline="central">RBAC, hosts</text>

  <rect x="514" y="668" width="216" height="48" rx="8" stroke-width="0.5" class="box-green"/>
  <text class="th-green" x="622" y="688" text-anchor="middle" dominant-baseline="central">Devices &amp; alerts</text>
  <text class="ts-green" x="622" y="706" text-anchor="middle" dominant-baseline="central">lifecycle, rules</text>

  <!-- Agent → Server arrow -->
  <line x1="390" y1="828" x2="390" y2="760" class="arr" marker-end="url(#arrow)"/>
  <text class="ts" x="430" y="798" text-anchor="start">HTTPS POST /ingest</text>
  <text class="ts" x="430" y="814" text-anchor="start">systemId + systemKey</text>

  <!-- ── AGENT LAYER ── -->
  <rect x="30" y="832" width="720" height="74" rx="14" stroke-width="0.5" class="layer-agent"/>
  <text class="ts" x="50" y="851" style="fill:#854F0B">Agent layer — C++17 native</text>

  <rect x="50"  y="860" width="200" height="36" rx="8" stroke-width="0.5" class="box-amber"/>
  <text class="th-amber" x="150" y="874" text-anchor="middle" dominant-baseline="central">Windows host</text>
  <text class="ts-amber" x="150" y="888" text-anchor="middle" dominant-baseline="central">Event log · CPU · RAM</text>

  <rect x="290" y="860" width="200" height="36" rx="8" stroke-width="0.5" class="box-amber"/>
  <text class="th-amber" x="390" y="874" text-anchor="middle" dominant-baseline="central">Linux host</text>
  <text class="ts-amber" x="390" y="888" text-anchor="middle" dominant-baseline="central">syslog · CPU · RAM</text>

  <rect x="530" y="860" width="220" height="36" rx="8" stroke-width="0.5" class="box-amber"/>
  <text class="th-amber" x="640" y="874" text-anchor="middle" dominant-baseline="central">Auto-provision</text>
  <text class="ts-amber" x="640" y="888" text-anchor="middle" dominant-baseline="central">fingerprint · OTA install</text>
</svg>
</p>

---

## Features

| Category | Feature | Description |
|----------|---------|-------------|
| **Auth** | Multi-tenant RBAC | Admin/Client roles, JWT-based auth, password reset via email |
| **Agent** | Zero-config install | One-command OTA deployment, auto-provisioning (no manual credentials) |
| **Agent** | Cross-platform | Native C++ for Windows (Event Log) and Linux (syslog) |
| **Monitoring** | Real-time metrics | CPU, memory, process count streamed every 5 seconds |
| **Monitoring** | Live log console | Classified logs (Error/Warning/Info) with search & filter |
| **Analytics** | Trend analysis | Detects rising/falling/stable patterns in CPU & memory |
| **Analytics** | Historical comparison | Today vs yesterday averages with % change |
| **Analytics** | Load forecasting | Predicts time-to-threshold (90%) based on current rates |
| **Analytics** | Health score | 0–100 composite score based on current metrics |
| **Alerts** | Threshold rules | Configurable CPU/memory thresholds with real-time notifications |
| **Alerts** | Anomaly detection | Baseline comparison flags spikes above 10% deviation |
| **Devices** | Lifecycle management | Pending → Claimed → Active → Offline state machine |
| **Devices** | Offline detection | 2-min server-side check + 30s client-side detection + socket events |
| **Admin** | Fleet overview | System selector to switch between all managed client systems |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Agent | C++17, httplib.h, nlohmann/json | Lightweight telemetry collection (no runtime deps) |
| Server | Node.js, Express 5, Mongoose | REST API, business logic, data persistence |
| Server | Socket.IO | Bidirectional real-time communication |
| Server | JWT, bcryptjs | Authentication and authorization |
| Server | express-rate-limit | API rate limiting per system |
| Database | MongoDB | Time-series metrics, logs, user/device records |
| Dashboard | React 19, Vite 7 | SPA with hot module replacement |
| Dashboard | Recharts | Interactive metric visualization |
| Dashboard | socket.io-client | Real-time data streaming |

---

## Project Structure

```
logsphere/
├── agent/                      # C++ native agent
│   ├── agent.cpp               # Cross-platform telemetry collector
│   ├── httplib.h               # HTTP client (header-only)
│   ├── json.hpp                # JSON library (header-only)
│   ├── Makefile                # Build configuration
│   ├── install.sh              # Linux OTA installer
│   └── install.ps1             # Windows OTA installer
├── server/                     # Node.js backend
│   ├── index.js                # Express + Socket.IO entry point
│   ├── config/database.js      # MongoDB connection
│   ├── controllers/            # Route handlers
│   │   ├── authController.js   # Login, register, refresh, password reset
│   │   ├── ingestController.js # Telemetry ingestion + anomaly detection
│   │   ├── metricsController.js# CPU/memory query endpoints
│   │   ├── logController.js    # Log retrieval
│   │   └── ...                 # Alert, trend, history, predict, etc.
│   ├── models/                 # Mongoose schemas
│   │   ├── telemetryModel.js   # Raw metrics (5s granularity)
│   │   ├── telemetry5minModel.js # 5-minute aggregates
│   │   ├── telemetry1hrModel.js  # 1-hour aggregates
│   │   ├── device.js           # Device lifecycle & provisioning
│   │   └── userModel.js        # Users with RBAC
│   ├── jobs/                   # Background workers
│   │   ├── aggregationJob.js   # Metric rollup (5min + 1hr)
│   │   └── deviceStatusJob.js  # Offline detection
│   ├── middleware/             # Auth middleware (JWT + system filtering)
│   ├── routes/                 # Express route definitions
│   └── public/                 # Served static files
│       ├── binaries/           # Agent binaries (Linux + Windows)
│       ├── install.sh          # Linux installer (served via curl)
│       └── install.ps1         # Windows installer (served via IWR)
├── dashboard/                  # React frontend
│   ├── src/
│   │   ├── App.jsx             # Router + Dashboard layout
│   │   ├── components/         # UI components (25+ modules)
│   │   ├── hooks/              # Custom React hooks
│   │   ├── api/axios.js        # API client configuration
│   │   └── socket.js           # Socket.IO client
│   └── vite.config.js          # Vite build config
└── ecosystem.config.js         # PM2 deployment config
```

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas URI)
- **C++ compiler** (only if building the agent from source)

### 1. Clone the repository

```bash
git clone https://github.com/Yash021205/logsphere.git
cd logsphere
```

### 2. Backend setup

```bash
cd server
npm install
```

Create a `.env` file (see `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/logsphere
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
DASHBOARD_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Dashboard setup

```bash
cd dashboard
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

Start the dashboard:

```bash
npm run dev
```

Access at `http://localhost:5173`

### 4. Agent deployment

**Linux** (run on target machine):

```bash
curl -sL "http://<server-ip>:5000/install.sh" | sudo bash -s -- --ingestUrl "http://<server-ip>:5000"
```

**Windows** (run in Administrator PowerShell):

```powershell
Invoke-WebRequest -Uri "http://<server-ip>:5000/install.ps1" -OutFile install.ps1; .\install.ps1 -ingestUrl "http://<server-ip>:5000"
```

After running, the device appears in the dashboard under **Devices → New Devices Detected**. Click **Claim Device** to start monitoring.

---

## Usage Flow

1. **Register** an Admin account on the dashboard
2. **Deploy** the agent on target machines using the install command
3. **Claim** devices as they appear in the Devices tab
4. **Monitor** real-time metrics in Overview and Metrics tabs
5. **Configure** alert thresholds in the Alert Rules tab
6. **Add Clients** — they register with your Admin email and claim their own devices
7. **Switch** between client systems using the System Selector dropdown

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/ingest` | systemKey | Telemetry data ingestion |
| POST | `/auth/register` | — | User registration |
| POST | `/auth/login` | — | JWT token generation |
| GET | `/auth/refresh` | JWT | Refresh token with latest systemId |
| GET | `/metrics/cpu` | JWT | CPU time-series data |
| GET | `/metrics/memory` | JWT | Memory time-series data |
| GET | `/logs` | JWT | Log entries (classified) |
| GET | `/hosts` | JWT | Registered hosts list |
| GET | `/trends` | JWT | CPU/memory trend analysis |
| GET | `/history` | JWT | Today vs yesterday comparison |
| GET | `/predict` | JWT | Load forecast predictions |
| GET | `/health` | JWT | System health score |
| GET | `/sla` | JWT | SLA compliance status |
| POST | `/api/devices/announce` | — | Agent self-registration |
| GET | `/api/devices/credentials` | — | Agent credential polling |
| POST | `/api/devices/claim/:id` | JWT | Claim a pending device |
| GET | `/api/devices/all` | JWT | List owned devices with status |
| GET | `/alert-rules` | JWT | Get alert rule config |
| PUT | `/alert-rules` | JWT | Update alert thresholds |

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens |
| `CORS_ORIGIN` | No | Allowed origins (default: *) |
| `DASHBOARD_URL` | No | Dashboard URL for password reset emails |
| `EMAIL_USER` | No | SMTP username for password reset |
| `EMAIL_PASS` | No | SMTP password for password reset |

### Dashboard (`dashboard/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend server URL |

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the ISC License.