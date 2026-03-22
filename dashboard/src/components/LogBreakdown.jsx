import { useEffect, useState } from "react";
import axios from "../api/axios";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#94a3b8"];

function LogBreakdown() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await axios.get("http://localhost:5000/log-stats");
      const formatted = Object.entries(res.data).map(([name, value]) => ({
        name,
        value
      }));
      setData(formatted);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background:"#0f172a", padding:"20px", borderRadius:"10px", marginBottom:"20px" }}>
      <h2>Log Type Breakdown</h2>

      <PieChart width={300} height={250}>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}

export default LogBreakdown;
