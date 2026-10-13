import { useState, useEffect } from 'react';
import { studentApi, interviewsApi, applicationsApi } from '../services/api';

export default function StudentDashboard({ user, onNavigate, onBack, addToast }) {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewingResume, setIsPreviewingResume] = useState(false);

  const loadStudentData = async () => {
    setIsLoading(true);
    const usernameKey = (user.username || '').toLowerCase();
    const emailKey = (user.email || '').toLowerCase();

    // 1. Try loading real student profile and applications from Spring Boot Backend API
    try {
      const [profileRes, appsRes, interviewsRes] = await Promise.allSettled([
        studentApi.getProfile(),
        studentApi.getMyApplications(),
        interviewsApi.getMySchedule()
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const p = profileRes.value.data;
        const mappedSkills = p.skillsJson ? p.skillsJson.split(',').map(s => s.trim()).filter(Boolean) : [];
        setProfile({
          name: p.fullName || user.username,
          email: p.email || user.email,
          mobile: p.phone || 'Not Provided',
          gender: p.gender,
          cgpa: p.cgpa != null ? p.cgpa : 'N/A',
          branch: p.branch || 'Not Specified',
          graduationYear: p.graduationYear || 'N/A',
          skills: mappedSkills,
          resumeFileName: p.resumeFileName,
          resumeFileSize: p.resumeFileSize,
          resumeUrl: p.resumeUrl
        });
      }

      if (appsRes.status === 'fulfilled' && appsRes.value?.data) {
        setApplications(appsRes.value.data.map(a => ({
          id: a.id,
          company: a.companyName,
          job: a.jobTitle,
          stream: a.stream,
          date: a.appliedAt ? a.appliedAt.split('T')[0] : 'Recent',
          status: a.status
        })));
      }

      if (interviewsRes.status === 'fulfilled' && interviewsRes.value?.data) {
        setInterviews(interviewsRes.value.data.map(i => ({
          id: i.id,
          company: i.companyName,
          round: i.interviewType ? i.interviewType.replace('_', ' ') : 'Technical Round',
          time: i.interviewDate ? i.interviewDate.replace('T', ' ') : 'Upcoming',
          mode: i.locationOrLink.includes('http') ? 'Online Meet' : i.locationOrLink,
          link: i.locationOrLink
        })));
      }

      if (profileRes.status === 'fulfilled') {
        setIsLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend unavailable or session expired:', err.message);
    }

    // 2. Fallback to localStorage for cached session data
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const currentProfile = profiles[emailKey] || profiles[usernameKey];
    
    if (currentProfile) {
      setProfile({
        name: currentProfile.name || user.username,
        email: currentProfile.email || user.email,
        mobile: currentProfile.mobile || 'Not Provided',
        cgpa: currentProfile.cgpa || 'N/A',
        branch: currentProfile.branch || 'Not Specified',
        graduationYear: currentProfile.graduationYear || 'N/A',
        skills: Array.isArray(currentProfile.skills) ? currentProfile.skills : [],
        resumeFileName: currentProfile.resumeFileName,
        resumeFileSize: currentProfile.resumeFileSize,
        resumeUrl: currentProfile.resumeUrl
      });
    } else {
      setProfile({
        name: user.username,
        email: user.email || '',
        mobile: 'Not Provided',
        cgpa: 'N/A',
        branch: 'Not Specified',
        graduationYear: 'N/A',
        skills: [],
        resumeFileName: null
      });
    }

    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const filteredApps = allApplications.filter(
      (app) => (app.studentUsername && app.studentUsername.toLowerCase() === usernameKey) ||
               (app.studentEmail && app.studentEmail.toLowerCase() === emailKey) ||
               app.studentName === user.username
    );

    setApplications(filteredApps);
    setIsLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    loadStudentData();
  }, [user]);

  const handleWithdrawApplication = async (index) => {
    const targetApp = applications[index];
    const confirmWithdraw = window.confirm(
      `Are you sure you want to withdraw your application for "${targetApp.job}" at ${targetApp.company}?`
    );
    if (!confirmWithdraw) return;

    if (targetApp.id) {
      try {
        await applicationsApi.withdraw(targetApp.id);
        addToast(`Application to ${targetApp.company} has been withdrawn.`, 'success');
        loadStudentData();
        return;
      } catch (err) {
        console.warn('Backend withdraw failed, updating local state', err);
      }
    }

    const updatedApps = [...applications];
    updatedApps[index].status = 'Withdrawn';
    setApplications(updatedApps);

    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const updatedGlobal = allApplications.map((app) =>
      app.company === targetApp.company && app.job === targetApp.job ? { ...app, status: 'Withdrawn' } : app
    );
    localStorage.setItem('job_applications', JSON.stringify(updatedGlobal));

    addToast(`Application to ${targetApp.company} has been withdrawn.`, 'success');
  };

  const handlePreviewResume = async () => {
    try {
      setIsPreviewingResume(true);
      const blob = await studentApi.getResumeResourceBlob('/students/resume/preview');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      addToast(err.message || 'Unable to open resume preview.', 'error');
    } finally {
      setIsPreviewingResume(false);
    }
  };

  const handleDownloadResume = async () => {
    try {
      const blob = await studentApi.getResumeResourceBlob('/students/resume/download');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = profile?.resumeFileName || 'my_resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
    } catch (err) {
      addToast(err.message || 'Unable to download resume.', 'error');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading || !profile) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>Loading Placement Dashboard...</div>;
  }

  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user.username ? user.username[0].toUpperCase() : 'S');

  return (
    <div className="container">
      
      {/* Student Profile Overview Panel */}
      <div className="profile-panel">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-details" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="profile-name">{profile.name}</div>
            <span className="user-role">Student / Candidate</span>
          </div>

          <div className="profile-meta" style={{ marginTop: '6px' }}>
            📧 {profile.email} &nbsp;|&nbsp; 📱 {profile.mobile} &nbsp;|&nbsp; 🎓 {profile.branch} ({profile.graduationYear}) &nbsp;|&nbsp; 🎯 CGPA: <strong>{profile.cgpa}</strong>
          </div>

          {/* Skill Badges */}
          <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {profile.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="req-tag" 
                  style={{
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    borderColor: 'rgba(37, 99, 235, 0.2)',
                    fontSize: '12px'
                  }}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--slate-500)', fontSize: '13px', fontStyle: 'italic' }}>
                No technical skills added yet. Click Edit Profile to add skills.
              </span>
            )}
          </div>

          {/* Resume PDF Badge and Actions */}
          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--slate-200)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {profile.resumeFileName ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📄 Resume: {profile.resumeFileName} {profile.resumeFileSize ? `(${formatFileSize(profile.resumeFileSize)})` : ''}
                </span>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={handlePreviewResume}
                  disabled={isPreviewingResume}
                >
                  👁️ {isPreviewingResume ? 'Loading...' : 'Preview PDF'}
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: '4px 10px', fontSize: '12px' }}
                  onClick={handleDownloadResume}
                >
                  📥 Download
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚠️ No PDF resume uploaded yet. Upload a resume to qualify for job drives.
              </div>
            )}
          </div>
        </div>

        <div>
          <button 
            className="btn-outline" 
            style={{ padding: '8px 16px', fontSize: '14px' }}
            onClick={() => onNavigate('onboarding')}
          >
            ✏️ Edit Academic Profile & Resume
          </button>
        </div>
      </div>

      {/* Upcoming Scheduled Interviews Alert Card */}
      {interviews.length > 0 && (
        <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 'var(--border-radius-md)', padding: '20px 24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📅</span>
                <span style={{ fontWeight: 800, color: '#5b21b6', fontSize: '16px' }}>Upcoming Interview Scheduled</span>
              </div>
              <div style={{ fontSize: '14px', color: '#6d28d9', marginTop: '4px' }}>
                <strong>{interviews[0].company}</strong> • {interviews[0].round}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--slate-600)', marginTop: '2px' }}>
                🕒 {interviews[0].time} &nbsp;|&nbsp; 📍 {interviews[0].mode}
              </div>
            </div>
            <div>
              <a 
                href={interviews[0].link} 
                target="_blank" 
                rel="noreferrer"
                className="btn-primary" 
                style={{ background: '#7c3aed', padding: '8px 16px', fontSize: '13.5px' }}
              >
                Join Video Meeting
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Stream Selection Cards */}
      <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'left', marginBottom: '6px', fontFamily: "'Outfit', sans-serif" }}>
        Placement Streams & Job Drives
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
        Discover campus placement drives matched with your academic credentials.
      </p>
      
      <div className="grid-2">
        <div className="stream-card" onClick={() => onNavigate('it-placements')}>
          <div>
            <div className="stream-icon">💻</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--slate-900)' }}>IT & Software Roles</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 16px 0', lineHeight: 1.5 }}>
              Explore Software Development, Cloud Architecture, DevOps, Data Science, and Full Stack Java engineering positions.
            </p>
          </div>
          <button className="btn-primary" style={{ marginTop: '10px', width: '100%' }}>
            Browse IT Openings →
          </button>
        </div>

        <div className="stream-card" onClick={() => onNavigate('non-it-placements')}>
          <div>
            <div className="stream-icon">🩺</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--slate-900)' }}>Non-IT & Healthcare Roles</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '8px 0 16px 0', lineHeight: 1.5 }}>
              Browse Clinical Research Coordinators, Healthcare Informatics, Operations, and Life Science career opportunities.
            </p>
          </div>
          <button 
            className="btn-primary" 
            style={{ 
              marginTop: '10px', 
              width: '100%', 
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)' 
            }}
          >
            Browse Non-IT Openings →
          </button>
        </div>
      </div>

      {/* Applied Jobs Panel */}
      <div style={{ marginTop: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, textAlign: 'left', fontFamily: "'Outfit', sans-serif" }}>
              My Active Applications
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Track the real-time status and recruitment lifecycle of your submitted applications.</p>
          </div>
        </div>
        
        <div className="premium-table-wrapper">
          <table className="premium-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position Title</th>
                <th>Stream</th>
                <th>Applied Date</th>
                <th>Recruitment Stage</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length > 0 ? (
                applications.map((app, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{app.company}</td>
                    <td>{app.job}</td>
                    <td>
                      <span className="req-tag" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {app.stream}
                      </span>
                    </td>
                    <td style={{ color: 'var(--slate-600)' }}>{app.date}</td>
                    <td>
                      <span className={`status-badge ${app.status ? app.status.toLowerCase().replace(/\s+/g, '-') : 'applied'}`}>
                        {app.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {app.status !== 'Withdrawn' && app.status !== 'Selected' && (
                        <button 
                          className="btn-danger" 
                          style={{ padding: '3px 8px', fontSize: '12px' }}
                          onClick={() => handleWithdrawApplication(index)}
                        >
                          Withdraw
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--slate-500)', padding: '36px' }}>
                    You haven't submitted any job applications yet. Click one of the placement stream cards above to explore opportunities and apply!
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
