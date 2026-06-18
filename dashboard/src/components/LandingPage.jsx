import React from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time Telemetry',
    desc: 'Sub-second CPU, memory and process streaming from every node in your fleet via Socket.IO.'
  },
  {
    icon: '🧠',
    title: 'Anomaly Detection',
    desc: 'Statistical models flag unusual spikes automatically — catch incidents before your users do.'
  },
  {
    icon: '📋',
    title: 'Log Aggregation',
    desc: 'Full-text search with Error / Warning / Info severity filters across all your distributed hosts.'
  },
  {
    icon: '🔔',
    title: 'Intelligent Alerts',
    desc: 'Configurable CPU & memory thresholds. Alerts fire instantly over WebSocket push.'
  },
  {
    icon: '🔮',
    title: 'Load Forecasting',
    desc: 'Predictive analysis tells you how long until your system hits 90% — act before it happens.'
  },
  {
    icon: '🛡️',
    title: 'Multi-tenant RBAC',
    desc: 'Admins see every system. Clients see only their own. Scoped JWTs enforce isolation at every API.'
  }
];

const STEPS = [
  { n: '1', title: 'Install Agent', desc: 'One-line command. No credentials required.' },
  { n: '2', title: 'Device Appears', desc: 'It shows up in your dashboard within seconds.' },
  { n: '3', title: 'Click Claim', desc: 'One click provisions a unique system key.' },
  { n: '4', title: 'Live Metrics', desc: 'Telemetry starts flowing immediately.' }
];

export default function LandingPage() {
  return (
    <div className="lp-wrap">
      {/* Ambient background */}
      <div className="lp-orbs">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
        <div className="lp-orb lp-orb-3" />
      </div>
      <div className="lp-grid" />

      {/* Nav */}
      <nav className="lp-nav">
        <div className="lp-logo">LogSphere</div>
        <div className="lp-nav-actions">
          <Link to="/auth" className="btn-secondary" style={{ fontSize: '.88rem', padding: '9px 20px' }}>
            Sign In
          </Link>
          <Link to="/auth" className="btn-primary" style={{ fontSize: '.88rem', padding: '9px 20px' }}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="lp-hero anim-fade-up">
        <div className="lp-badge">
          <span className="lp-badge-dot" />
          Real-time distributed observability
        </div>
        <h1 className="lp-h1">
          <span>Monitor Everything.</span>
          <span className="text-gradient">Fix It Fast.</span>
        </h1>
        <p className="lp-sub">
          Deploy lightweight C++ agents across your infrastructure in seconds.
          Stream metrics, logs and anomalies — all in one beautiful dark dashboard.
        </p>
        <div className="lp-ctas">
          <Link to="/auth" className="btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
            Start Monitoring Free
          </Link>
          <a href="#features" className="btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
            See Features
          </a>
        </div>
      </section>

      {/* Stats */}
      <div className="lp-stats glass" style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', marginBottom: '80px', maxWidth: '700px', width: 'calc(100% - 80px)', margin: '0 auto 80px' }}>
        {[
          { num: '<100ms', label: 'Ingest Latency' },
          { num: '24/7',   label: 'Real-time Push' },
          { num: '∞',      label: 'Agents Supported' }
        ].map(s => (
          <div className="lp-stat" key={s.label}>
            <div className="lp-stat-num">{s.num}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Terminal preview */}
      <div className="lp-terminal">
        <div className="lp-terminal-inner">
          <div className="lp-terminal-bar">
            <span className="lp-t-dot lp-t-dot-r" />
            <span className="lp-t-dot lp-t-dot-y" />
            <span className="lp-t-dot lp-t-dot-g" />
            <span className="lp-terminal-title">bash — LogSphere Agent Install</span>
          </div>
          <div className="lp-terminal-body">
            <div className="lp-t-line">
              <span className="lp-t-prompt">$</span>
              <span className="lp-t-cmd">curl -sL "{BASE_URL}/install.sh" | bash -s -- --ingestUrl "{BASE_URL}"</span>
            </div>
            <div className="lp-t-line"><span className="lp-t-out">  Downloading LogSphere agent binary...</span></div>
            <div className="lp-t-line"><span className="lp-t-out">  Writing config to /etc/logsphere/</span></div>
            <div className="lp-t-line"><span className="lp-t-out">  Registering systemd service...</span></div>
            <div className="lp-t-line"><span className="lp-t-ok">  ✓ Agent running — waiting for claim at your dashboard.</span></div>
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="lp-features">
        <h2 className="lp-features-title">
          Built for <span className="text-gradient">Modern Teams</span>
        </h2>
        <div className="lp-features-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="lp-feat glass">
              <span className="lp-feat-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="lp-how">
        <h2>Up and running in <span className="text-gradient">4 steps</span></h2>
        <div className="lp-steps">
          {STEPS.map(s => (
            <div key={s.n} className="lp-step glass">
              <div className="lp-step-num">{s.n}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-logo" style={{ marginBottom: '10px', display: 'inline-block' }}>LogSphere</div>
        <p>© 2026 <strong>LogSphere</strong> — Distributed Observability Platform. Built for scale.</p>
      </footer>
    </div>
  );
}
