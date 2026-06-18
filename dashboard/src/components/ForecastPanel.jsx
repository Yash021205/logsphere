import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function ForecastPanel({ systemId }) {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/predict?${systemId ? `systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForecast(res.data);
    };
    fetch();
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
  }, [systemId]);

  if (!forecast) return null;

  const items = [
    { label: "CPU hits 90%",    value: forecast.cpuPrediction,    color: "#ef4444", icon: "🖥️" },
    { label: "Memory hits 90%", value: forecast.memPrediction, color: "#06b6d4", icon: "💾" },
  ];

  return (
    <div style={{ background: "linear-gradient(135deg,rgba(168,85,247,.06),rgba(124,58,237,.03))", border: "1px solid rgba(168,85,247,.15)", borderRadius: "var(--r-lg)", padding: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "18px" }}>
        <span style={{ fontSize: "1.1rem" }}>🔮</span>
        <p style={{ fontSize: ".75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>Load Forecast</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map(item => (
          <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,.03)", borderRadius: "8px", padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>{item.icon}</span>
              <span style={{ fontSize: ".85rem", color: "var(--text-2)" }}>{item.label}</span>
            </div>
            <span style={{ fontSize: ".9rem", fontWeight: "700", color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: ".73rem", color: "var(--dim)", marginTop: "12px" }}>Estimated based on current trend</p>
    </div>
  );
}
