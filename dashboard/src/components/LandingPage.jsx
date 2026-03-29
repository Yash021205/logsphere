import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../LandingPage.css';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6366f1' }}>LogSphere</div>
        <Link to="/auth" className="btn-secondary" style={{ padding: '8px 20px', borderRadius: '8px' }}>Login</Link>
      </nav>

      <div className="hero">
        <h1>Distributed Observability <br /> Made Simple.</h1>
        <p>
          The cloud-native logging and monitoring platform for modern engineering teams. 
          Deploy C++ agents across your infrastructure and visualize everything in real-time.
        </p>
        <div className="cta-group">
          <Link to="/auth" className="btn-primary">Get Started</Link>
          <a href="#features" className="btn-secondary">Explore Features</a>
        </div>
      </div>

      <div id="features" className="features-grid">
        <div className="feature-card">
          <h3>Real-time Metrics</h3>
          <p>
            Zero-latency visualization of CPU, memory, and process counts from all your 
            distributed servers and edge devices.
          </p>
        </div>
        <div className="feature-card">
          <h3>Log Aggregation</h3>
          <p>
            Centralized full-text search across your entire infrastructure. 
            Identify errors and anomalies before they impact your users.
          </p>
        </div>
        <div className="feature-card">
          <h3>Intelligent Alerts</h3>
          <p>
            Machine learning-powered anomaly detection that alerts you to "unusual" 
            patterns, not just static threshold breaches.
          </p>
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        &copy; 2026 LogSphere SaaS Platform. Built for scale.
      </footer>
    </div>
  );
}
