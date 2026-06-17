import { useEffect, useState } from "react";
import axios from "../api/axios";
import { socket } from "../socket";

const SEVERITIES = ["All", "Error", "Warning", "Info"];

function getSeverity(msg) {
  const m = msg.toLowerCase();
  if (m.includes("error") || m.includes("critical") || m.includes("fatal")) return "Error";
  if (m.includes("warning") || m.includes("warn"))                           return "Warning";
  return "Info";
}

function getSeverityColor(sev) {
  if (sev === "Error")   return "#ef4444";
  if (sev === "Warning") return "#f59e0b";
  return "#38bdf8";
}

function LogTable({ host, systemId }) {
  const [logs,     setLogs]     = useState([]);
  const [search,   setSearch]   = useState("");
  const [severity, setSeverity] = useState("All");

  // Initial load (history)
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`/logs?host=${host}${systemId ? `&systemId=${systemId}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  }, [host, systemId]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    const handleTelemetry = (msg) => {
      if (host     && msg.host     !== host)     return;
      if (systemId && msg.systemId !== systemId) return;

      if (msg.logs && msg.logs.length > 0) {
        const newLogs = msg.logs.map(l => ({
          time:    msg.timestamp,
          host:    msg.host,
          message: l.message || l,
          count:   l.count || 1
        }));
        setLogs(prev => [...newLogs, ...prev].slice(0, 200));
      }
    };

    socket.on("telemetry", handleTelemetry);
    return () => socket.off("telemetry", handleTelemetry);
  }, [host, systemId]);

  // Apply search + severity filter
  const filteredLogs = logs.filter(log => {
    const matchSearch   = log.message.toLowerCase().includes(search.toLowerCase());
    const logSeverity   = getSeverity(log.message);
    const matchSeverity = severity === "All" || logSeverity === severity;
    return matchSearch && matchSeverity;
  });

  // Count per severity for the filter badges
  const counts = { Error: 0, Warning: 0, Info: 0 };
  logs.forEach(l => counts[getSeverity(l.message)]++);

  return (
    <div style={{ background: "#020617", padding: "20px", borderRadius: "10px" }}>
      <h2 style={{ marginBottom: "14px" }}>Live Log Console</h2>

      {/* Search + severity filter row */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <input
          placeholder="Search logs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: "1 1 200px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #1e293b",
            background: "#0f172a",
            color: "white",
            fontSize: "0.88rem",
            outline: "none"
          }}
        />

        {/* Severity toggle buttons */}
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {SEVERITIES.map(s => {
            const active = severity === s;
            const dotColor = s === "Error" ? "#ef4444" : s === "Warning" ? "#f59e0b" : s === "Info" ? "#38bdf8" : "#6366f1";
            return (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  border: `1px solid ${active ? dotColor : "#1e293b"}`,
                  background: active ? `${dotColor}22` : "transparent",
                  color: active ? dotColor : "#64748b",
                  fontSize: "0.8rem",
                  fontWeight: active ? "600" : "400",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                {s}
                {s !== "All" && (
                  <span style={{
                    background: active ? dotColor : "#1e293b",
                    color: active ? "white" : "#64748b",
                    borderRadius: "999px",
                    padding: "1px 6px",
                    fontSize: "0.72rem",
                    fontWeight: "700"
                  }}>
                    {counts[s]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Log table */}
      <div style={{ maxHeight: "400px", overflowY: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead style={{ position: "sticky", top: 0, background: "#0f172a" }}>
            <tr style={{ color: "#94a3b8", textAlign: "left" }}>
              <th style={th}>Severity</th>
              <th style={th}>Time</th>
              <th style={th}>Host</th>
              <th style={th}>Message</th>
              <th style={th}>Count</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...td, textAlign: "center", color: "#475569", padding: "30px" }}>
                  No logs match the current filter.
                </td>
              </tr>
            ) : filteredLogs.map((log, i) => {
              const sev = getSeverity(log.message);
              const col = getSeverityColor(sev);
              return (
                <tr key={i} style={{ background: i % 2 ? "#0f172a" : "#111827" }}>
                  <td style={{ ...td, whiteSpace: "nowrap" }}>
                    <span style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: `${col}22`,
                      color: col,
                      fontSize: "0.75rem",
                      fontWeight: "600"
                    }}>
                      {sev}
                    </span>
                  </td>
                  <td style={{ ...td, whiteSpace: "nowrap", color: "#64748b" }}>
                    {new Date(log.time).toLocaleTimeString()}
                  </td>
                  <td style={{ ...td, color: "#94a3b8" }}>{log.host}</td>
                  <td style={{ ...td, color: col }}>{log.message}</td>
                  <td style={{ ...td, color: "#64748b" }}>{log.count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th = { padding: "10px", borderBottom: "1px solid #1e293b" };
const td = { padding: "8px 10px", color: "white" };

export default LogTable;
