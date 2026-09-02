import React, { useState, useEffect } from 'react';

export default function JobOpeningsPage({ user, streamType, onNavigate, onBack, addToast }) {
  const [studentApps, setStudentApps] = useState([]);
  
  // Track selected job position for each card
  const [selectedPositions, setSelectedPositions] = useState({});

  useEffect(() => {
    if (!user) return;
    loadAppliedJobs();

    // Set default selected positions based on stream type
    if (streamType === 'IT') {
      setSelectedPositions({
        'Google-1': 'Software Engineer',
        'Google-2': 'Data Scientist',
        'Amazon-1': 'Software Development Engineer',
        'Amazon-2': 'Cloud Support Engineer'
      });
    } else {
      setSelectedPositions({
        'Mayo Clinic-1': 'Registered Nurse (RN)',
        'Mayo Clinic-2': 'Medical Doctor (MD)',
        'UnitedHealth Group-1': 'Health Information Manager',
        'UnitedHealth Group-2': 'Clinical Research Coordinator'
      });
    }
  }, [user, streamType]);

  const loadAppliedJobs = () => {
    const usernameKey = user.username.toLowerCase();
    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const filteredApps = allApplications.filter(
      (app) => app.studentUsername.toLowerCase() === usernameKey
    );
    setStudentApps(filteredApps);
  };

  const handlePositionChange = (cardKey, value) => {
    setSelectedPositions((prev) => ({
      ...prev,
      [cardKey]: value
    }));
  };

  const handleApply = (company, cardKey) => {
    const jobPosition = selectedPositions[cardKey];
    if (!jobPosition) return;

    const confirmApply = window.confirm(
      `Are you sure you want to apply for the "${jobPosition}" position at ${company}?`
    );
    if (!confirmApply) return;

    const usernameKey = user.username.toLowerCase();
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const profile = profiles[usernameKey];
    const studentName = profile ? profile.name : user.username;

    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];

    const newApplication = {
      studentUsername: user.username,
      studentName: studentName,
      company: company,
      job: jobPosition,
      stream: streamType,
      date: new Date().toISOString().split('T')[0],
      status: 'Applied'
    };

    allApplications.push(newApplication);
    localStorage.setItem('job_applications', JSON.stringify(allApplications));

    addToast(`Successfully applied to ${company} for ${jobPosition}!`, 'success');
    
    // Refresh application states
    loadAppliedJobs();
  };

  const isApplied = (company, cardKey) => {
    const selectedJob = selectedPositions[cardKey];
    if (!selectedJob) return false;

    return studentApps.some(
      (app) => 
        app.company.toLowerCase() === company.toLowerCase() && 
        app.job.toLowerCase() === selectedJob.toLowerCase()
    );
  };

  // Render cards depending on IT / NON-IT
  const renderJobCards = () => {
    if (streamType === 'IT') {
      return (
        <>
          {/* Google Card 1 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(66, 133, 244, 0.08)', color: '#4285F4', borderColor: 'rgba(66, 133, 244, 0.15)' }}
                >
                  G
                </div>
                <div className="job-title-block">
                  <div className="job-company">Google</div>
                  <div className="job-title">Technical Infrastructure & Coding</div>
                </div>
              </div>
              <span className="job-openings-badge">500 Openings</span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Bachelor's in Computer Science</li>
                <li className="req-tag">Java / Python / C++</li>
                <li className="req-tag">Agile Methodologies</li>
                <li className="req-tag">Problem Solving</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-google-1">Position:</label>
                <select 
                  id="select-google-1" 
                  value={selectedPositions['Google-1'] || 'Software Engineer'}
                  onChange={(e) => handlePositionChange('Google-1', e.target.value)}
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                </select>
              </div>
              
              {isApplied('Google', 'Google-1') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleApply('Google', 'Google-1')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Google Card 2 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(234, 67, 53, 0.08)', color: '#EA4335', borderColor: 'rgba(234, 67, 53, 0.15)' }}
                >
                  G
                </div>
                <div className="job-title-block">
                  <div className="job-company">Google</div>
                  <div className="job-title">Analytics & Intelligence</div>
                </div>
              </div>
              <span 
                className="job-openings-badge" 
                style={{ background: 'rgba(234, 67, 53, 0.08)', color: '#EA4335', borderColor: 'rgba(234, 67, 53, 0.15)' }}
              >
                200 Openings
              </span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Master's in Data Science</li>
                <li className="req-tag">Machine Learning</li>
                <li className="req-tag">Python & SQL</li>
                <li className="req-tag">Analytical Skills</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-google-2">Position:</label>
                <select 
                  id="select-google-2" 
                  value={selectedPositions['Google-2'] || 'Data Scientist'}
                  onChange={(e) => handlePositionChange('Google-2', e.target.value)}
                >
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Software Engineer">Software Engineer</option>
                </select>
              </div>
              
              {isApplied('Google', 'Google-2') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleApply('Google', 'Google-2')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Amazon Card 1 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(255, 153, 0, 0.08)', color: '#FF9900', borderColor: 'rgba(255, 153, 0, 0.15)' }}
                >
                  A
                </div>
                <div className="job-title-block">
                  <div className="job-company">Amazon</div>
                  <div className="job-title">Core Retail & AWS Dev</div>
                </div>
              </div>
              <span className="job-openings-badge">1000 Openings</span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Bachelor's in Computer Science</li>
                <li className="req-tag">Java / C++ / Python</li>
                <li className="req-tag">Systems Design</li>
                <li className="req-tag">Problem Solving</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-amazon-1">Position:</label>
                <select 
                  id="select-amazon-1" 
                  value={selectedPositions['Amazon-1'] || 'Software Development Engineer'}
                  onChange={(e) => handlePositionChange('Amazon-1', e.target.value)}
                >
                  <option value="Software Development Engineer">Software Development Engineer</option>
                  <option value="Cloud Support Engineer">Cloud Support Engineer</option>
                </select>
              </div>
              
              {isApplied('Amazon', 'Amazon-1') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleApply('Amazon', 'Amazon-1')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Amazon Card 2 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(255, 153, 0, 0.08)', color: '#232F3E', borderColor: 'rgba(255, 153, 0, 0.15)' }}
                >
                  A
                </div>
                <div className="job-title-block">
                  <div className="job-company">Amazon</div>
                  <div className="job-title">AWS Enterprise Support</div>
                </div>
              </div>
              <span 
                className="job-openings-badge" 
                style={{ background: 'rgba(35, 47, 62, 0.08)', color: '#232F3E', borderColor: 'rgba(35, 47, 62, 0.15)' }}
              >
                300 Openings
              </span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Bachelor's in Computer Science</li>
                <li className="req-tag">AWS or Azure Certified</li>
                <li className="req-tag">Networking & Security</li>
                <li className="req-tag">Good Communication</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-amazon-2">Position:</label>
                <select 
                  id="select-amazon-2" 
                  value={selectedPositions['Amazon-2'] || 'Cloud Support Engineer'}
                  onChange={(e) => handlePositionChange('Amazon-2', e.target.value)}
                >
                  <option value="Cloud Support Engineer">Cloud Support Engineer</option>
                  <option value="Software Development Engineer">Software Development Engineer</option>
                </select>
              </div>
              
              {isApplied('Amazon', 'Amazon-2') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => handleApply('Amazon', 'Amazon-2')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </>
      );
    } else {
      // Non-IT Placements
      const nonItTheme = {
        background: 'linear-gradient(135deg, var(--secondary), #ffb27a)',
        boxShadow: '0 4px 12px rgba(255, 142, 60, 0.2)'
      };

      return (
        <>
          {/* Mayo Clinic Card 1 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.15)' }}
                >
                  M
                </div>
                <div className="job-title-block">
                  <div className="job-company">Mayo Clinic</div>
                  <div className="job-title">Clinical Nursing & Care</div>
                </div>
              </div>
              <span 
                className="job-openings-badge" 
                style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.15)' }}
              >
                500 Openings
              </span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Associate's Degree in Nursing</li>
                <li className="req-tag">Current RN Licensure</li>
                <li className="req-tag">BLS Certification</li>
                <li className="req-tag">Good Interpersonal Skills</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-mayo-1">Position:</label>
                <select 
                  id="select-mayo-1" 
                  value={selectedPositions['Mayo Clinic-1'] || 'Registered Nurse (RN)'}
                  onChange={(e) => handlePositionChange('Mayo Clinic-1', e.target.value)}
                >
                  <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                  <option value="Medical Doctor (MD)">Medical Doctor (MD)</option>
                </select>
              </div>
              
              {isApplied('Mayo Clinic', 'Mayo Clinic-1') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  style={nonItTheme}
                  onClick={() => handleApply('Mayo Clinic', 'Mayo Clinic-1')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* Mayo Clinic Card 2 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#059669', borderColor: 'rgba(16, 185, 129, 0.15)' }}
                >
                  M
                </div>
                <div className="job-title-block">
                  <div className="job-company">Mayo Clinic</div>
                  <div className="job-title">Physician & Diagnostics</div>
                </div>
              </div>
              <span 
                className="job-openings-badge" 
                style={{ background: 'rgba(5, 150, 105, 0.08)', color: '#059669', borderColor: 'rgba(5, 150, 105, 0.15)' }}
              >
                200 Openings
              </span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">M.D. or D.O. Degree</li>
                <li className="req-tag">Residency Completed</li>
                <li className="req-tag">Active Medical License</li>
                <li className="req-tag">Diagnostic Skills</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-mayo-2">Position:</label>
                <select 
                  id="select-mayo-2" 
                  value={selectedPositions['Mayo Clinic-2'] || 'Medical Doctor (MD)'}
                  onChange={(e) => handlePositionChange('Mayo Clinic-2', e.target.value)}
                >
                  <option value="Medical Doctor (MD)">Medical Doctor (MD)</option>
                  <option value="Registered Nurse (RN)">Registered Nurse (RN)</option>
                </select>
              </div>
              
              {isApplied('Mayo Clinic', 'Mayo Clinic-2') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  style={nonItTheme}
                  onClick={() => handleApply('Mayo Clinic', 'Mayo Clinic-2')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* UnitedHealth Group Card 1 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(30, 60, 114, 0.08)', color: '#1e3c72', borderColor: 'rgba(30, 60, 114, 0.15)' }}
                >
                  U
                </div>
                <div className="job-title-block">
                  <div className="job-company">UnitedHealth Group</div>
                  <div className="job-title">Health Administration</div>
                </div>
              </div>
              <span 
                className="job-openings-badge" 
                style={{ background: 'rgba(30, 60, 114, 0.08)', color: '#1e3c72', borderColor: 'rgba(30, 60, 114, 0.15)' }}
              >
                100 Openings
              </span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Bachelor's in Health Management</li>
                <li className="req-tag">RHIA or RHIT Certification</li>
                <li className="req-tag">EHR Database Experience</li>
                <li className="req-tag">Organizational Skills</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-uhg-1">Position:</label>
                <select 
                  id="select-uhg-1" 
                  value={selectedPositions['UnitedHealth Group-1'] || 'Health Information Manager'}
                  onChange={(e) => handlePositionChange('UnitedHealth Group-1', e.target.value)}
                >
                  <option value="Health Information Manager">Health Information Manager</option>
                  <option value="Clinical Research Coordinator">Clinical Research Coordinator</option>
                </select>
              </div>
              
              {isApplied('UnitedHealth Group', 'UnitedHealth Group-1') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  style={nonItTheme}
                  onClick={() => handleApply('UnitedHealth Group', 'UnitedHealth Group-1')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>

          {/* UnitedHealth Group Card 2 */}
          <div className="job-card">
            <div className="job-header">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div 
                  className="company-logo-text" 
                  style={{ background: 'rgba(30, 60, 114, 0.08)', color: '#2a5298', borderColor: 'rgba(30, 60, 114, 0.15)' }}
                >
                  U
                </div>
                <div className="job-title-block">
                  <div className="job-company">UnitedHealth Group</div>
                  <div className="job-title">Clinical Research & Trials</div>
                </div>
              </div>
              <span 
                className="job-openings-badge" 
                style={{ background: 'rgba(42, 82, 152, 0.08)', color: '#2a5298', borderColor: 'rgba(42, 82, 152, 0.15)' }}
              >
                50 Openings
              </span>
            </div>

            <div className="job-body">
              <div className="req-title">Qualifications & Tech Stack:</div>
              <ul className="req-list">
                <li className="req-tag">Bachelor's in Life Sciences</li>
                <li className="req-tag">Clinical Trials Experience</li>
                <li className="req-tag">Knowledge of Medical Protocols</li>
                <li className="req-tag">Strong Analytical Ability</li>
              </ul>
            </div>

            <div className="job-footer">
              <div className="job-select-group">
                <label htmlFor="select-uhg-2">Position:</label>
                <select 
                  id="select-uhg-2" 
                  value={selectedPositions['UnitedHealth Group-2'] || 'Clinical Research Coordinator'}
                  onChange={(e) => handlePositionChange('UnitedHealth Group-2', e.target.value)}
                >
                  <option value="Clinical Research Coordinator">Clinical Research Coordinator</option>
                  <option value="Health Information Manager">Health Information Manager</option>
                </select>
              </div>
              
              {isApplied('UnitedHealth Group', 'UnitedHealth Group-2') ? (
                <button 
                  className="btn-primary" 
                  disabled 
                  style={{ background: '#10B981', boxShadow: 'none' }}
                >
                  ✓ Applied
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  style={nonItTheme}
                  onClick={() => handleApply('UnitedHealth Group', 'UnitedHealth Group-2')}
                >
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </>
      );
    }
  };

  return (
    <div className="container">
      {/* Breadcrumbs */}
      <div className="breadcrumb-nav">
        <a href="#dashboard" onClick={(e) => { e.preventDefault(); onBack(); }}>Dashboard</a>
        <span>/</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {streamType === 'IT' ? 'IT Placements' : 'Non-IT Placements'}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 
            className="accent-title" 
            style={
              streamType === 'NON-IT' 
                ? { fontWeight: 800, textAlign: 'left', background: 'linear-gradient(120deg, var(--secondary), #ffb27a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
                : { fontWeight: 800, textAlign: 'left' }
            }
          >
            {streamType === 'IT' ? 'IT Placement Openings' : 'Non-IT Placement Openings'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {streamType === 'IT' 
              ? 'Apply to active technical openings matched with 10000 Coders.' 
              : 'Browse medical and health services roles matching 10000 Coders.'}
          </p>
        </div>
        <button className="btn-outline" onClick={onBack}>⬅ Back</button>
      </div>

      {/* Jobs Grid Container */}
      <div className="jobs-grid">
        {renderJobCards()}
      </div>
    </div>
  );
}
