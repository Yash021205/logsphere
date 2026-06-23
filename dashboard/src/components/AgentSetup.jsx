import React, { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AgentSetup() {
  const [copied, setCopied]   = useState(false);
  const [activeOS, setActiveOS] = useState('linux');

  // ── New simple commands — no credentials needed ──────────────
  const commands = {
    linux:
      `curl -sL "${BASE_URL}/install.sh" | bash -s -- --ingestUrl "${BASE_URL}"`,
    windows:
      `Invoke-WebRequest -Uri "${BASE_URL}/install.ps1" -OutFile install.ps1; .\\install.ps1 -ingestUrl "${BASE_URL}"`
  };

  const displayCommand = commands[activeOS];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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
          Run a single command on your server. The agent will appear on this page automatically — no credentials needed.
        </p>

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

        {/* Admin mode warning for Windows */}
        {activeOS === 'windows' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            marginBottom: '16px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '8px',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>🛡️</span>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
              <b>Important:</b> Open PowerShell as <b>Administrator</b> (right-click → "Run as Administrator") before running the command below.
            </p>
          </div>
        )}

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
              { step: '1', text: 'Downloads and installs the LogSphere agent on your machine' },
              { step: '2', text: 'Agent starts and announces itself — appears above as a pending device' },
              { step: '3', text: 'You click [Claim Device] — credentials are provisioned automatically' },
              { step: '4', text: activeOS === 'linux'
                  ? 'Agent registers as a systemd service and starts monitoring immediately'
                  : 'Agent starts monitoring and sends telemetry to your dashboard'
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

        {/* Info box */}
        <div style={{
          marginTop: '25px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid #3730a3',
          borderRadius: '8px',
          padding: '15px 20px'
        }}>
          <p style={{ color: '#a5b4fc', fontSize: '0.9rem', margin: 0 }}>
            💡 <b>After running the command</b>, scroll up to <b>"New Devices Detected"</b> — your device will appear within seconds. Click <b>[Claim Device]</b> to start monitoring.
          </p>
        </div>

      </div>
    </div>
  );
}