import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import '../LandingPage.css';

export default function AgentSetup({ selectedSystem, userRole }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/system/config';
    if (selectedSystem) {
      url += `?systemId=${selectedSystem}`;
    }
    
    axios.get(url)
      .then(res => {
        setConfig(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load config", err);
        setConfig(null);
        setLoading(false);
      });
  }, [selectedSystem]);

  const downloadConfig = () => {
    if (!config) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      systemId: config.systemId,
      systemKey: config.systemKey,
      ingestUrl: config.ingestUrl
    }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadAgent = () => {
    window.open("http://localhost:5000/system/agent", "_blank");
  };

  if (loading) return <div style={{ padding: '40px', color: '#94a3b8' }}>Loading configuration...</div>;

  return (
    <div style={{ padding: '0 20px' }}>
      <div className="feature-card" style={{ background: 'rgba(30, 41, 59, 0.5)', maxWidth: '800px' }}>
        <h2 style={{ color: '#6366f1', marginBottom: '20px' }}>Setup Your Agent</h2>
        
        <p style={{ color: '#cbd5e1', marginBottom: '30px' }}>
          Follow these 3 steps to start streaming telemetry from your server or laptop.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <section>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>1. Download the Binary</h3>
            <p style={{ color: '#94a3b8', marginBottom: '15px' }}>Download the pre-compiled C++ agent for your operating system.</p>
            <button className="btn-secondary" style={{ border: '1px solid #6366f1', color: '#6366f1' }} onClick={downloadAgent}>
              Download LogSphere Agent (JS Script)
            </button>
          </section>

          <section>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>2. Get your Configuration</h3>
            {userRole === "Admin" && !selectedSystem && (
               <p style={{ color: '#ef4444', marginBottom: '15px', fontWeight: 'bold' }}>
                 ⚠️ Please switch to the "Live Metrics" tab and select a specific system from the top dropdown, then return here to download its configuration.
               </p>
            )}
            <p style={{ color: '#94a3b8', marginBottom: '15px' }}>Click below to download your unique <code>config.json</code>. Place this file in the same folder as the agent binary.</p>
            <button className="btn-primary" onClick={downloadConfig}>
              Download config.json
            </button>
          </section>

          <section>
            <h3 style={{ color: 'white', marginBottom: '10px' }}>3. Run and Verify</h3>
            <p style={{ color: '#94a3b8', marginBottom: '10px' }}>Simply run the executable. The agent will read your credentials and start pushing data immediately.</p>
            <div style={{ background: '#020617', padding: '15px', borderRadius: '8px', border: '1px solid #1e293b' }}>
              <code style={{ color: '#10b981' }}>node agent.js</code>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
