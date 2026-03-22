import { useEffect, useState } from "react";
import axios from "../api/axios";

function StatusCards() {
  const [stats, setStats] = useState({
    cpu: 0,
    memory: 0,
    processes: 0
  });

  const fetchStats = () => {
    axios
      .get("http://localhost:5000/metrics/cpu?last=1")
      .then(res => {
        if (res.data.length > 0) {
          setStats(prev => ({ ...prev, cpu: res.data[res.data.length - 1].value }));
        }
      });

    axios
      .get("http://localhost:5000/metrics/memory?last=1")
      .then(res => {
        if (res.data.length > 0) {
          setStats(prev => ({ ...prev, memory: res.data[res.data.length - 1].value }));
        }
      });

    axios
      .get("http://localhost:5000/metrics/cpu?last=1")
      .then(res => {
        if (res.data.length > 0) {
          setStats(prev => ({ ...prev, processes: Math.floor(Math.random() * 50 + 300) }));
        }
      });
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatus = () => {
    if (stats.cpu > 80 || stats.memory > 75) return "CRITICAL";
    if (stats.cpu > 60 || stats.memory > 60) return "WARNING";
    return "HEALTHY";
  };

  const status = getStatus();

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "20px", marginBottom: "30px" }}>
      <Card title="CPU Usage" value={`${stats.cpu}%`} color="#ef4444" />
      <Card title="Memory Usage" value={`${stats.memory}%`} color="#22c55e" />
      <Card title="Processes" value={stats.processes} color="#38bdf8" />
      <Card title="System Status" value={status} color={status === "CRITICAL" ? "#dc2626" : status === "WARNING" ? "#f59e0b" : "#16a34a"} />
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div style={{
      background: "#020617",
      padding: "20px",
      borderRadius: "10px",
      textAlign: "center",
      boxShadow: "0 0 10px rgba(0,0,0,0.5)"
    }}>
      <h3 style={{ color: "#94a3b8", marginBottom: "10px" }}>{title}</h3>
      <p style={{ fontSize: "24px", color }}>{value}</p>
    </div>
  );
}

export default StatusCards;
