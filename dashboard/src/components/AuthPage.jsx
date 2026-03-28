import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';
import '../LandingPage.css'; // Reuse landing page styles for consistency

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div className="feature-card" style={{ width: '100%', maxWidth: '450px', background: 'rgba(30, 41, 59, 0.9)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '30px' }}>
          {isLogin ? 'Login to access your dashboard' : 'Join LogSphere and start monitoring'}
        </p>

        {isLogin ? (
          <Login onSwitch={() => setIsLogin(false)} />
        ) : (
          <Signup onSwitch={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}
