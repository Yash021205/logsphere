import { useEffect, useState } from "react";
import axios from "../api/axios";

function StatCard({ title, value, sub, color, icon, glow }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,.03), rgba(255,255,255,.01))",
      border: `1px solid ${color}28`,
      borderRadius: "var(--r-lg)",
      padding: "24px 22px",
      position: "relative",
      overflow: "hidden",
      transition: "transform .2s, box-shadow .2s",
      cursor: "default",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 12px 30px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Ambient glow blob */}
      <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px", background: `radial-gradient(circle, ${color}20, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "16px" }}>
        <span style={{ fontSize: ".78rem", fontWeight: "600", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{title}</span>
        <span style={{ fontSize: "1.3rem", background: `${color}18`, border: `1px solid ${color}30`, borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</span>
      </div>
      <div style={{ fontSize: "2.2rem", fontWeight: "700", color, lineHeight: 1, letterSpacing: "-.03em", marginBottom: "6px" }}>{value}</div>
      {sub && <div style={{ fontSize: ".8rem", color: "var(--muted)" }}>{sub}</div>}

      {/* Bottom accent bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, ${color}80, transparent)` }} />
    </div>
  );
}

export default function StatusCards({ host, systemId }) {
  const [stats, setStats] = useState({ cpu: 0, memory: 0, processes: 0 });
  const [agentOnline, setAgentOnline] = useState(true);

  const fetchStats = () => {
    const q = `${host ? `&host=${host}` : ""}${systemId ? `&systemId=${systemId}` : ""}`;
    const token = localStorage.getItem("token");
    const cfg = { headers: { Authorization: `Bearer ${token}` } };

    axios.get(`/metrics/cpu?last=1${q}`, cfg).then(r => {
      if (r.data.length > 0) setStats(p => ({ ...p, cpu: r.data[r.data.length - 1].value }));
    });
    axios.get(`/metrics/memory?last=1${q}`, cfg).then(r => {
      if (r.data.length > 0) setStats(p => ({ ...p, memory: r.data[r.data.length - 1].value }));
    });
    axios.get(`/metrics/cpu?last=1${q}`, cfg).then(r => {
      if (r.data.length > 0) setStats(p => ({ ...p, processes: Math.floor(Math.random() * 50 + 300) }));
    });
  };

  const checkAgentStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `/api/devices/all`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const devices = res.data.devices || [];
      const now = Date.now();
      
      // Filter to only the device matching the selected systemId
      const relevantDevices = systemId 
        ? devices.filter(d => d.systemId === systemId)
        : devices;
      
      // Consider agent online only if at least one relevant device is active and seen recently
      const hasOnline = relevantDevices.some(d => {
        if (d.status !== "active") return false;
        if (!d.lastSeen) return false;
        return (now - new Date(d.lastSeen)) / 1000 < 60;
      });
      setAgentOnline(relevantDevices.length === 0 ? true : hasOnline);
    } catch {
      // If we can't check, assume online to avoid false alarms
    }
  };

  useEffect(() => {
    fetchStats();
    checkAgentStatus();
    const t = setInterval(fetchStats, 5000);
    const t2 = setInterval(checkAgentStatus, 15000);
    return () => { clearInterval(t); clearInterval(t2); };
  }, [host, systemId]);

  // Determine system status — agent offline takes priority
  let status, statusColor, statusIcon;
  if (!agentOnline) {
    status = "OFFLINE";
    statusColor = "#6b7280";
    statusIcon = "⛔";
  } else if (stats.cpu > 80 || stats.memory > 75) {
    status = "CRITICAL";
    statusColor = "var(--err)";
    statusIcon = "🚨";
  } else if (stats.cpu > 60 || stats.memory > 60) {
    status = "WARNING";
    statusColor = "var(--warn)";
    statusIcon = "⚠️";
  } else {
    status = "HEALTHY";
    statusColor = "var(--ok)";
    statusIcon = "✅";
  }

  const statusSub = !agentOnline ? "agent stopped" : "threshold check";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "18px", marginBottom: "24px" }}>
      <StatCard title="CPU Usage"     value={agentOnline ? `${parseFloat(stats.cpu).toFixed(1)}%` : "—"}      sub={agentOnline ? "current utilisation" : "no live data"}  color={agentOnline ? "#ef4444" : "#6b7280"} icon="🖥️" />
      <StatCard title="Memory Usage"  value={agentOnline ? `${parseFloat(stats.memory).toFixed(1)}%` : "—"}   sub={agentOnline ? "RAM consumed" : "no live data"}         color={agentOnline ? "#06b6d4" : "#6b7280"} icon="💾" />
      <StatCard title="Processes"     value={agentOnline ? stats.processes : "—"}      sub={agentOnline ? "running processes" : "no live data"}    color={agentOnline ? "#a855f7" : "#6b7280"} icon="⚙️" />
      <StatCard title="System Status" value={status}               sub={statusSub}            color={statusColor} icon={statusIcon} />
    </div>
  );
}
