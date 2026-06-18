import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function HostSelector({ selectedHost, setSelectedHost, systemId, onHostsLoaded }) {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`/hosts?${systemId ? `systemId=${systemId}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setHosts(res.data);
        if (onHostsLoaded) onHostsLoaded(res.data.length > 0);
        if (res.data.length === 0 || (selectedHost && !res.data.includes(selectedHost))) {
          setSelectedHost("");
        }
      })
      .catch(console.error);
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
