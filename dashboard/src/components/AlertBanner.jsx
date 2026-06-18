import { useState, useEffect } from "react";
import axios from "../api/axios";

export default function AlertBanner({ systemId }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetch = () => {
      const token = localStorage.getItem("token");
      axios.get(`/alerts?${systemId ? `systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setAlerts(res.data.slice(0, 3)))
        .catch(console.error);
    };
    fetch();
    const t = setInterval(fetch, 5000);
    return () => clearInterval(t);
  }, [systemId]);

  if (alerts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {alerts.map((alert, i) => {
        const isCrit  = alert.level === "CRITICAL";
        const isWarn  = alert.level === "WARNING";
        const color   = isCrit ? "#ef4444" : isWarn ? "#f59e0b" : "#10b981";
        const bg      = isCrit ? "rgba(239,68,68,.08)" : isWarn ? "rgba(245,158,11,.08)" : "rgba(16,185,129,.08)";
        const border  = isCrit ? "rgba(239,68,68,.25)" : isWarn ? "rgba(245,158,11,.25)" : "rgba(16,185,129,.25)";
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: bg, border: `1px solid ${border}`, borderRadius: "10px" }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>{isCrit ? "🚨" : isWarn ? "⚠️" : "ℹ️"}</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: ".88rem", color: "var(--text-2)" }}>{alert.type} — {alert.message}</span>
            </div>
            <span style={{ padding: "3px 10px", background: `${color}20`, border: `1px solid ${color}40`, borderRadius: "999px", fontSize: ".72rem", fontWeight: "700", color, flexShrink: 0 }}>
              {alert.level}
            </span>
          </div>
        );
      })}
    </div>
  );
}
