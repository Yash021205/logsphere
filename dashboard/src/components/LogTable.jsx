import { useEffect, useState } from "react";
import axios from "../api/axios";
import { socket } from "../socket";

function LogTable({ host }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  // Initial load (history)
  useEffect(() => {
    axios
      .get(`http://localhost:5000/logs?host=${host}`)
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  }, [host]);

  // Real-time updates
  useEffect(() => {
    socket.on("telemetry", (msg) => {
      if (host && msg.host !== host) return;

      if (msg.logs && msg.logs.length > 0) {
        const newLogs = msg.logs.map(l => ({
          time: msg.timestamp,
          host: msg.host,
          message: l.message || l,
          count: l.count || 1
        }));

        setLogs(prev => [...newLogs, ...prev].slice(0, 50));
      }
    });

    return () => socket.off("telemetry");
  }, [host]);

  const getSeverityColor = (msg) => {
    if (msg.toLowerCase().includes("error")) return "#ef4444";
    if (msg.toLowerCase().includes("warning")) return "#f59e0b";
    return "#38bdf8";
  };

  const filteredLogs = logs.filter(log =>
    log.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      background: "#020617",
      padding: "20px",
      borderRadius: "10px"
    }}>
      <h2 style={{ marginBottom: "10px" }}>Live Log Console</h2>

      <input
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "10px",
          borderRadius: "6px",
          border: "none",
          background: "#0f172a",
          color: "white"
        }}
      />

      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead style={{ position: "sticky", top: 0, background: "#0f172a" }}>
            <tr style={{ color: "#94a3b8", textAlign: "left" }}>
              <th style={th}>Time</th>
              <th style={th}>Host</th>
              <th style={th}>Message</th>
              <th style={th}>Count</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log, i) => (
              <tr key={i} style={{ background: i % 2 ? "#0f172a" : "#111827" }}>
                <td style={td}>
                  {new Date(log.time * 1000).toLocaleTimeString()}
                </td>
                <td style={td}>{log.host}</td>
                <td style={{ ...td, color: getSeverityColor(log.message) }}>
                  {log.message}
                </td>
                <td style={td}>{log.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: "10px", borderBottom: "1px solid #1e293b" };
const td = { padding: "8px 10px", color: "white" };

export default LogTable;



