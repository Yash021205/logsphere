import { useEffect, useState } from "react";
import axios from "../api/axios";

function HostSelector({ selectedHost, setSelectedHost }) {
  const [hosts, setHosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/hosts")
      .then(res => setHosts(res.data))
      .catch(err => console.error(err));
  }, []);

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
