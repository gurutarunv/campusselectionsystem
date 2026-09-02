import React from 'react';

export default function LandingPage({ onNavigate }) {
  const handleRecruiterRedirect = () => {
    localStorage.setItem('landing_role', 'company');
    onNavigate('login');
  };

  return (
    <>
      {/* Hero Section */}
      <div className="container">
        <div className="hero-container">
          
          {/* Text Content */}
          <div style={{ textAlign: 'left' }}>
            <span className="landing-badge">🔥 Empowering Tech Careers</span>
            <h1 className="hero-title">
              Scale Your Coding Career to <span className="accent-title">New Heights</span>
            </h1>
            <p className="hero-subtitle">
              Accelerate your skills with direct industry mentors, interactive practical placements, and live recruitment tunnels. Join India's leading career portal for candidates and hiring partners.
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn-primary" 
                onClick={() => onNavigate('login')}
              >
                Get Started As Student
              </button>
              <button 
                className="btn-outline" 
                onClick={handleRecruiterRedirect}
              >
                Recruiter Tunnel
              </button>
            </div>
          </div>

          {/* Graphical Grid Display */}
          <div className="stat-badge-grid">
            <div className="stat-badge-item">
              <div className="stat-val">98%</div>
              <div className="stat-desc">Placement rate</div>
            </div>
            <div className="stat-badge-item">
              <div className="stat-val">100+</div>
              <div className="stat-desc">Hiring Partners</div>
            </div>
            <div className="stat-badge-item">
              <div className="stat-val">2.5K+</div>
              <div className="stat-desc">Active Students</div>
            </div>
            <div className="stat-badge-item">
              <div className="stat-val">10K+</div>
              <div className="stat-desc">Alumni Network</div>
            </div>
          </div>

        </div>
      </div>

      {/* Features Section */}
      <div className="container feature-section">
        <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Built for Real-Time Outcomes</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          Our professional training infrastructure ensures highly active recruitment files.
        </p>
        
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div className="feature-card">
            <div className="feature-icon">💻</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Vetted Coding Portals</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Direct evaluation routes mapped directly to IT and Software Development streams at tech giants.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📁</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Persistent Placements</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Instant client-side matching. Submit profiles directly and trace application evaluations in real time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👩‍💼</div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Enterprise Recruiter Tools</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Sleek analytics dashboards to filter profiles, post new openings, and shortlist candidates in the browser.
            </p>
          </div>
        </div>
      </div>

      <footer style={{ marginTop: 'auto', backgroundColor: 'var(--white)', borderTop: '1px solid var(--slate-200)', padding: '25px 0', textAlign: 'center', fontSize: '14px', color: 'var(--slate-600)', fontWeight: 500 }}>
        &copy; 2026 10000 Coders. All rights reserved. Managed with premium orange & white styling.
      </footer>
    </>
  );
}
