// dashboard/src/components/AgentOfflineBanner.jsx
//
// Shows a dismissible offline warning in the Overview page when the agent
// hasn't sent telemetry for more than 30 seconds (i.e. stopped/crashed).
// Also listens for real-time "device-status" socket events.

import { useEffect, useState } from "react";
import axios from "../api/axios";
import { socket } from "../socket";

export default function AgentOfflineBanner({ systemId }) {
  const [offlineDevices, setOfflineDevices] = useState([]);

  useEffect(() => {
    const check = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `/api/devices/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const devices = res.data.devices || [];

        // Filter to selected system if specified
        const relevant = systemId 
          ? devices.filter(d => d.systemId === systemId)
          : devices;

        // A device is "offline" if status !== "active"
        // OR if lastSeen was more than 30 seconds ago
        const now = Date.now();
        const offline = relevant.filter(d => {
          if (d.status === "pending" || d.status === "claimed") return false;
          if (d.status === "offline") return true;
          if (!d.lastSeen) return true;
          const secondsSince = (now - new Date(d.lastSeen)) / 1000;
          return secondsSince > 30;
        });

        setOfflineDevices(offline);
      } catch {
        // Silently ignore — don't spam errors if devices endpoint fails
      }
    };

    check();
    const t = setInterval(check, 10000); // re-check every 10s

    // Listen for real-time device status changes
    const handleDeviceStatus = (data) => {
      if (data.status === "offline") {
        setOfflineDevices(prev => {
          const exists = prev.find(d => d._id === data.deviceId);
          if (exists) return prev;
          return [...prev, { _id: data.deviceId, hostname: data.hostname, status: "offline" }];
        });
      } else if (data.status === "active") {
        setOfflineDevices(prev => prev.filter(d => d._id !== data.deviceId));
      }
    };

    socket.on("device-status", handleDeviceStatus);

    return () => {
      clearInterval(t);
      socket.off("device-status", handleDeviceStatus);
    };
  }, [systemId]);

  if (offlineDevices.length === 0) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "12px 18px",
      marginBottom: "12px",
      background: "rgba(239,68,68,0.07)",
      border: "1px solid rgba(239,68,68,0.28)",
      borderRadius: "10px",
      animation: "fadeIn .35s ease"
    }}>
      {/* Pulsing red dot */}
      <span style={{
        width: "9px", height: "9px",
        borderRadius: "50%",
        background: "#ef4444",
        flexShrink: 0,
        boxShadow: "0 0 0 0 rgba(239,68,68,.6)",
        animation: "offlinePulse 1.8s ease-in-out infinite"
      }} />

      <div style={{ flex: 1 }}>
        <span style={{ fontSize: ".88rem", color: "#fca5a5", fontWeight: "600" }}>
          Agent Offline
        </span>
        <span style={{ fontSize: ".83rem", color: "#94a3b8", marginLeft: "8px" }}>
          {offlineDevices.map(d => d.hostname).join(", ")} — stopped or unreachable
        </span>
      </div>

      <span style={{
        padding: "3px 10px",
        background: "rgba(239,68,68,0.15)",
        border: "1px solid rgba(239,68,68,0.35)",
        borderRadius: "999px",
        fontSize: ".72rem",
        fontWeight: "700",
        color: "#ef4444",
        flexShrink: 0,
        letterSpacing: ".04em"
      }}>
        OFFLINE
      </span>

      <style>{`
        @keyframes offlinePulse {
          0%   { box-shadow: 0 0 0 0 rgba(239,68,68,.55); }
          70%  { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
          100% { box-shadow: 0 0 0 0 rgba(239,68,68,0);  }
        }
      `}</style>
    </div>
  );
}
