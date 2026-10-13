export default function LandingPage({ onNavigate }) {
  const handleRecruiterRedirect = () => {
    localStorage.setItem('landing_role', 'company');
    onNavigate('login');
  };

  const handleAdminRedirect = () => {
    localStorage.setItem('landing_role', 'admin');
    onNavigate('login');
  };

  return (
    <>
      {/* Hero Section */}
      <div className="container">
        <div className="hero-container">
          
          {/* Left Hero Text Content */}
          <div style={{ textAlign: 'left' }}>
            <span className="landing-badge">
              🎓 Centralized Campus Recruitment Platform
            </span>
            <h1 className="hero-title">
              Empowering Students & <span className="accent-title">Recruiters</span> for Career Success
            </h1>
            <p className="hero-subtitle">
              Campus Placement Assistance connects ambitious students, verified recruiters, and placement officers. Experience seamless job discovery, real-time application tracking, automated eligibility matching, and structured interview workflows.
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn-primary" 
                onClick={() => onNavigate('login')}
              >
                🎓 Student Portal
              </button>
              <button 
                className="btn-outline" 
                onClick={handleRecruiterRedirect}
              >
                💼 Recruiter Portal
              </button>
              <button 
                className="btn-outline" 
                onClick={handleAdminRedirect}
                style={{ borderColor: 'var(--slate-300)' }}
              >
                🏛️ Placement Officer
              </button>
            </div>
          </div>

          {/* Right Hero KPI Statistics Grid */}
          <div className="stat-badge-grid">
            <div className="stat-badge-item">
              <div className="stat-val">96.4%</div>
              <div className="stat-desc">Placement Rate</div>
            </div>
            <div className="stat-badge-item">
              <div className="stat-val">120+</div>
              <div className="stat-desc">Corporate Partners</div>
            </div>
            <div className="stat-badge-item">
              <div className="stat-val">3,200+</div>
              <div className="stat-desc">Registered Students</div>
            </div>
            <div className="stat-badge-item">
              <div className="stat-val">₹14.5L</div>
              <div className="stat-desc">Average CTC (IT)</div>
            </div>
          </div>

        </div>
      </div>

      {/* Core Platform Features Section */}
      <div className="container feature-section">
        <h2 style={{ fontSize: '30px', fontWeight: 800, marginBottom: '8px', fontFamily: "'Outfit', sans-serif" }}>
          Engineered for Enterprise Campus Recruitment
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto' }}>
          A secure, multi-role recruitment workflow powered by a modern Java Spring Boot backend and intuitive user experience.
        </p>
        
        <div className="grid-3">
          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              💻
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Stream-Specific Matching</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Automated evaluation rules that verify minimum CGPA, departmental eligibility, and required skills for IT and Non-IT career streams.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)' }}>
              📊
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Real-Time Application Lifecycle</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Trace candidate progression through verifiable milestones: Applied, Under Review, Shortlisted, Interview Scheduled, and Final Selection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon" style={{ background: '#ede9fe', color: 'var(--accent-purple)' }}>
              🛡️
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Placement Officer Governance</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>
              Centralized administrative dashboard for company verification, placement drive analytics, audit logging, and recruitment reports.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', backgroundColor: 'var(--white)', borderTop: '1px solid var(--slate-200)', padding: '28px 0', textAlign: 'center', fontSize: '14px', color: 'var(--slate-500)', fontWeight: 500 }}>
        <div className="container" style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            &copy; 2026 <strong>Campus Placement Assistance</strong>. Built with Java 21, Spring Boot 3 & React.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span style={{ color: 'var(--slate-600)', fontSize: '13px' }}>Spring Security RBAC</span>
            <span style={{ color: 'var(--slate-600)', fontSize: '13px' }}>REST API v1</span>
            <span style={{ color: 'var(--slate-600)', fontSize: '13px' }}>MySQL / H2 JPA</span>
          </div>
        </div>
      </footer>
    </>
  );
}
