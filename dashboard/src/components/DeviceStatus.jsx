// dashboard/src/components/DeviceStatus.jsx

import React, { useEffect, useState } from "react";
import axios from "../api/axios";

function timeAgo(dateStr) {
  if (!dateStr) return "never";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function DeviceStatus() {
  const [devices, setDevices]   = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/devices/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDevices(res.data.devices || []);
    } catch (err) {
      console.error("Failed to fetch devices", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and every 30 seconds
  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (devices.length === 0) return null;

  return (
    <div style={{
      marginBottom: "24px",
      background: "rgba(30, 41, 59, 0.5)",
      borderRadius: "12px",
      border: "1px solid #1e293b",
      padding: "20px 24px"
    }}>
      <h3 style={{ margin: "0 0 16px", color: "#e2e8f0", fontSize: "1rem" }}>
        Connected Devices
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {devices.map(device => (
          <div key={device._id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "rgba(15, 23, 42, 0.5)",
            borderRadius: "8px",
            border: `1px solid ${device.status === "active" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
          }}>

            {/* Left — device info */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.4rem" }}>
                {device.platform === "windows" ? "🖥️" : "🐧"}
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: "600", color: "#e2e8f0", fontSize: "0.95rem" }}>
                  {device.hostname}
                </p>
                <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: "0.8rem" }}>
                  Last seen: {timeAgo(device.lastSeen)}
                </p>
              </div>
            </div>

            {/* Right — status badge */}
            {(() => {
              const isActive  = device.status === "active";
              const isClaimed = device.status === "claimed";
              const color  = isActive ? "#22c55e" : isClaimed ? "#f59e0b" : "#ef4444";
              const bg     = isActive ? "rgba(34,197,94,0.1)" : isClaimed ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
              const border = isActive ? "#16a34a" : isClaimed ? "#d97706" : "#dc2626";
              const label  = isActive ? "Online" : isClaimed ? "Provisioning…" : "Offline";
              return (
                <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"5px 12px", borderRadius:"999px", background: bg, border:`1px solid ${border}` }}>
                  <span style={{ width:"7px", height:"7px", borderRadius:"50%", background: color, display:"inline-block", animation: isActive ? "pulse 2s infinite" : "none" }} />
                  <span style={{ color, fontSize:"0.82rem", fontWeight:"600" }}>{label}</span>
                </div>
              );
            })()}

          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}