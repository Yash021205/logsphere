import { useEffect, useState } from "react";
import axios from "../api/axios";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PALETTE = ["#ef4444", "#f59e0b", "#06b6d4", "#10b981", "#a855f7"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(7,7,26,.95)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 14px" }}>
      <p style={{ color: "var(--text-2)", fontSize: ".88rem", fontWeight: "600" }}>{payload[0].name}</p>
      <p style={{ color: payload[0].payload.fill, fontSize: "1rem", fontWeight: "700" }}>{payload[0].value} events</p>
    </div>
  );
};

export default function LogBreakdown({ systemId }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/log-stats?${systemId ? `systemId=${systemId}` : ""}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(Object.entries(res.data).map(([name, value], i) => ({ name, value, fill: PALETTE[i % PALETTE.length] })));
    };
    fetch();
    const t = setInterval(fetch, 10000);
    return () => clearInterval(t);
  }, [systemId]);

  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "24px", height: "100%" }}>
      <p style={{ fontSize: ".75rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: "16px" }}>Log Type Breakdown</p>
      {data.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "var(--muted)", fontSize: ".88rem" }}>
          No log data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={3}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={v => <span style={{ color: "var(--text-2)", fontSize: ".82rem" }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
