import { useEffect, useState } from "react";
import axios from "../api/axios";

function TrendPanel({ systemId }) {
  const [trend, setTrend] = useState(null);

  useEffect(() => {
    const fetchTrends = async () => {
      const res = await axios.get(`/trends?${systemId ? `systemId=${systemId}` : ''}`);
      setTrend(res.data);
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 10000);
    return () => clearInterval(interval);
  }, [systemId]);

  if (!trend) return null;

  const arrow = (t) =>
    t === "up" ? "🔺 Rising" : t === "down" ? "🔻 Falling" : "➡ Stable";

  return (
    <div style={{
      background: "#0f172a",
      padding: "20px",
      borderRadius: "10px",
      marginBottom: "20px"
    }}>
      <h2 style={{ marginBottom: "12px" }}>System Trends</h2>

      <p>CPU Avg: {trend.cpuAvg}% — {arrow(trend.cpuTrend)}</p>
      <p>Memory Avg: {trend.memAvg}% — {arrow(trend.memTrend)}</p>
    </div>
  );
}

export default TrendPanel;
