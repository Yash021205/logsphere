import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function HealthCard({ systemId }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/health?${systemId ? `systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHealth(res.data);
    };
    fetch();
    const t = setInterval(fetch, 5000);
    return () => clearInterval(t);
  }, [systemId]);

  if (!health) return null;

  const isHealthy = health.status === "Healthy";
  const isWarning = health.status === "Warning";
  const color  = isHealthy ? "var(--ok)" : isWarning ? "var(--warn)" : "var(--err)";
  const pct    = Math.min(100, Math.max(0, health.score));
  const ring   = `conic-gradient(${color} ${pct * 3.6}deg, rgba(255,255,255,.06) 0deg)`;

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "24px", display: "flex", alignItems: "center", gap: "24px" }}>
      {/* Score ring */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: ring, display: "flex", alignItems: "center", justifyContent: "center", padding: "4px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "var(--bg-2)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <span style={{ fontSize: "1.3rem", fontWeight: "700", color, lineHeight: 1 }}>{pct}</span>
            <span style={{ fontSize: ".62rem", color: "var(--muted)" }}>/ 100</span>
          </div>
        </div>
      </div>
      <div>
        <p style={{ fontSize: ".75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "4px" }}>System Health</p>
        <p style={{ fontSize: "1.2rem", fontWeight: "700", color }}>{health.status}</p>
        <p style={{ fontSize: ".8rem", color: "var(--muted)", marginTop: "3px" }}>
          {isHealthy ? "All metrics within normal range" : isWarning ? "Some metrics above safe threshold" : "Critical — immediate attention needed"}
        </p>
      </div>
    </div>
  );
}
