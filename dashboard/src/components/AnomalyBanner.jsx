import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function AnomalyBanner({ systemId }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const handle = (data) => {
      const filtered = systemId ? data.filter(a => a.systemId === systemId) : data;
      if (filtered.length > 0) {
        setAlerts(filtered);
        setTimeout(() => setAlerts([]), 7000);
      }
    };
    socket.on("anomaly", handle);
    return () => socket.off("anomaly", handle);
  }, [systemId]);

  if (alerts.length === 0) return null;

  return (
    <div>
      {alerts.map((a, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", marginBottom: "8px", background: "rgba(245,158,11,.08)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "10px", animation: "fadeInUp .3s ease" }}>
          <span style={{ fontSize: "1rem" }}>⚠️</span>
          <span style={{ flex: 1, fontSize: ".88rem", color: "#fbbf24" }}>
            <strong>Anomaly Detected</strong> — {a.type}: {a.message}
          </span>
          <span style={{ padding: "3px 10px", background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", borderRadius: "999px", fontSize: ".72rem", fontWeight: "700", color: "#f59e0b" }}>
            ANOMALY
          </span>
        </div>
      ))}
    </div>
  );
}
