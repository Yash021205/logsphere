import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AgentSetup({ selectedSystem, userRole }) {
  const [installCommand, setInstallCommand] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeOS, setActiveOS] = useState('linux');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedSystem && userRole === 'Admin') {
      setLoading(false);
      setError('select_system');
      return;
    }

    const url = selectedSystem
      ? `/system/install-command?systemId=${selectedSystem}`
      : `/system/install-command?systemId=`;

    axios.get(url)
      .then(res => {
        setInstallCommand(res.data.command || '');
        setError('');
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load install command", err);
        setError('fetch_failed');
        setLoading(false);
      });
  }, [selectedSystem, userRole]);

  const getWindowsCommand = () => {
    // Extract systemId and systemKey from the linux curl command
    const idMatch = installCommand.match(/--systemId "([^"]+)"/);
    const keyMatch = installCommand.match(/--systemKey "([^"]+)"/);
    const urlMatch = installCommand.match(/--ingestUrl "([^"]+)"/);

    const sysId = idMatch ? idMatch[1] : 'YOUR_SYSTEM_ID';
    const sysKey = keyMatch ? keyMatch[1] : 'YOUR_SYSTEM_KEY';
    const baseUrl = urlMatch ? urlMatch[1] : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

    return `Invoke-WebRequest -Uri "${baseUrl}/install.ps1" -OutFile install.ps1; .\\install.ps1 -systemId "${sysId}" -systemKey "${sysKey}" -ingestUrl "${baseUrl}"`;
  };

  const displayCommand = activeOS === 'linux' ? installCommand : getWindowsCommand();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#94a3b8' }}>Loading installation command...</div>;
  }

  return (
    <div style={{ padding: '0 20px' }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.5)',
        maxWidth: '850px',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid #1e293b'
      }}>
        <h2 style={{ color: '#6366f1', marginBottom: '8px' }}>Install Agent</h2>
        <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '0.95rem' }}>
          Run a single command on your server to start streaming telemetry to LogSphere.
        </p>

        {error === 'select_system' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            padding: '15px 20px',
            color: '#fca5a5',
            marginBottom: '20px'
          }}>
            ⚠️ Please switch to the <b>"Live Metrics"</b> tab and select a system first, then return here.
          </div>
        )}

        {error === 'fetch_failed' && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            padding: '15px 20px',
            color: '#fca5a5',
            marginBottom: '20px'
          }}>
            Failed to load the install command. Please ensure your system is registered.
          </div>
        )}

        {!error && (
          <>
            {/* OS Tab Selector */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '20px' }}>
              {['linux', 'windows'].map(os => (
                <button
                  key={os}
                  onClick={() => setActiveOS(os)}
                  style={{
                    padding: '10px 24px',
                    background: activeOS === os ? '#6366f1' : 'transparent',
                    color: activeOS === os ? 'white' : '#94a3b8',
                    border: `1px solid ${activeOS === os ? '#6366f1' : '#334155'}`,
                    borderRadius: os === 'linux' ? '8px 0 0 8px' : '0 8px 8px 0',
                    cursor: 'pointer',
                    fontWeight: activeOS === os ? '600' : '400',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {os === 'linux' ? '🐧 Linux / macOS' : '🪟 Windows'}
                </button>
              ))}
            </div>

            {/* Command Display */}
            <div style={{ position: 'relative' }}>
              <div style={{
                background: '#020617',
                padding: '20px',
                borderRadius: '10px',
                border: '1px solid #1e293b',
                overflowX: 'auto'
              }}>
                <code style={{
                  color: '#10b981',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all'
                }}>
                  {displayCommand}
                </code>
              </div>

              <button
                onClick={copyToClipboard}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  padding: '6px 14px',
                  background: copied ? '#10b981' : 'rgba(99, 102, 241, 0.15)',
                  color: copied ? 'white' : '#6366f1',
                  border: `1px solid ${copied ? '#10b981' : '#6366f1'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>

            {/* How it works */}
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ color: '#cbd5e1', marginBottom: '15px', fontSize: '1rem' }}>How it works</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { step: '1', text: 'Downloads the LogSphere agent binary to your machine' },
                  { step: '2', text: 'Configures your unique credentials automatically' },
                  { step: '3', text: activeOS === 'linux'
                    ? 'Registers a systemd background service that starts on boot'
                    : 'Sets up a Windows Service that runs silently on startup'
                  },
                ].map(item => (
                  <div key={item.step} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{
                      background: '#6366f1',
                      color: 'white',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {item.step}
                    </span>
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verify Section */}
            <div style={{
              marginTop: '25px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid #065f46',
              borderRadius: '8px',
              padding: '15px 20px'
            }}>
              <p style={{ color: '#6ee7b7', fontSize: '0.9rem', margin: 0 }}>
                💡 <b>After running the command</b>, return to the <b>"Live Metrics"</b> tab. Your host should appear within 10 seconds.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
