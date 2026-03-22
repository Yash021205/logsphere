import { useEffect, useState } from "react";
import { socket } from "../socket";
import axios from "../api/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function MemoryChart({ host, range }) {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    axios.get(`http://localhost:5000/metrics/memory?minutes=${range}&host=${host}`)
      .then(res => {
        const history = res.data.map(d => ({
          time: new Date(d.time * 1000).toLocaleTimeString(),
          value: d.value
        }));
        setData(history);
      });
  }, [range, host]);
  
  useEffect(() => {
    socket.on("telemetry", (msg) => {
      if (host && msg.host !== host) return;

      setData(prev => [
        ...prev.slice(-29),
        {
          time: new Date(msg.timestamp * 1000).toLocaleTimeString(),
          value: msg.memory
        }
      ]);
    });

    return () => socket.off("telemetry");
  }, [host]);

  return (
    <div style={{ background: "#020617", padding: "20px", borderRadius: "10px" }}>
      <h2>Memory Usage (%)</h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid stroke="#334155" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MemoryChart;

