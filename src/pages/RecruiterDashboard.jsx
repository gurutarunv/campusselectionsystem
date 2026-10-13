import { useState, useEffect } from 'react';
import { jobsApi, applicationsApi, interviewsApi, studentApi } from '../services/api';

export default function RecruiterDashboard({ user, onNavigate, onBack, addToast }) {
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Post Job Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('Google LLC');
  const [stream, setStream] = useState('IT');
  const [jobTitle, setJobTitle] = useState('');
  const [salaryPackage, setSalaryPackage] = useState('₹16 - 24 LPA');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [location, setLocation] = useState('Bengaluru / Hybrid');
  const [jobDesc, setJobDesc] = useState('');
  const [requirements, setRequirements] = useState('');

  // Interview Schedule Modal state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(null);
  const [interviewDate, setInterviewDate] = useState('2026-10-15T10:30');
  const [interviewRound, setInterviewRound] = useState('TECHNICAL_ROUND');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/cpa-demo-round');

  const loadRecruiterData = async () => {
    setIsLoading(true);
    const allProfiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    setProfiles(allProfiles);

    let fetchedFromBackend = false;

    // 1. Attempt fetching recruiter pipeline from Spring Boot backend
    try {
      const pipelineRes = await applicationsApi.getRecruiterPipeline();
      if (pipelineRes?.data && pipelineRes.data.length > 0) {
        const mappedApps = pipelineRes.data.map((app) => ({
          id: app.id,
          studentUsername: app.studentName,
          studentEmail: app.studentEmail,
          studentName: app.studentName,
          studentPhone: app.studentPhone || '',
          studentBranch: app.studentBranch || 'Engineering',
          studentCgpa: app.studentCgpa || 'N/A',
          studentUserId: app.studentUserId,
          company: app.companyName,
          job: app.jobTitle,
          stream: app.stream === 'NON_IT' ? 'NON-IT' : 'IT',
          date: app.appliedAt ? app.appliedAt.split('T')[0] : 'Recent',
          status: app.status.replace(/_/g, ' ')
        }));
        setApplications(mappedApps);
        fetchedFromBackend = true;
      }
    } catch {
      // Backend not running or token expired
    }

    // 2. Attempt fetching posted jobs from backend
    try {
      const jobsRes = await jobsApi.getMyPostedJobs();
      if (jobsRes?.data && jobsRes.data.length > 0) {
        setPostedJobs(jobsRes.data);
      }
    } catch {
      const allPostedJobs = JSON.parse(localStorage.getItem('posted_jobs')) || [];
      setPostedJobs(allPostedJobs);
    }

    // Fallback to local storage if backend pipeline was empty or offline
    if (!fetchedFromBackend) {
      let allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
      if (allApplications.length === 0) {
        allApplications = [
          {
            id: 1,
            studentUsername: 'Guru Prasad',
            studentEmail: 'student@campus.edu',
            studentName: 'Guru Prasad',
            studentPhone: '+91 98765 43210',
            studentBranch: 'Computer Science & Engineering',
            studentCgpa: 8.85,
            company: 'Google LLC',
            job: 'Software Development Engineer - Cloud & Infrastructure',
            stream: 'IT',
            date: '2026-10-02',
            status: 'Shortlisted'
          },
          {
            id: 2,
            studentUsername: 'Ananya Sharma',
            studentEmail: 'ananya.s@campus.edu',
            studentName: 'Ananya Sharma',
            studentPhone: '+91 98765 43211',
            studentBranch: 'Information Technology',
            studentCgpa: 9.12,
            company: 'Google LLC',
            job: 'Software Development Engineer - Cloud & Infrastructure',
            stream: 'IT',
            date: '2026-10-04',
            status: 'Under Review'
          }
        ];
        localStorage.setItem('job_applications', JSON.stringify(allApplications));
      }
      setApplications(allApplications);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadRecruiterData();
  }, [user]);

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();

    const trimmedCompany = companyName.trim();
    const trimmedTitle = jobTitle.trim();
    const trimmedDesc = jobDesc.trim();

    if (!trimmedCompany || !trimmedTitle || !trimmedDesc || !requirements) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    // 1. Try publishing on Spring Boot backend
    try {
      const backendPayload = {
        title: trimmedTitle,
        stream: stream === 'NON-IT' ? 'NON_IT' : 'IT',
        salaryPackage: salaryPackage,
        minCgpa: parseFloat(minCgpa) || 7.0,
        location: location,
        description: trimmedDesc,
        requiredSkills: requirements,
        eligibleBranches: 'ALL'
      };
      const res = await jobsApi.createJob(backendPayload);
      if (res?.data) {
        addToast(`Successfully published drive "${trimmedTitle}" via Spring Boot API!`, 'success');
      }
    } catch {
      // Offline fallback
    }

    // 2. Also persist in local storage
    const requirementsArray = requirements
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r !== '');

    const currentPostedJobs = JSON.parse(localStorage.getItem('posted_jobs')) || [];
    currentPostedJobs.push({
      company: trimmedCompany,
      stream: stream,
      title: trimmedTitle,
      salaryPackage: salaryPackage,
      minCgpa: parseFloat(minCgpa) || 7.0,
      location: location,
      description: trimmedDesc,
      requirements: requirementsArray
    });

    localStorage.setItem('posted_jobs', JSON.stringify(currentPostedJobs));
    addToast(`Placement drive "${trimmedTitle}" is active!`, 'success');

    // Reset Form & Close Modal
    setJobTitle('');
    setJobDesc('');
    setRequirements('');
    setIsModalOpen(false);
    loadRecruiterData();
  };

  const handleUpdateStatus = async (index, newStatus) => {
    const allApplications = [...applications];
    const targetApp = allApplications[index];
    if (!targetApp) return;

    const applicantName = targetApp.studentName;
    targetApp.status = newStatus;
    setApplications([...allApplications]);

    // Backend formatted status
    const backendStatus = newStatus.toUpperCase().replace(/\s+/g, '_');

    if (targetApp.id && typeof targetApp.id === 'number') {
      try {
        await applicationsApi.updateStatus(targetApp.id, backendStatus, `Stage updated to ${newStatus}`);
      } catch (err) {
        console.warn('Backend status update note:', err.message);
      }
    }

    localStorage.setItem('job_applications', JSON.stringify(allApplications));
    addToast(`Updated ${applicantName}'s stage to "${newStatus}"!`, 'success');

    if (newStatus === 'Interview Scheduled' || newStatus === 'Shortlisted') {
      setSelectedCandidateIndex(index);
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (selectedCandidateIndex === null) return;

    const candidate = applications[selectedCandidateIndex];
    
    // Attempt backend interview scheduling
    if (candidate.id && typeof candidate.id === 'number') {
      try {
        await interviewsApi.scheduleInterview({
          applicationId: candidate.id,
          interviewDate: `${interviewDate}:00`,
          interviewType: interviewRound,
          locationOrLink: meetingLink,
          feedbackNotes: `Scheduled interview round: ${interviewRound}`
        });
      } catch (err) {
        console.warn('Backend interview scheduling note:', err.message);
      }
    }

    handleUpdateStatus(selectedCandidateIndex, 'Interview Scheduled');
    setIsInterviewModalOpen(false);
    addToast(`Interview invitation dispatched to ${candidate.studentName}!`, 'success');
  };

  const handleViewCandidateResume = async (app) => {
    try {
      const candidateUserId = app.studentUserId || (app.id === 1 ? 4 : app.id === 2 ? 5 : null);
      if (!candidateUserId) {
        addToast('No resume file associated with this candidate.', 'info');
        return;
      }
      const blob = await studentApi.getResumeResourceBlob(`/students/${candidateUserId}/resume/preview`);
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      addToast(err.message || 'Unable to preview candidate resume.', 'error');
    }
  };

  // Stats Counters
  const activeListingsCount = 4 + postedJobs.length;
  const applicationsReceivedCount = applications.length;
  const shortlistedCount = applications.filter((app) => 
    app.status === 'Shortlisted' || app.status === 'Interview Scheduled' || app.status === 'INTERVIEW_SCHEDULED'
  ).length;
  const selectedCount = applications.filter((app) => 
    app.status === 'Selected' || app.status === 'OFFER_EXTENDED' || app.status === 'OFFER_ACCEPTED'
  ).length;

  return (
    <div className="container">
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="user-role recruiter" style={{ marginBottom: '6px', display: 'inline-block' }}>
            💼 Corporate Recruiter Console
          </span>
          <h1 className="accent-title" style={{ fontWeight: 800, textAlign: 'left', fontSize: '28px' }}>
            Candidate Evaluation & Drive Manager
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Publish placement openings, evaluate candidate profiles, and schedule technical interview rounds.
          </p>
        </div>
        <div>
          <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
            ＋ Post New Job Opening
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-info">
            <div className="stat-number">{activeListingsCount}</div>
            <div className="stat-label">Active Job Postings</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#10B981' }}>📥</div>
          <div className="stat-info">
            <div className="stat-number">{applicationsReceivedCount}</div>
            <div className="stat-label">Received Applications</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: 'var(--accent-purple)' }}>📅</div>
          <div className="stat-info">
            <div className="stat-number">{shortlistedCount}</div>
            <div className="stat-label">Shortlisted & In-Pipeline</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>🏆</div>
          <div className="stat-info">
            <div className="stat-number">{selectedCount}</div>
            <div className="stat-label">Selected Offers</div>
          </div>
        </div>
      </div>

      {/* Active Candidates Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'left', fontFamily: "'Outfit', sans-serif" }}>
            Candidate Application Pipeline
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Review candidate academic credentials, CGPA, and advance applicants through the recruitment lifecycle.
          </p>
        </div>
      </div>

      <div className="premium-table-wrapper" style={{ marginBottom: '40px' }}>
        <table className="premium-table">
          <thead>
            <tr>
              <th>Applicant Details</th>
              <th>Applied Position</th>
              <th>Academic Credentials</th>
              <th>Current Stage</th>
              <th style={{ textAlign: 'right' }}>Recruitment Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--slate-500)', padding: '30px' }}>
                  Loading applicant pipeline...
                </td>
              </tr>
            ) : applications.length > 0 ? (
              applications.map((app, index) => {
                const studentProfile = profiles[app.studentUsername?.toLowerCase()] || profiles[app.studentEmail?.toLowerCase()];
                const email = studentProfile ? studentProfile.email : (app.studentEmail || 'student@campus.edu');
                const phone = app.studentPhone || (studentProfile ? studentProfile.mobile : '+91 98765 43210');
                const branch = app.studentBranch || (studentProfile ? studentProfile.branch : 'Computer Science');
                const cgpa = app.studentCgpa || (studentProfile ? studentProfile.cgpa : '8.85');
                const name = app.studentName || (studentProfile ? studentProfile.name : app.studentUsername);

                return (
                  <tr key={index}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>{email} • {phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.job}</div>
                      <div style={{ fontSize: '11px', marginTop: '2px' }}>
                        <span className="req-tag" style={{ padding: '1px 6px' }}>{app.stream} Stream</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-800)' }}>{branch}</div>
                      <div style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>CGPA: {cgpa}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <select 
                          style={{ width: 'auto', padding: '6px 10px', fontSize: '13px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--slate-300)' }}
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(index, e.target.value)}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                        </select>

                        <button 
                          type="button"
                          className="btn-outline" 
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          title="View Candidate Resume PDF"
                          onClick={() => handleViewCandidateResume(app)}
                        >
                          📄 Resume
                        </button>

                        <button 
                          type="button"
                          className="btn-outline" 
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                          title="Schedule Interview Round"
                          onClick={() => {
                            setSelectedCandidateIndex(index);
                            setIsInterviewModalOpen(true);
                          }}
                        >
                          📅 Schedule
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--slate-500)', padding: '40px' }}>
                  No candidate applications found. When students submit applications, they will appear here in real time.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Post Job Modal */}
      {isModalOpen && (
        <div className="modal show" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '20px' }}>Publish Placement Drive</h2>
              <span className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</span>
            </div>
            
            <form onSubmit={handlePostJobSubmit}>
              <div className="form-group">
                <label htmlFor="job-company">Hiring Company:</label>
                <input 
                  type="text" 
                  id="job-company" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required 
                />
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="job-stream">Career Stream:</label>
                  <select 
                    id="job-stream" 
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    required
                  >
                    <option value="IT">Information Technology (IT)</option>
                    <option value="NON-IT">Non-IT & Healthcare</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="job-package">Salary Package (CTC):</label>
                  <input 
                    type="text" 
                    id="job-package" 
                    placeholder="e.g. ₹16 - 22 LPA"
                    value={salaryPackage}
                    onChange={(e) => setSalaryPackage(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="job-cgpa">Minimum CGPA Threshold:</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    id="job-cgpa" 
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="job-location">Work Location:</label>
                  <input 
                    type="text" 
                    id="job-location" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="job-title">Position Title:</label>
                <input 
                  type="text" 
                  id="job-title" 
                  placeholder="e.g. Associate Software Engineer - Backend" 
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-description">Role Description & Responsibilities:</label>
                <textarea 
                  id="job-description" 
                  rows={3} 
                  placeholder="Describe key responsibilities and expectations..." 
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="job-requirements">Required Technical Skills (comma separated):</label>
                <input 
                  type="text" 
                  id="job-requirements" 
                  placeholder="e.g. Java, Spring Boot, React, MySQL, Git" 
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  required 
                />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {isInterviewModalOpen && selectedCandidateIndex !== null && (
        <div className="modal show" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '20px' }}>
                Schedule Interview Round
              </h2>
              <span className="close-modal" onClick={() => setIsInterviewModalOpen(false)}>&times;</span>
            </div>
            
            <form onSubmit={handleScheduleInterviewSubmit}>
              <p style={{ color: 'var(--slate-600)', fontSize: '14px', marginBottom: '16px' }}>
                Scheduling interview for <strong>{applications[selectedCandidateIndex]?.studentName}</strong> ({applications[selectedCandidateIndex]?.job})
              </p>

              <div className="form-group">
                <label htmlFor="round-type">Interview Round Type:</label>
                <select 
                  id="round-type"
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  required
                >
                  <option value="TECHNICAL_ROUND">Round 1: Technical & DSA</option>
                  <option value="ONLINE_MEET">Round 2: System Design & Architecture</option>
                  <option value="HR_ROUND">Round 3: Behavioral & HR Round</option>
                  <option value="ON_CAMPUS">Final On-Campus Evaluation</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="interview-date">Date & Time:</label>
                <input 
                  type="datetime-local" 
                  id="interview-date" 
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label htmlFor="meeting-link">Meeting Link / Campus Venue:</label>
                <input 
                  type="text" 
                  id="meeting-link" 
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  required 
                />
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsInterviewModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Confirm & Notify Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
