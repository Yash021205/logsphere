import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import '../LandingPage.css';

const BULLETS = [
  { icon: '⚡', text: 'Real-time telemetry via Socket.IO push' },
  { icon: '🧠', text: 'ML anomaly detection on every metric' },
  { icon: '🛡️', text: 'Multi-tenant RBAC — full data isolation' },
  { icon: '📋', text: 'Log search with Error / Warning / Info filters' },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-wrap">
      {/* Ambient orbs */}
      <div className="lp-orbs">
        <div className="lp-orb lp-orb-1" />
        <div className="lp-orb lp-orb-2" />
      </div>
      <div className="lp-grid" />

      {/* Left brand panel */}
      <div className="auth-left">
        <div className="auth-logo text-gradient">LogSphere</div>
        <h2 className="auth-tagline">
          Observe your whole<br />
          <span className="text-gradient-cyan">infrastructure</span> in one place.
        </h2>
        <p className="auth-sub">
          Deploy C++ agents anywhere, stream metrics and logs in real-time,
          and get alerted before problems reach your users.
        </p>
        <div className="auth-bullets">
          {BULLETS.map(b => (
            <div className="auth-bullet" key={b.text}>
              <span className="auth-bullet-icon">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '700', marginBottom: '6px', letterSpacing: '-.02em' }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.92rem', marginBottom: '32px' }}>
            {isLogin ? 'Sign in to your LogSphere dashboard' : 'Start monitoring your infrastructure today'}
          </p>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
              Sign In
            </button>
            <button className={`auth-tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
              Sign Up
            </button>
          </div>

          {isLogin
            ? <Login  onSwitch={() => setIsLogin(false)} />
            : <Signup onSwitch={() => setIsLogin(true)}  />
          }
        </div>
      </div>
    </div>
  );
}
