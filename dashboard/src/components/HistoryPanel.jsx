import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function HistoryPanel({ systemId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`/history?${systemId ? `systemId=${systemId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setData(res.data))
      .catch(console.error);
  }, [systemId]);

  if (!data) return null;

  const Change = ({ val }) => {
    const n = parseFloat(val);
    const color = n > 0 ? "var(--err)" : n < 0 ? "var(--ok)" : "var(--muted)";
    const prefix = n > 0 ? "+" : "";
    return <span style={{ color, fontSize: ".8rem", fontWeight: "600" }}>{prefix}{val}%</span>;
  };

  const rows = [
    { label: "CPU",    today: data.cpu.today,    yest: data.cpu.yesterday,    change: data.cpu.change,    color: "#ef4444" },
    { label: "Memory", today: data.memory.today, yest: data.memory.yesterday, change: data.memory.change, color: "#06b6d4" },
  ];

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "24px" }}>
      <p style={{ fontSize: ".75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "16px" }}>Historical Comparison</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {rows.map(r => (
          <div key={r.label}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <span style={{ fontSize: ".85rem", color: "var(--text-2)", fontWeight: "500" }}>{r.label}</span>
              <Change val={r.change} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[{ l: "Today",     v: r.today }, { l: "Yesterday", v: r.yest }].map(({ l, v }) => (
                <div key={l} style={{ background: "rgba(255,255,255,.03)", borderRadius: "6px", padding: "8px 10px" }}>
                  <p style={{ fontSize: ".7rem", color: "var(--muted)", marginBottom: "2px" }}>{l}</p>
                  <p style={{ fontSize: "1rem", fontWeight: "600", color: r.color }}>{v}%</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
