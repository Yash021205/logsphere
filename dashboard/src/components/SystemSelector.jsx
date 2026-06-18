import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { socket } from '../socket';

export default function SystemSelector({ selectedSystem, setSelectedSystem }) {
  const [systems, setSystems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get('/systems', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSystems(res.data))
      .catch(err => console.error("Failed to load systems", err));
  }, []);

  useEffect(() => {
    if (systems.length > 0 && !selectedSystem) setSelectedSystem(systems[0]);
  }, [systems, selectedSystem, setSelectedSystem]);

  useEffect(() => {
    if (selectedSystem) socket.emit("join-system", selectedSystem);
  }, [selectedSystem]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontSize: ".78rem", color: "var(--muted)", fontWeight: "500" }}>System</span>
      <select
        className="ls-select"
        value={selectedSystem}
        onChange={e => setSelectedSystem(e.target.value)}
      >
        {systems.map((s, i) => <option key={i} value={s}>{s}</option>)}
      </select>
    </div>
  );
}
