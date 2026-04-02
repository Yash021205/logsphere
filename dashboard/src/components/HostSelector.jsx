import { useEffect, useState } from "react";
import axios from "../api/axios";

function HostSelector({ selectedHost, setSelectedHost, systemId, onHostsLoaded }) {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    axios.get(`/hosts?${systemId ? `systemId=${systemId}` : ''}`)
      .then(res => {
         setHosts(res.data);
         if (onHostsLoaded) onHostsLoaded(res.data.length > 0);
         if (res.data.length === 0 || (selectedHost && !res.data.includes(selectedHost))) {
             setSelectedHost("");
         }
      })
      .catch(err => console.error(err));
  }, [systemId]); // Keeping selectedHost out of dependencies to prevent infinity loops

  return (
    <select
      value={selectedHost}
      onChange={e => setSelectedHost(e.target.value)}
      style={{
        padding: "6px 10px",
        borderRadius: "6px",
        background: "#0f172a",
        color: "white",
        border: "none",
        marginBottom: "20px"
      }}
    >
      <option value="">All Hosts</option>
      {hosts.map((host, i) => (
        <option key={i} value={host}>{host}</option>
      ))}
    </select>
  );
}

export default HostSelector;
