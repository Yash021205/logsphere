import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { socket } from '../socket';

export default function SystemSelector({ selectedSystem, setSelectedSystem }) {
  const [systems, setSystems] = useState([]);

  useEffect(() => {
    axios.get('/systems')
      .then(res => setSystems(res.data))
      .catch(err => console.error("Failed to load systems", err));
  }, []);

  useEffect(() => {
    if (systems.length > 0 && !selectedSystem) {
      setSelectedSystem(systems[0]);
    }
  }, [systems, selectedSystem, setSelectedSystem]);

  useEffect(() => {
    if (selectedSystem) {
      socket.emit("join-system", selectedSystem);
    }
  }, [selectedSystem]);

  return (
    <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Select System:</label>
      <select 
        value={selectedSystem} 
        onChange={e => setSelectedSystem(e.target.value)}
        style={{
          padding: "6px 12px",
          borderRadius: "8px",
          background: "#1e293b",
          color: "white",
          border: "1px solid #334155",
          cursor: "pointer"
        }}
      >
        {systems.map((sys, i) => (
          <option key={i} value={sys}>{sys}</option>
        ))}
      </select>
    </div>
  );
}
