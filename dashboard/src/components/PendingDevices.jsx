// src/components/PendingDevices.jsx

import React from "react";
import usePendingDevices from "../hooks/usePendingDevices";

// Tiny helper — how long ago was this device first seen
function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)   return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function PendingDevices() {
  const { devices, loading, error, claimDevice, claiming } = usePendingDevices();

  // Don't render anything if no pending devices and not loading
  // — keeps the setup tab clean when everything is claimed
  if (!loading && devices.length === 0) {
    return (
      <div style={{
        padding: "20px 24px",
        background: "rgba(30, 41, 59, 0.5)",
        borderRadius: "12px",
        border: "1px dashed #334155",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <span style={{ fontSize: "1.4rem" }}>📡</span>
        <div>
          <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
            No pending devices detected.
          </p>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: "0.82rem" }}>
            Install the agent on a machine — it will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "28px" }}>

      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <h3 style={{ margin: 0, color: "#e2e8f0", fontSize: "1.1rem" }}>
          New Devices Detected
        </h3>
        {devices.length > 0 && (
          <span style={{
            background: "#6366f1",
            color: "white",
            borderRadius: "999px",
            padding: "2px 10px",
            fontSize: "0.78rem",
            fontWeight: "600"
          }}>
            {devices.length}
          </span>
        )}
        {/* Subtle live pulse dot */}
        <span style={{
          width: "8px", height: "8px",
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          animation: "pulse 2s infinite"
        }} />
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: "0.85rem", marginBottom: "12px" }}>
          {error}
        </p>
      )}

      {loading && devices.length === 0 && (
        <p style={{ color: "#64748b", fontSize: "0.9rem" }}>Checking for devices...</p>
      )}

      {/* Device cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {devices.map(device => (
          <div key={device._id} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "10px",
            transition: "border-color 0.2s"
          }}>

            {/* Left — device info */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "1.8rem" }}>
                {device.platform === "windows" ? "🖥️" : "🐧"}
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: "600", color: "#e2e8f0", fontSize: "1rem" }}>
                  {device.hostname}
                </p>
                <p style={{ margin: "3px 0 0", color: "#94a3b8", fontSize: "0.82rem" }}>
                  {device.platform} · Agent v{device.agentVersion} · Detected {timeAgo(device.firstSeen)}
                </p>
              </div>
            </div>

            {/* Right — Claim button */}
            <button
              onClick={() => claimDevice(device._id)}
              disabled={claiming === device._id}
              style={{
                padding: "9px 22px",
                background: claiming === device._id
                  ? "rgba(99,102,241,0.3)"
                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "0.9rem",
                cursor: claiming === device._id ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                minWidth: "100px"
              }}
            >
              {claiming === device._id ? "Claiming..." : "Claim Device"}
            </button>

          </div>
        ))}
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}