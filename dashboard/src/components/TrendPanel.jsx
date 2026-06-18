import { useEffect, useState } from "react";
import axios from "../api/axios";

const Arrow = ({ t }) =>
  t === "up"   ? <span style={{ color: "var(--err)",  fontSize: ".8rem" }}>▲ Rising</span>  :
  t === "down" ? <span style={{ color: "var(--ok)",   fontSize: ".8rem" }}>▼ Falling</span> :
                 <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>→ Stable</span>;

export default function TrendPanel({ systemId }) {
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/trends?${systemId ? `systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrend(res.data);
    };
    fetch();
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
  }, [systemId]);

  if (!trend) return null;

  const rows = [
    { label: "CPU Average",    value: `${trend.cpuAvg}%`, trend: trend.cpuTrend, color: "#ef4444" },
    { label: "Memory Average", value: `${trend.memAvg}%`, trend: trend.memTrend, color: "#06b6d4" },
  ];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "24px" }}>
      <p style={{ fontSize: ".75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "16px" }}>System Trends</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "3px", height: "32px", background: r.color, borderRadius: "2px", flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: ".82rem", color: "var(--text-2)", fontWeight: "500" }}>{r.label}</p>
                <Arrow t={r.trend} />
              </div>
            </div>
            <span style={{ fontSize: "1.3rem", fontWeight: "700", color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
