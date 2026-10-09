import React, { useState, useEffect } from 'react';
import { jobsApi, applicationsApi, studentApi } from '../services/api';

export default function JobOpeningsPage({ user, streamType, onNavigate, onBack, addToast }) {
  const [studentApps, setStudentApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentProfile, setStudentProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudentAndJobs();
  }, [user, streamType]);

  const loadStudentAndJobs = async () => {
    setIsLoading(true);

    // 1. Load Student Profile & Applications
    if (user) {
      const usernameKey = (user.username || '').toLowerCase();
      const emailKey = (user.email || '').toLowerCase();

      // Attempt live profile from Spring Boot backend
      try {
        const profileRes = await studentApi.getProfile();
        if (profileRes?.data) {
          setStudentProfile(profileRes.data);
        }
      } catch {
        // Fallback to localStorage profile
        const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
        const profile = profiles[emailKey] || profiles[usernameKey] || {
          name: user.username,
          cgpa: 8.5,
          branch: 'Computer Science'
        };
        setStudentProfile(profile);
      }

      // Attempt live student applications
      try {
        const appsRes = await studentApi.getMyApplications();
        if (appsRes?.data && appsRes.data.length > 0) {
          const mappedApps = appsRes.data.map(app => ({
            id: app.id,
            jobId: app.jobId,
            company: app.companyName,
            job: app.jobTitle,
            stream: app.stream,
            status: app.status
          }));
          setStudentApps(mappedApps);
        } else {
          loadLocalApplications(usernameKey, emailKey);
        }
      } catch {
        loadLocalApplications(usernameKey, emailKey);
      }
    }

    // 2. Try fetching from Backend API
    try {
      const backendStream = streamType === 'NON-IT' ? 'NON_IT' : 'IT';
      const response = await jobsApi.getJobs(backendStream);
      if (response?.data && response.data.length > 0) {
        const mappedJobs = response.data.map(j => ({
          id: j.id,
          company: j.companyName,
          title: j.title,
          stream: j.stream === 'NON_IT' ? 'NON-IT' : 'IT',
          location: j.location,
          salaryPackage: j.salaryPackage,
          minCgpa: j.minCgpa ? parseFloat(j.minCgpa) : 7.0,
          eligibleBranches: j.eligibleBranches || 'All Branches',
          description: j.description,
          requirements: j.requiredSkills ? j.requiredSkills.split(',').map(s => s.trim()) : ['General'],
          openings: 'Active Drive',
          badgeColor: '#2563EB'
        }));
        setJobs(mappedJobs);
        setIsLoading(false);
        return;
      }
    } catch {
      // Backend not currently reachable; use rich built-in catalog + recruiter posted jobs
    }

    // 3. Fallback: Base Catalog + Recruiter Posted Jobs from localStorage
    const postedJobs = JSON.parse(localStorage.getItem('posted_jobs')) || [];
    const relevantPosted = postedJobs
      .filter((pj) => pj.stream === streamType)
      .map((pj, idx) => ({
        id: `posted-${idx}`,
        company: pj.company,
        title: pj.title,
        stream: pj.stream,
        location: pj.location || 'Bengaluru / Hybrid',
        salaryPackage: pj.salaryPackage || '₹12 - 18 LPA',
        minCgpa: parseFloat(pj.minCgpa) || 7.0,
        eligibleBranches: pj.eligibleBranches || 'CS, IT, ECE, EE',
        description: pj.description,
        requirements: Array.isArray(pj.requirements) ? pj.requirements : (pj.requirements ? pj.requirements.split(',') : ['Java', 'Spring Boot', 'SQL']),
        openings: '30 Openings',
        badgeColor: '#2563EB'
      }));

    const defaultITJobs = [
      {
        id: 'it-1',
        company: 'Google LLC',
        title: 'Software Development Engineer - Cloud & Infrastructure',
        stream: 'IT',
        location: 'Hyderabad / Bengaluru',
        salaryPackage: '₹22 - 32 LPA',
        minCgpa: 8.0,
        eligibleBranches: 'CS, IT, ECE',
        description: 'Design and deploy scalable distributed microservices, cloud infrastructure components, and performant backend APIs.',
        requirements: ['Java / C++', 'Data Structures & Algorithms', 'Distributed Systems', 'Spring Boot / Microservices'],
        openings: '45 Openings',
        badgeColor: '#4285F4'
      },
      {
        id: 'it-2',
        company: 'Amazon AWS',
        title: 'Cloud Support & Backend Systems Engineer',
        stream: 'IT',
        location: 'Hyderabad / Chennai',
        salaryPackage: '₹18 - 26 LPA',
        minCgpa: 7.5,
        eligibleBranches: 'CS, IT, ECE, EE',
        description: 'Build enterprise-grade cloud telemetry tools, AWS Lambda serverless functions, and Java API services.',
        requirements: ['Java / Python', 'AWS / Cloud Architecture', 'Linux & Networking', 'SQL / NoSQL Databases'],
        openings: '60 Openings',
        badgeColor: '#FF9900'
      },
      {
        id: 'it-3',
        company: 'Microsoft',
        title: 'Full Stack Java & React Developer',
        stream: 'IT',
        location: 'Bengaluru / Noida',
        salaryPackage: '₹20 - 28 LPA',
        minCgpa: 7.5,
        eligibleBranches: 'CS, IT',
        description: 'Develop full stack web applications integrating secure Spring Boot REST APIs with high-performance React frontends.',
        requirements: ['Java 17/21', 'Spring Boot & JPA', 'React & TypeScript', 'REST API Design', 'Docker'],
        openings: '35 Openings',
        badgeColor: '#00A4EF'
      },
      {
        id: 'it-4',
        company: 'Infosys Wingspan',
        title: 'Associate Java Developer & Consultant',
        stream: 'IT',
        location: 'Pune / Hyderabad / Mysuru',
        salaryPackage: '₹9.5 - 14 LPA',
        minCgpa: 6.5,
        eligibleBranches: 'All Engineering Branches',
        description: 'Enterprise consulting and Java application development for global banking and retail clients.',
        requirements: ['Core Java & OOP', 'Spring Framework', 'MySQL & Hibernate', 'Git Version Control'],
        openings: '120 Openings',
        badgeColor: '#007CC3'
      }
    ];

    const defaultNonITJobs = [
      {
        id: 'nonit-1',
        company: 'Mayo Clinic Health',
        title: 'Clinical Research & Healthcare Coordinator',
        stream: 'NON-IT',
        location: 'Mumbai / Delhi',
        salaryPackage: '₹8 - 14 LPA',
        minCgpa: 6.5,
        eligibleBranches: 'Bio-Technology, Life Sciences, Pharmacy',
        description: 'Coordinate clinical trials, manage regulatory compliance, and liaise with healthcare investigators.',
        requirements: ['Clinical Data Management', 'GCP Compliance', 'Life Sciences Degree', 'Medical Documentation'],
        openings: '25 Openings',
        badgeColor: '#059669'
      },
      {
        id: 'nonit-2',
        company: 'UnitedHealth Group',
        title: 'Health Systems & Medical Informatics Specialist',
        stream: 'NON-IT',
        location: 'Gurugram / Hyderabad',
        salaryPackage: '₹10 - 16 LPA',
        minCgpa: 7.0,
        eligibleBranches: 'Bio-Medical, Health Informatics, Life Sciences',
        description: 'Analyze electronic health record data, optimize hospital workflows, and manage healthcare operations.',
        requirements: ['Medical Informatics', 'Healthcare Analytics', 'Regulatory Affairs', 'Communication'],
        openings: '40 Openings',
        badgeColor: '#0284C7'
      },
      {
        id: 'nonit-3',
        company: 'Tata Medical Care',
        title: 'Operations & Hospital Administration Officer',
        stream: 'NON-IT',
        location: 'Kolkata / Mumbai',
        salaryPackage: '₹7.5 - 12 LPA',
        minCgpa: 6.0,
        eligibleBranches: 'Healthcare Management, Bio-Tech, All Graduates',
        description: 'Supervise daily outpatient and inpatient operational streams, inventory logistics, and patient services.',
        requirements: ['Hospital Administration', 'Patient Care Operations', 'Vendor Management', 'Inventory Control'],
        openings: '18 Openings',
        badgeColor: '#7C3AED'
      }
    ];

    const baseJobs = streamType === 'IT' ? defaultITJobs : defaultNonITJobs;
    setJobs([...relevantPosted, ...baseJobs]);
    setIsLoading(false);
  };

  const loadLocalApplications = (usernameKey, emailKey) => {
    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const userApps = allApplications.filter(
      (app) => (app.studentUsername && app.studentUsername.toLowerCase() === usernameKey) ||
               (app.studentEmail && app.studentEmail.toLowerCase() === emailKey)
    );
    setStudentApps(userApps);
  };

  const isApplied = (companyName, jobTitle, jobId) => {
    return studentApps.some(
      (app) => (jobId && app.jobId === jobId) ||
               (app.company && app.company.toLowerCase() === companyName.toLowerCase() &&
                app.job && app.job.toLowerCase() === jobTitle.toLowerCase())
    );
  };

  const handleApply = async (job) => {
    if (!user) {
      addToast('Please log in to apply for this position.', 'error');
      onNavigate('login');
      return;
    }

    if (isApplied(job.company, job.title, job.id)) {
      addToast(`You have already submitted an application for ${job.title} at ${job.company}.`, 'error');
      return;
    }

    // Eligibility check
    const studentCgpa = parseFloat(studentProfile?.cgpa || 8.0);
    if (studentCgpa < job.minCgpa) {
      const proceedAnyway = window.confirm(
        `Note: Your CGPA (${studentCgpa}) is below the recommended minimum requirement (${job.minCgpa}). Would you still like to apply?`
      );
      if (!proceedAnyway) return;
    }

    const confirmApply = window.confirm(
      `Confirm application for:\n• Position: ${job.title}\n• Company: ${job.company}\n• Package: ${job.salaryPackage}`
    );
    if (!confirmApply) return;

    // If this is a numeric backend job ID, submit via Spring Boot REST API
    if (typeof job.id === 'number') {
      try {
        const res = await applicationsApi.applyForJob(job.id, `Application submitted for ${job.title}`);
        if (res?.data) {
          addToast(`Application accepted by Spring Boot server for ${job.company}!`, 'success');
          loadStudentAndJobs();
          return;
        }
      } catch (err) {
        addToast(`Backend Application Note: ${err.message}`, 'warning');
      }
    }

    // Local / Offline fallback persistence
    const allApplications = JSON.parse(localStorage.getItem('job_applications')) || [];
    const newApp = {
      jobId: job.id,
      studentUsername: user.username,
      studentEmail: user.email || `${user.username.toLowerCase()}@campus.edu`,
      studentName: studentProfile?.name || user.username,
      company: job.company,
      job: job.title,
      stream: streamType,
      date: new Date().toISOString().split('T')[0],
      status: 'Applied'
    };

    allApplications.push(newApp);
    localStorage.setItem('job_applications', JSON.stringify(allApplications));

    addToast(`Successfully applied to ${job.company} for ${job.title}!`, 'success');
    loadStudentAndJobs();
  };

  const filteredJobs = jobs.filter((j) => {
    const term = searchTerm.toLowerCase();
    return (
      j.company.toLowerCase().includes(term) ||
      j.title.toLowerCase().includes(term) ||
      (j.requirements && j.requirements.some((r) => r.toLowerCase().includes(term)))
    );
  });

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '14px', marginBottom: '20px', color: 'var(--slate-500)' }}>
        <a href="#dashboard" onClick={(e) => { e.preventDefault(); onBack(); }}>← Back to Dashboard</a>
        <span>/</span>
        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
          {streamType === 'IT' ? 'Information Technology Placements' : 'Non-IT & Healthcare Placements'}
        </span>
      </div>

      {/* Header & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="accent-title" style={{ fontWeight: 800, textAlign: 'left', fontSize: '28px' }}>
            {streamType === 'IT' ? 'IT Placement Opportunities' : 'Non-IT Placement Opportunities'}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            {streamType === 'IT'
              ? 'Explore vetted software engineering, cloud architecture, and data roles.'
              : 'Browse healthcare administration, clinical trials, and life sciences positions.'}
          </p>
        </div>

        {/* Live Filter / Search Input */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="🔍 Search role, company, skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '9px 14px', width: '280px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--slate-300)', fontSize: '14px' }}
          />
          <button className="btn-outline" onClick={onBack}>Back</button>
        </div>
      </div>

      {/* Jobs Grid Container */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: 'var(--slate-500)' }}>
          Loading active placement drives...
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="jobs-grid">
          {filteredJobs.map((job, idx) => {
            const applied = isApplied(job.company, job.title, job.id);
            const initial = job.company ? job.company[0].toUpperCase() : 'C';

            return (
              <div key={job.id || idx} className="job-card">
                <div>
                  <div className="job-header">
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div 
                        className="company-logo-text" 
                        style={{ 
                          background: 'var(--primary-light)', 
                          color: 'var(--primary)', 
                          borderColor: 'rgba(37, 99, 235, 0.2)' 
                        }}
                      >
                        {initial}
                      </div>
                      <div>
                        <div className="job-company">{job.company}</div>
                        <div className="job-title" style={{ fontSize: '16px' }}>{job.title}</div>
                      </div>
                    </div>
                    <span className="job-openings-badge">{job.openings || 'Active Drive'}</span>
                  </div>

                  {/* Metadata Chips: CTC, Location, Min CGPA */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', margin: '12px 0', fontSize: '13px' }}>
                    <span style={{ fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '3px 8px', borderRadius: '6px' }}>
                      💰 {job.salaryPackage}
                    </span>
                    <span style={{ color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '3px 8px', borderRadius: '6px' }}>
                      📍 {job.location}
                    </span>
                    <span style={{ color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '3px 8px', borderRadius: '6px' }}>
                      🎯 Min CGPA: {job.minCgpa}
                    </span>
                  </div>

                  <p style={{ color: 'var(--slate-600)', fontSize: '13.5px', lineHeight: 1.5, marginBottom: '14px' }}>
                    {job.description}
                  </p>

                  <div className="job-body">
                    <div className="req-title">Required Skills & Stack:</div>
                    <ul className="req-list">
                      {job.requirements && job.requirements.map((req, rIdx) => (
                        <li key={rIdx} className="req-tag">{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--slate-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--slate-500)' }}>
                    Eligible: {job.eligibleBranches || 'All Branches'}
                  </span>
                  
                  {applied ? (
                    <span className="status-badge applied" style={{ padding: '6px 14px', fontSize: '13px' }}>
                      ✓ Applied
                    </span>
                  ) : (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '8px 18px', fontSize: '13.5px' }}
                      onClick={() => handleApply(job)}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--white)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--slate-200)' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', color: 'var(--slate-800)', marginBottom: '6px' }}>No openings found matching "{searchTerm}"</h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', marginBottom: '16px' }}>Try searching with different keywords or check back later.</p>
          <button className="btn-outline" onClick={() => setSearchTerm('')}>Clear Search</button>
        </div>
      )}
    </div>
  );
}
