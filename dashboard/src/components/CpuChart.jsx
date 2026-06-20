import { useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "../api/axios";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload, label, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(7,7,26,.95)", border: `1px solid ${color}40`, borderRadius: "8px", padding: "10px 14px", backdropFilter: "blur(8px)" }}>
      <p style={{ color: "var(--muted)", fontSize: ".78rem", marginBottom: "4px" }}>{label}</p>
      <p style={{ color, fontWeight: "700", fontSize: "1.05rem" }}>{payload[0].value?.toFixed(1)}%</p>
    </div>
  );
};

export default function CpuChart({ host, range, systemId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`/metrics/cpu?minutes=${range}&host=${host}${systemId ? `&systemId=${systemId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data.map(d => ({ time: new Date(d.time).toLocaleTimeString(), value: d.value }))));
  }, [range, host, systemId]);

  useEffect(() => {
    const h = (msg) => {
      if (host && msg.host !== host) return;
      if (systemId && msg.systemId !== systemId) return;
      setData(p => [...p.slice(-29), { time: new Date(msg.timestamp).toLocaleTimeString(), value: msg.cpu }]);
    };
    socket.on("telemetry", h);
    return () => socket.off("telemetry", h);
  }, [host, systemId]);

  return (
    <div style={{ background: "linear-gradient(135deg,rgba(239,68,68,.06),rgba(239,68,68,.02))", border: "1px solid rgba(239,68,68,.15)", borderRadius: "var(--r-lg)", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text)", marginBottom: "3px" }}>CPU Usage</h2>
          <p style={{ fontSize: ".78rem", color: "var(--muted)" }}>Real-time processor utilisation</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: "999px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444", animation: "pulse 2s infinite", display: "inline-block" }} />
          <span style={{ fontSize: ".72rem", color: "#ef4444", fontWeight: "600" }}>LIVE</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={230}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#ef4444" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,.04)" strokeDasharray="4 4" />
          <XAxis dataKey="time" stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#334155" tick={{ fill: "#475569", fontSize: 11 }} tickLine={false} unit="%" />
          <Tooltip content={<CustomTooltip color="#ef4444" />} />
          <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5} fill="url(#cpuGrad)" dot={false} activeDot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
