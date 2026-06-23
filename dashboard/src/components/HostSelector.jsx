import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function HostSelector({ selectedHost, setSelectedHost, systemId, onHostsLoaded }) {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const cfg = { headers: { Authorization: `Bearer ${token}` } };

    const loadHosts = () => {
      // Fetch hosts from telemetry
      axios.get(`/hosts?${systemId ? `systemId=${systemId}` : ""}`, cfg)
        .then(res => {
          setHosts(res.data);
          if (res.data.length > 0) {
            if (onHostsLoaded) onHostsLoaded(true);
          } else {
            // No telemetry hosts yet — check if any devices are active/online
            // (agent may have just started and hasn't ingested yet)
            axios.get(`/api/devices/all${systemId ? `?systemId=${systemId}` : ""}`, cfg)
              .then(devRes => {
                const devices = devRes.data.devices || [];
                const hasActiveDevice = devices.some(d => d.status === "active" || d.status === "claimed");
                if (onHostsLoaded) onHostsLoaded(hasActiveDevice);
              })
              .catch(() => {
                if (onHostsLoaded) onHostsLoaded(false);
              });
          }
          if (selectedHost && !res.data.includes(selectedHost)) {
            setSelectedHost("");
          }
        })
        .catch(console.error);
    };

    loadHosts();
    // Re-check every 15s in case agent starts sending data after page load
    const interval = setInterval(loadHosts, 15000);
    return () => clearInterval(interval);
  }, [systemId]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: "500" }}>Host</span>
      <select
        className="ls-select"
        value={selectedHost}
        onChange={e => setSelectedHost(e.target.value)}
      >
        <option value="">All Hosts</option>
        {hosts.map((h, i) => <option key={i} value={h}>{h}</option>)}
      </select>
    </div>
  );
}
