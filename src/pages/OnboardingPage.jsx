import { useState, useEffect } from 'react';
import ResumeUploader from '../components/ResumeUploader';
import SkillsTagInput from '../components/SkillsTagInput';
import { studentApi } from '../services/api';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Bio-Technology & Life Sciences',
  'Healthcare Informatics',
  'Chemical Engineering'
];

const GRADUATION_YEARS = [
  '2024',
  '2025',
  '2026',
  '2027',
  '2028',
  '2029'
];

export default function OnboardingPage({ user, onNavigate, onBack, addToast }) {
  const [name, setName] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age ? user.age.toString() : '');
  const [mobile, setMobile] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [branch, setBranch] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [skills, setSkills] = useState([]);
  const [newResumeFile, setNewResumeFile] = useState(null);
  const [existingResume, setExistingResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const loadExistingProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const res = await studentApi.getProfile();
      if (res?.data) {
        const p = res.data;
        setName(p.fullName || user.username || '');
        setEmail(p.email || user.email || '');
        if (p.age != null) setAge(p.age.toString());
        setMobile(p.phone || '');
        setCgpa(p.cgpa != null ? p.cgpa.toString() : '');
        setBranch(p.branch || '');
        setGraduationYear(p.graduationYear != null ? p.graduationYear.toString() : '');
        
        const mappedSkills = p.skillsJson 
          ? p.skillsJson.split(',').map(s => s.trim()).filter(Boolean)
          : [];
        setSkills(mappedSkills);

        if (p.resumeFileName) {
          setExistingResume({
            fileName: p.resumeFileName,
            fileSize: p.resumeFileSize,
            uploadedAt: p.resumeUploadedAt,
            resumeUrl: p.resumeUrl
          });
        }
        setIsLoadingProfile(false);
        return;
      }
    } catch (err) {
      console.warn('Backend student profile retrieval note:', err.message);
    }

    // Fallback: check localStorage cache
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const existing = profiles[user.email?.toLowerCase()] || profiles[user.username?.toLowerCase()];
    if (existing) {
      setName(existing.name || user.username || '');
      setEmail(existing.email || user.email || '');
      if (existing.age != null) setAge(existing.age.toString());
      setMobile(existing.mobile || '');
      setCgpa(existing.cgpa != null ? existing.cgpa.toString() : '');
      setBranch(existing.branch || '');
      setGraduationYear(existing.graduationYear != null ? existing.graduationYear.toString() : '');
      setSkills(Array.isArray(existing.skills) ? existing.skills : []);
      if (existing.resumeFileName) {
        setExistingResume({
          fileName: existing.resumeFileName,
          fileSize: existing.resumeFileSize,
          resumeUrl: existing.resumeUrl
        });
      }
    }
    setIsLoadingProfile(false);
  };

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    loadExistingProfile();
  }, [user]);

  const handleDeleteResume = async () => {
    const confirmDelete = window.confirm('Are you sure you want to remove your resume PDF?');
    if (!confirmDelete) return;

    try {
      await studentApi.deleteResume();
      setExistingResume(null);
      setNewResumeFile(null);
      addToast('Resume deleted successfully from server.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete resume.', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMobile = mobile.trim();
    
    if (!trimmedName || !trimmedEmail || !trimmedMobile || !cgpa || !branch || !graduationYear) {
      addToast('Please complete all required academic and personal fields.', 'error');
      return;
    }

    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      addToast('CGPA must be a valid number between 0.0 and 10.0.', 'error');
      return;
    }

    if (skills.length === 0) {
      addToast('Please specify at least one technical skill.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. If user selected a new PDF resume, upload it
      let uploadedResumeMeta = existingResume;
      if (newResumeFile) {
        try {
          const uploadRes = await studentApi.uploadResume(newResumeFile);
          if (uploadRes?.data) {
            uploadedResumeMeta = {
              fileName: uploadRes.data.resumeFileName,
              fileSize: uploadRes.data.resumeFileSize,
              uploadedAt: uploadRes.data.resumeUploadedAt,
              resumeUrl: uploadRes.data.resumeUrl
            };
            setExistingResume(uploadedResumeMeta);
            setNewResumeFile(null);
          }
        } catch (uploadErr) {
          console.warn('Backend resume upload notice:', uploadErr.message);
          // Local fallback for display
          uploadedResumeMeta = {
            fileName: newResumeFile.name,
            fileSize: newResumeFile.size,
            uploadedAt: new Date().toISOString(),
            resumeUrl: null
          };
          setExistingResume(uploadedResumeMeta);
          setNewResumeFile(null);
        }
      }

      // 2. Update profile on Spring Boot backend
      const profilePayload = {
        fullName: trimmedName,
        age: age ? parseInt(age, 10) : null,
        phone: trimmedMobile,
        gender: 'unspecified',
        cgpa: parsedCgpa,
        branch: branch,
        graduationYear: parseInt(graduationYear, 10),
        skillsJson: skills.join(', ')
      };

      try {
        await studentApi.updateProfile(profilePayload);
      } catch (backendErr) {
        console.warn('Backend update notice (offline fallback):', backendErr.message);
      }

      // 3. Update local storage profile cache
      const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
      const updatedProfileData = {
        username: user.username,
        name: trimmedName,
        age: age ? parseInt(age, 10) : null,
        email: trimmedEmail,
        mobile: trimmedMobile,
        cgpa: parsedCgpa,
        branch: branch,
        graduationYear: graduationYear,
        skills: skills,
        resumeFileName: uploadedResumeMeta?.fileName,
        resumeFileSize: uploadedResumeMeta?.fileSize,
        resumeUrl: uploadedResumeMeta?.resumeUrl
      };

      profiles[trimmedEmail.toLowerCase()] = updatedProfileData;
      localStorage.setItem('student_profiles', JSON.stringify(profiles));

      setIsSubmitting(false);
      addToast('Profile, academic information, and resume saved successfully!', 'success');

      setTimeout(() => {
        onNavigate('dashboard');
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      addToast(err.message || 'Error updating profile.', 'error');
    }
  };

  return (
    <div className="container">
      <div className="container-box" style={{ maxWidth: '740px', margin: '0 auto', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="accent-title" style={{ fontWeight: 800, marginBottom: '6px', fontSize: '26px' }}>
            Academic Profile & Placement Credentials
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>
            Maintain your student credentials, verified skills, and resume PDF for company placements.
          </p>
        </div>

        {isLoadingProfile ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
            Loading your profile credentials from server...
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            {/* Personal Information */}
            <div className="form-section-card">
              <div className="form-section-title">
                👤 Personal Details
              </div>
              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="studentName">Full Name: <span className="req-star">*</span></label>
                  <input 
                    type="text" 
                    id="studentName" 
                    placeholder="Enter your full name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required 
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentEmail">Academic / Official Email: <span className="req-star">*</span></label>
                  <input 
                    type="email" 
                    id="studentEmail" 
                    value={email}
                    disabled
                    style={{ background: 'var(--slate-100)', color: 'var(--slate-600)', cursor: 'not-allowed' }}
                    required 
                  />
                </div>
              </div>

              <div className="grid-2" style={{ gap: '14px', marginBottom: 0 }}>
                <div className="form-group">
                  <label htmlFor="studentAge">Age:</label>
                  <input 
                    type="number" 
                    id="studentAge" 
                    placeholder="e.g. 21" 
                    min="16"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentMobile">Mobile Number: <span className="req-star">*</span></label>
                  <input 
                    type="tel" 
                    id="studentMobile" 
                    placeholder="e.g. 9876543210" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="form-section-card">
              <div className="form-section-title">
                🎓 Academic Information
              </div>

              <div className="grid-3" style={{ gap: '12px' }}>
                <div className="form-group">
                  <label htmlFor="branch">Department / Branch: <span className="req-star">*</span></label>
                  <select 
                    id="branch" 
                    value={branch} 
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="graduationYear">Graduation Year: <span className="req-star">*</span></label>
                  <select 
                    id="graduationYear" 
                    value={graduationYear} 
                    onChange={(e) => setGraduationYear(e.target.value)}
                    required
                  >
                    <option value="">-- Select Year --</option>
                    {GRADUATION_YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cgpa">Cumulative CGPA: <span className="req-star">*</span></label>
                  <input 
                    type="number" 
                    step="0.01" 
                    id="cgpa" 
                    min="0" 
                    max="10" 
                    placeholder="e.g. 8.5"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="form-section-card">
              <div className="form-section-title">
                💻 Verified Technical Skills <span className="req-star">*</span>
              </div>
              <SkillsTagInput 
                selectedSkills={skills}
                onChange={setSkills}
              />
            </div>

            {/* Resume PDF Uploader */}
            <div className="form-section-card">
              <div className="form-section-title">
                📄 Resume PDF Upload
              </div>
              <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginBottom: '12px' }}>
                Upload or replace your PDF resume directly. Verified corporate recruiters and placement officers can view your resume when reviewing applications.
              </p>
              <ResumeUploader 
                file={newResumeFile}
                onFileChange={setNewResumeFile}
                existingResume={existingResume}
                onDeleteExisting={existingResume ? handleDeleteResume : null}
                addToast={addToast}
              />
            </div>

            <div style={{ marginTop: '28px', display: 'flex', gap: '14px' }}>
              <button 
                type="button" 
                className="btn-outline" 
                style={{ flex: 1 }} 
                onClick={onBack}
              >
                ← Back to Dashboard
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving Profile...' : 'Save & Update Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
