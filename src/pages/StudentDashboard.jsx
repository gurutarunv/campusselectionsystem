import React, { useState, useEffect } from 'react';

export default function StudentDashboard({ user, onNavigate, onBack }) {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (!user) return;

    const usernameKey = user.username.toLowerCase();
    
    // Load student profile
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const currentProfile = profiles[usernameKey];
    if (currentProfile) {
      setProfile(currentProfile);
    } else {
      // Fallback
      setProfile({
        name: localStorage.getItem('studentName') || user.username,
        email: localStorage.getItem('studentEmail') || user.email || 'No email',
        mobile: localStorage.getItem('studentMobile') || 'No mobile',
        gender: localStorage.getItem('gender') || 'Not specified',
        skills: []
      });
    }

    // Load applications list
    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const filteredApps = allApplications.filter(
      (app) => app.studentUsername.toLowerCase() === usernameKey
    );
    setApplications(filteredApps);
  }, [user]);

  if (!user || !profile) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading Portal...</div>;
  }

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user.username[0].toUpperCase();

  return (
    <div className="container">
      
      {/* Student Profile Overview Panel */}
      <div className="profile-panel">
        <div className="profile-avatar">{initials || 'S'}</div>
        <div className="profile-details" style={{ flex: 1 }}>
          <div className="profile-name">{profile.name}</div>
          <div className="profile-meta">
            📧 {profile.email} &nbsp;|&nbsp; 📱 {profile.mobile} &nbsp;|&nbsp; ⚧ {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="req-tag" 
                  style={{
                    background: 'rgba(255, 107, 0, 0.08)',
                    color: 'var(--primary)',
                    border: '1px solid rgba(255, 107, 0, 0.15)',
                    fontSize: '12px',
                    padding: '3px 10px'
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--slate-600)', fontSize: '13px', fontStyle: 'italic' }}>
                No skills specified yet.
              </span>
            )}
          </div>
        </div>
        <div>
          <button 
            className="btn-outline" 
            style={{ padding: '8px 16px', fontSize: '14px' }}
            onClick={() => onNavigate('onboarding')}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stream Selection Cards */}
      <h2 style={{ fontSize: '24px', textAlign: 'left', marginBottom: '5px' }}>Select Job Stream</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Explore placements and company openings matching your stream.
      </p>
      
      <div className="grid-2">
        {/* IT STREAM CARD */}
        <div className="stream-card" onClick={() => onNavigate('it-placements')}>
          <div className="stream-icon">💻</div>
          <h2>IT Opportunities</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Explore software engineering, web development, cloud support, data science, and security roles at top tech companies.
          </p>
          <button className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>View IT Openings</button>
        </div>

        {/* NON-IT STREAM CARD */}
        <div className="stream-card" onClick={() => onNavigate('non-it-placements')}>
          <div className="stream-icon">🩺</div>
          <h2>Non-IT Opportunities</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Browse registered nurse positions, health administrators, clinical coordinators, and life science careers.
          </p>
          <button 
            className="btn-primary" 
            style={{ 
              marginTop: '10px', 
              width: '100%', 
              background: 'linear-gradient(135deg, var(--secondary), #ffb27a)',
              boxShadow: '0 4px 12px rgba(255, 142, 60, 0.2)' 
            }}
          >
            View Non-IT Openings
          </button>
        </div>
      </div>

      {/* Applied Jobs Panel */}
      <div style={{ marginTop: '50px' }}>
        <h2 style={{ fontSize: '24px', textAlign: 'left', marginBottom: '5px' }}>Your Job Applications</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Track the status of your sent placement files.</p>
        
        <div className="premium-table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Job Position</th>
                <th>Stream</th>
                <th>Applied Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{app.company}</td>
                    <td>{app.job}</td>
                    <td>
                      <span className="req-tag" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {app.stream}
                      </span>
                    </td>
                    <td style={{ color: 'var(--slate-600)' }}>{app.date}</td>
                    <td>
                      <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--slate-600)', padding: '30px' }}>
                    You haven't applied to any job openings yet. Click one of the streams above to search and apply!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
