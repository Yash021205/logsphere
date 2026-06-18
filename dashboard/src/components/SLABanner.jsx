import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function SLABanner({ systemId }) {
  const [sla, setSla] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/sla?${systemId ? `systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSla(res.data);
    };
    fetch();
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
  }, [systemId]);

  if (!sla || !sla.violation) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: "10px", animation: "glowPulse 2s infinite" }}>
      <span style={{ fontSize: "1.1rem" }}>🚨</span>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: ".9rem", fontWeight: "600", color: "#fca5a5" }}>SLA VIOLATION</span>
        <span style={{ fontSize: ".88rem", color: "var(--text-2)", marginLeft: "8px" }}>{sla.reason}</span>
      </div>
      <span style={{ padding: "3px 10px", background: "rgba(239,68,68,.2)", border: "1px solid rgba(239,68,68,.4)", borderRadius: "999px", fontSize: ".72rem", fontWeight: "700", color: "var(--err)" }}>
        BREACH
      </span>
    </div>
  );
}
