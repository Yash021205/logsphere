import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import CpuChart from "./components/CpuChart";
import MemoryChart from "./components/MemoryChart";
import StatusCards from "./components/StatusCards";
import LogTable from "./components/LogTable";
import AlertBanner from "./components/AlertBanner";
import HostSelector from "./components/HostSelector";
import AnomalyBanner from "./components/AnomalyBanner";
import TrendPanel from "./components/TrendPannel";
import HistoryPanel from "./components/HistoryPanel";
import ForecastPanel from "./components/ForecastPanel";
import HealthCard from "./components/HealthCard";
import LogBreakdown from "./components/LogBreakdown";
import SLABanner from "./components/SLABanner";
import TimeRangeSelector from "./components/TimeRangeSelector";

function Dashboard() {
  const [selectedHost, setSelectedHost] = useState("");
  const [range, setRange] = useState(5);
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/auth" />;

  return (
    <div style={{ padding: "30px 40px", color: "white" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>LogSphere Dashboard</h1>
        <button 
          onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
          className="btn-secondary" 
          style={{ padding: '8px 20px', fontSize: '0.9rem' }}
        >
          Logout
        </button>
      </div>

      <HostSelector selectedHost={selectedHost} setSelectedHost={setSelectedHost} />
      <AlertBanner />
      <AnomalyBanner />
      <SLABanner />

      <TrendPanel />
      <HistoryPanel />
      <ForecastPanel />

      <StatusCards host={selectedHost} />
      <HealthCard />

      <TimeRangeSelector range={range} setRange={setRange} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginTop: "20px" }}>
        <CpuChart host={selectedHost} range={range} />
        <MemoryChart host={selectedHost} range={range} />
      </div>
         
      <div style={{ marginTop: "30px" }}>
        <LogBreakdown />
        <LogTable host={selectedHost} />
      </div>
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







