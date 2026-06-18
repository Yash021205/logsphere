import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import LandingPage      from "./components/LandingPage";
import AuthPage         from "./components/AuthPage";
import AgentSetup       from "./components/AgentSetup";
import SystemSelector   from "./components/SystemSelector";
import CpuChart         from "./components/CpuChart";
import MemoryChart      from "./components/MemoryChart";
import StatusCards      from "./components/StatusCards";
import LogTable         from "./components/LogTable";
import AlertBanner      from "./components/AlertBanner";
import HostSelector     from "./components/HostSelector";
import AnomalyBanner    from "./components/AnomalyBanner";
import TrendPanel       from "./components/TrendPanel";
import HistoryPanel     from "./components/HistoryPanel";
import ForecastPanel    from "./components/ForecastPanel";
import HealthCard       from "./components/HealthCard";
import LogBreakdown     from "./components/LogBreakdown";
import SLABanner        from "./components/SLABanner";
import TimeRangeSelector from "./components/TimeRangeSelector";
import PendingDevices   from "./components/PendingDevices";
import DeviceStatus     from "./components/DeviceStatus";
import AlertRulesPanel  from "./components/AlertRulesPanel";
import ToastContainer   from "./components/Toast";
import useToast         from "./hooks/useToast";

/* ── Sidebar navigation definition ──────────────────────────── */
const NAV = [
  { id: "overview",  icon: "📊", label: "Overview"     },
  { id: "metrics",   icon: "📈", label: "Metrics"      },
  { id: "logs",      icon: "📋", label: "Logs"         },
  { id: "devices",   icon: "💻", label: "Devices"      },
  { id: "alerts",    icon: "🔔", label: "Alert Rules"  },
];

