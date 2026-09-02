import React, { useState, useEffect } from 'react';

export default function RecruiterDashboard({ user, onNavigate, onBack, addToast }) {
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [profiles, setProfiles] = useState({});
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalShow, setIsModalShow] = useState(false); // for animation class
  
  // Post Job form states
  const [companyName, setCompanyName] = useState('');
  const [stream, setStream] = useState('IT');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [requirements, setRequirements] = useState('');

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const loadRecruiterData = () => {
    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const allPostedJobs = JSON.parse(localStorage.getItem('posted_jobs')) || [];
    const allProfiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    
    setApplications(allApplications);
    setPostedJobs(allPostedJobs);
    setProfiles(allProfiles);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setIsModalShow(true), 10);
  };

  const handleCloseModal = () => {
    setIsModalShow(false);
    setTimeout(() => setIsModalOpen(false), 300);
  };

  const handlePostJobSubmit = (e) => {
    e.preventDefault();

    const trimmedCompany = companyName.trim();
    const trimmedTitle = jobTitle.trim();
    const trimmedDesc = jobDesc.trim();

    if (!trimmedCompany || !trimmedTitle || !trimmedDesc || !requirements) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    const requirementsArray = requirements
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r !== '');

    const currentPostedJobs = JSON.parse(localStorage.getItem('posted_jobs')) || [];
    currentPostedJobs.push({
      company: trimmedCompany,
      stream: stream,
      title: trimmedTitle,
      description: trimmedDesc,
      requirements: requirementsArray
    });

    localStorage.setItem('posted_jobs', JSON.stringify(currentPostedJobs));
    addToast(`Successfully posted position for "${trimmedTitle}" at ${trimmedCompany}!`, 'success');

    // Reset Form & Close Modal
    setCompanyName('');
    setStream('IT');
    setJobTitle('');
    setJobDesc('');
    setRequirements('');
    
    handleCloseModal();
    loadRecruiterData();
  };

  const handleUpdateStatus = (index, newStatus) => {
    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    if (allApplications[index]) {
      const applicantName = allApplications[index].studentName;
      allApplications[index].status = newStatus;
      localStorage.setItem('job_applications', JSON.stringify(allApplications));
      
      addToast(`Updated status of ${applicantName}'s file to "${newStatus}"!`, 'success');
      loadRecruiterData();
    }
  };

  // Stats Counters
  const activeListingsCount = 4 + postedJobs.length;
  const applicationsReceivedCount = applications.length;
  const shortlistedCount = applications.filter((app) => app.status === 'Shortlisted').length;

  return (
    <div className="container">
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="accent-title" style={{ fontWeight: 800, textAlign: 'left' }}>Recruiter Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage job listings, coordinate recruitment files, and evaluate candidates.</p>
        </div>
        <div>
          <button className="btn-primary" onClick={handleOpenModal}>＋ Post a Job</button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-info">
            <div className="stat-number">{activeListingsCount}</div>
            <div className="stat-label">Active Listings</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>📥</div>
          <div className="stat-info">
            <div className="stat-number">{applicationsReceivedCount}</div>
            <div className="stat-label">Applications Received</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(42, 82, 152, 0.08)', color: '#2a5298' }}>✓</div>
          <div className="stat-info">
            <div className="stat-number">{shortlistedCount}</div>
            <div className="stat-label">Shortlisted Candidates</div>
          </div>
        </div>
      </div>

      {/* Active Candidates Table */}
      <h2 style={{ fontSize: '22px', textAlign: 'left', marginBottom: '5px' }}>Active Student Applications</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Review students who applied for IT and Non-IT stream positions in real time.</p>

      <div className="premium-table-wrapper" style={{ marginBottom: '40px' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Target Company</th>
              <th>Position / Stream</th>
              <th>Contact Details</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Recruitment Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((app, index) => {
                const studentProfile = profiles[app.studentUsername.toLowerCase()];
                const email = studentProfile ? studentProfile.email : (app.studentEmail || 'No contact');
                const mobile = studentProfile ? studentProfile.mobile : 'N/A';
                const name = studentProfile ? studentProfile.name : app.studentName;

                return (
                  <tr key={index}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate-600)' }}>@{app.studentUsername}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{app.company}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.job}</div>
                      <div style={{ fontSize: '11px' }}>
                        <span className="req-tag" style={{ padding: '1px 6px' }}>{app.stream}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      📧 {email}<br />
                      📱 {mobile}
                    </td>
                    <td>
                      <span className={`status-badge ${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <select 
                        style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', borderRadius: 'var(--border-radius-sm)' }}
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(index, e.target.value)}
                      >
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: 'var(--slate-600)', padding: '40px' }}>
                  No students have applied to any openings yet. Once candidates submit applications in their portals, they will appear here instantly!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Post Job Modal Form Overlay */}
      {isModalOpen && (
        <div className={`modal ${isModalShow ? 'show' : ''}`} style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '22px' }}>Create Job Opening</h2>
              <span className="close-modal" onClick={handleCloseModal}>&times;</span>
            </div>
            
            <form onSubmit={handlePostJobSubmit}>
              <div className="form-group">
                <label htmlFor="job-company">Company Name:</label>
                <input 
                  type="text" 
                  id="job-company" 
                  placeholder="e.g. Google / Amazon / Microsoft" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-stream">Stream:</label>
                <select 
                  id="job-stream" 
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  required
                >
                  <option value="IT">Information Technology (IT)</option>
                  <option value="NON-IT">Non-IT Stream</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="job-title">Job Title:</label>
                <input 
                  type="text" 
                  id="job-title" 
                  placeholder="e.g. Senior Frontend Architect" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-description">Description:</label>
                <textarea 
                  id="job-description" 
                  rows={3} 
                  placeholder="Brief role description..." 
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-requirements">Core Requirements (comma separated):</label>
                <textarea 
                  id="job-requirements" 
                  rows={2} 
                  placeholder="e.g. React, Node.js, AWS, 2+ Years Exp" 
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required 
                />
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Publish Posting</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
