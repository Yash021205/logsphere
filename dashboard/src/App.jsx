import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import AgentSetup from "./components/AgentSetup";
import SystemSelector from "./components/SystemSelector";
import CpuChart from "./components/CpuChart";
import MemoryChart from "./components/MemoryChart";
import StatusCards from "./components/StatusCards";
import LogTable from "./components/LogTable";
import AlertBanner from "./components/AlertBanner";
import HostSelector from "./components/HostSelector";
import AnomalyBanner from "./components/AnomalyBanner";
import TrendPanel from "./components/TrendPanel";
import HistoryPanel from "./components/HistoryPanel";
import ForecastPanel from "./components/ForecastPanel";
import HealthCard from "./components/HealthCard";
import LogBreakdown from "./components/LogBreakdown";
import SLABanner from "./components/SLABanner";
import TimeRangeSelector from "./components/TimeRangeSelector";

function Dashboard() {
  const [selectedHost, setSelectedHost] = useState("");
  const [selectedSystem, setSelectedSystem] = useState("");
  const [systemHasHosts, setSystemHasHosts] = useState(true);
  const [range, setRange] = useState(5);
  const [activeTab, setActiveTab] = useState("metrics");
  
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" />;

  let userRole = "Client";
  try {
    const decoded = jwtDecode(token);
    userRole = decoded.role;
  } catch (e) {}

  return (
    <div style={{ padding: "30px 40px", color: "white" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '5px' }}>LogSphere Dashboard</h1>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span 
              onClick={() => setActiveTab("metrics")}
              style={{ cursor: 'pointer', color: activeTab === 'metrics' ? '#6366f1' : '#64748b', fontWeight: activeTab === 'metrics' ? '600' : '400', borderBottom: activeTab === 'metrics' ? '2px solid #6366f1' : 'none', paddingBottom: '3px' }}
            >
              Live Metrics
            </span>
            <span 
              onClick={() => setActiveTab("setup")}
              style={{ cursor: 'pointer', color: activeTab === 'setup' ? '#6366f1' : '#64748b', fontWeight: activeTab === 'setup' ? '600' : '400', borderBottom: activeTab === 'setup' ? '2px solid #6366f1' : 'none', paddingBottom: '3px' }}
            >
              Agent Setup
            </span>
          </div>
        </div>
        <button 
          onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
          className="btn-secondary" 
          style={{ padding: '8px 20px', fontSize: '0.9rem' }}
        >
          Logout
        </button>
      </div>

      {activeTab === 'metrics' ? (
        <>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {userRole === "Admin" && (
              <SystemSelector selectedSystem={selectedSystem} setSelectedSystem={setSelectedSystem} />
            )}
            <HostSelector 
              selectedHost={selectedHost} 
              setSelectedHost={setSelectedHost} 
              systemId={selectedSystem} 
              onHostsLoaded={setSystemHasHosts}
            />
          </div>

          {!systemHasHosts ? (
            <div style={{ marginTop: '50px', textAlign: 'center', padding: '60px 40px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px dashed #475569' }}>
               <h2 style={{ color: '#cbd5e1', marginBottom: '15px' }}>Agent Not Connected 🔌</h2>
               <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
                 We haven't received any telemetry the selected system yet. 
                 If you are setting this up for the first time, please go to the <b>"Agent Setup"</b> tab to connect your device.
               </p>
            </div>
          ) : (
            <>
              <AlertBanner systemId={selectedSystem} />
              <AnomalyBanner systemId={selectedSystem} />
              <SLABanner systemId={selectedSystem} />

              <TrendPanel systemId={selectedSystem} />
              <HistoryPanel systemId={selectedSystem} />
              <ForecastPanel systemId={selectedSystem} />

              <StatusCards host={selectedHost} systemId={selectedSystem} />
              <HealthCard systemId={selectedSystem} />

              <TimeRangeSelector range={range} setRange={setRange} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginTop: "20px" }}>
                <CpuChart host={selectedHost} range={range} systemId={selectedSystem} />
                <MemoryChart host={selectedHost} range={range} systemId={selectedSystem} />
              </div>
                 
              <div style={{ marginTop: "30px" }}>
                <LogBreakdown systemId={selectedSystem} />
                <LogTable host={selectedHost} systemId={selectedSystem} />
              </div>
            </>
          )}
        </>
      ) : (
        <AgentSetup selectedSystem={selectedSystem} userRole={userRole} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;







