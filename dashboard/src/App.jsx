import { useState } from "react";
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
import Login from "./components/Login";
function App() {
  const [selectedHost, setSelectedHost] = useState("");
  const [range, setRange] = useState(5); 
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }
  return (
    <div style={{
      width: "100vw",
      minHeight: "100vh",
      padding: "30px 40px",
      color: "white"
    }}>
      <h1 style={{ marginBottom: "20px" }}>LogSphere Dashboard</h1>

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

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "25px",
        marginTop: "20px"
      }}>
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

export default App;