/* ── Sidebar ─────────────────────────────────────────────────── */
function Sidebar({ active, setActive, userRole }) {
  return (
    <aside className="dash-sidebar">
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ fontSize: "1.35rem", fontWeight: "700", background: "var(--g-primary)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", letterSpacing: "-.02em" }}>
          LogSphere
        </div>
        <div style={{ fontSize: ".72rem", color: "var(--muted)", marginTop: "3px", letterSpacing: ".06em", textTransform: "uppercase" }}>
          {userRole === "Admin" ? "Admin Console" : "My Dashboard"}
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "16px 0" }}>
        <div className="nav-section">Navigation</div>
        {NAV.map(n => (
          <div
            key={n.id}
            className={`nav-item ${active === n.id ? "active" : ""}`}
            onClick={() => setActive(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.id === "devices" && active !== "devices" && (
              <span style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: "var(--ok)", animation: "pulse 2s infinite", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </nav>

      {/* Bottom user info */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid var(--border)" }}>
        <div style={{ fontSize: ".78rem", color: "var(--muted)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: ".05em" }}>Signed in as</div>
        <div style={{ fontSize: ".85rem", color: "var(--text-2)", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {(() => { try { return jwtDecode(localStorage.getItem("token"))?.email || "Unknown"; } catch { return "Unknown"; } })()}
        </div>
        <button
          className="btn-secondary"
          onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
          style={{ width: "100%", marginTop: "10px", fontSize: ".82rem", padding: "8px", justifyContent: "center" }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ── Top bar ─────────────────────────────────────────────────── */
function TopBar({ activeSection, userRole, selectedSystem, setSelectedSystem, selectedHost, setSelectedHost, range, setRange, onHostsLoaded }) {
  return (
    <header className="dash-topbar">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "var(--muted)", fontSize: ".88rem" }}>LogSphere</span>
        <span style={{ color: "var(--dim)" }}>/</span>
        <span style={{ color: "var(--text-2)", fontSize: ".88rem", fontWeight: "600", textTransform: "capitalize" }}>{activeSection}</span>
      </div>

      {/* Controls right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, justifyContent: "flex-end" }}>
        {userRole === "Admin" && (
          <SystemSelector selectedSystem={selectedSystem} setSelectedSystem={setSelectedSystem} />
        )}
        {(activeSection === "overview" || activeSection === "metrics" || activeSection === "logs") && (
          <HostSelector
            selectedHost={selectedHost}
            setSelectedHost={setSelectedHost}
            systemId={selectedSystem}
            onHostsLoaded={onHostsLoaded}
          />
        )}
        {activeSection === "metrics" && (
          <TimeRangeSelector range={range} setRange={setRange} />
        )}
        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)", borderRadius: "999px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--ok)", animation: "pulse 2s infinite", display: "inline-block" }} />
          <span style={{ fontSize: ".78rem", color: "var(--ok)", fontWeight: "600" }}>LIVE</span>
        </div>
      </div>
    </header>
  );
}

/* ── Main Dashboard ──────────────────────────────────────────── */
function Dashboard() {
  const [activeSection,   setActiveSection]   = useState("overview");
  const [selectedHost,    setSelectedHost]    = useState("");
  const [selectedSystem,  setSelectedSystem]  = useState("");
  const [systemHasHosts,  setSystemHasHosts]  = useState(true);
  const [range,           setRange]           = useState(5);

  const { toasts, showToast, dismissToast } = useToast();

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" />;

  let userRole = "Client";
  try { userRole = jwtDecode(token).role; } catch {}

  /* ── No-agent empty state */
  const EmptyState = () => (
    <div style={{ textAlign: "center", padding: "80px 40px", background: "var(--surface)", borderRadius: "var(--r-xl)", border: "1px dashed var(--border-h)", marginTop: "20px" }}>
      <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔌</div>
      <h2 style={{ color: "var(--text-2)", marginBottom: "12px", fontSize: "1.4rem" }}>No Agent Connected</h2>
      <p style={{ color: "var(--muted)", maxWidth: "440px", margin: "0 auto 24px", lineHeight: "1.7" }}>
        No telemetry received yet. Go to the <strong style={{ color: "var(--p-300)" }}>Devices</strong> tab,
        run the install command on your machine, then click <strong style={{ color: "var(--p-300)" }}>Claim Device</strong>.
      </p>
      <button className="btn-primary" onClick={() => setActiveSection("devices")} style={{ padding: "12px 28px" }}>
        Set Up Agent →
      </button>
    </div>
  );

  /* ── Alert strip — shown in overview/metrics/logs when alerts exist */
  const AlertStrip = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
      <SLABanner     systemId={selectedSystem} />
      <AlertBanner   systemId={selectedSystem} />
      <AnomalyBanner systemId={selectedSystem} />
    </div>
  );

  const sectionTitle = {
    overview: "System Overview",
    metrics:  "Live Metrics",
    logs:     "Log Console",
    devices:  "Devices & Setup",
    alerts:   "Alert Rules",
  }[activeSection];

  return (
    <div className="dash-layout">
      <Sidebar active={activeSection} setActive={setActiveSection} userRole={userRole} />

      <div className="dash-main">
        <TopBar
          activeSection={activeSection}
          userRole={userRole}
          selectedSystem={selectedSystem}
          setSelectedSystem={setSelectedSystem}
          selectedHost={selectedHost}
          setSelectedHost={setSelectedHost}
          range={range}
          setRange={setRange}
          onHostsLoaded={setSystemHasHosts}
        />

        <div className="dash-content">
          {/* Section heading */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text)", letterSpacing: "-.02em" }}>
              {sectionTitle}
            </h1>
          </div>

          {/* ── OVERVIEW ─────────────────────────────────── */}
          {activeSection === "overview" && (
            !systemHasHosts ? <EmptyState /> : (
              <div className="anim-fade">
                <AlertStrip />
                <StatusCards host={selectedHost} systemId={selectedSystem} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "20px", marginBottom: "20px" }}>
                  <HealthCard   systemId={selectedSystem} />
                  <TrendPanel   systemId={selectedSystem} />
                  <HistoryPanel systemId={selectedSystem} />
                  <ForecastPanel systemId={selectedSystem} />
                </div>
              </div>
            )
          )}

          {/* ── METRICS ──────────────────────────────────── */}
          {activeSection === "metrics" && (
            !systemHasHosts ? <EmptyState /> : (
              <div className="anim-fade">
                <AlertStrip />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                  <CpuChart    host={selectedHost} range={range} systemId={selectedSystem} />
                  <MemoryChart host={selectedHost} range={range} systemId={selectedSystem} />
                </div>
              </div>
            )
          )}

          {/* ── LOGS ─────────────────────────────────────── */}
          {activeSection === "logs" && (
            !systemHasHosts ? <EmptyState /> : (
              <div className="anim-fade">
                <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
                  <LogBreakdown systemId={selectedSystem} />
                  <LogTable     host={selectedHost} systemId={selectedSystem} />
                </div>
              </div>
            )
          )}

          {/* ── DEVICES ──────────────────────────────────── */}
          {activeSection === "devices" && (
            <div className="anim-fade">
              <DeviceStatus />
              <div style={{ marginTop: "24px" }}>
                <PendingDevices showToast={showToast} />
              </div>
              <div style={{ marginTop: "24px" }}>
                <AgentSetup selectedSystem={selectedSystem} userRole={userRole} />
              </div>
            </div>
          )}

          {/* ── ALERT RULES ──────────────────────────────── */}
          {activeSection === "alerts" && (
            <div className="anim-fade">
              <p style={{ color: "var(--muted)", marginBottom: "20px", fontSize: ".95rem", maxWidth: "600px", lineHeight: "1.7" }}>
                Set the CPU and memory thresholds at which alerts fire for your system.
                Alerts are pushed in real-time over Socket.IO — tune these to reduce noise.
              </p>
              <AlertRulesPanel systemId={selectedSystem} />
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

/* ── Router ──────────────────────────────────────────────────── */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/auth"      element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
