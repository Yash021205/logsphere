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

      {/* Centered card */}
      <div className="auth-card">
        {/* Big logo */}
        <div className="auth-logo text-gradient">LogSphere</div>

        <h1 className="auth-card-title">
          {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create account' : 'Reset password'}
        </h1>
        <p className="auth-card-sub">
          {view === 'login' ? 'Sign in to your LogSphere dashboard' : view === 'signup' ? 'Start monitoring your infrastructure today' : 'We will send you a reset link'}
        </p>

        {view !== 'forgot' && (
          <div className="auth-tabs">
            <button className={`auth-tab ${view === 'login' ? 'active' : ''}`} onClick={() => setView('login')}>Sign In</button>
            <button className={`auth-tab ${view === 'signup' ? 'active' : ''}`} onClick={() => setView('signup')}>Sign Up</button>
          </div>
        )}

        {view === 'login' && <Login  onSwitch={() => setView('signup')} onForgot={() => setView('forgot')} />}
        {view === 'signup' && <Signup onSwitch={() => setView('login')}  />}
        {view === 'forgot' && <ForgotPassword onSwitch={() => setView('login')} />}
      </div>
    </div>
  );
}
