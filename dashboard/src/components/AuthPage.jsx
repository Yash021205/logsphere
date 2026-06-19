import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';
import '../LandingPage.css';

const BULLETS = [
  { icon: '⚡', text: 'Real-time telemetry via Socket.IO push' },
  { icon: '🧠', text: 'ML anomaly detection on every metric' },
  { icon: '🛡️', text: 'Multi-tenant RBAC — full data isolation' },
  { icon: '📋', text: 'Log search with Error / Warning / Info filters' },
];

export default function AuthPage() {
  const [view, setView] = useState('login'); // 'login', 'signup', 'forgot'

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
            {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create account' : 'Reset password'}
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '.92rem', marginBottom: '32px' }}>
            {view === 'login' ? 'Sign in to your LogSphere dashboard' : view === 'signup' ? 'Start monitoring your infrastructure today' : 'We will send you a reset link'}
          </p>

          {/* Tab switcher - hide when in forgot password view */}
          {view !== 'forgot' && (
            <div className="auth-tabs">
              <button className={`auth-tab ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>
                Sign In
              </button>
              <button className={`auth-tab ${view === 'signup' ? 'active' : ''}`} onClick={() => setView('signup')}>
                Sign Up
              </button>
            </div>
          )}

          {view === 'login' && <Login  onSwitch={() => setView('signup')} onForgot={() => setView('forgot')} />}
          {view === 'signup' && <Signup onSwitch={() => setView('login')}  />}
          {view === 'forgot' && <ForgotPassword onSwitch={() => setView('login')} />}
        </div>
      </div>
    </div>
  );
}
