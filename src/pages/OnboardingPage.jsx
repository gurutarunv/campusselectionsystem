import React, { useState, useEffect } from 'react';
import { studentApi } from '../services/api';

export default function OnboardingPage({ user, onNavigate, onBack, addToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('male');
  const [cgpa, setCgpa] = useState('8.85');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [skills, setSkills] = useState('Java, Spring Boot, React, MySQL, REST APIs, Git');
  const [resumeUrl, setResumeUrl] = useState('https://drive.google.com/file/d/demo-resume/view');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    
    // Pre-fill fields from session if available
    setName(user.username || '');
    if (user.email) {
      setEmail(user.email);
    }

    // Try fetching existing profile from backend
    loadExistingProfile();
  }, [user, onNavigate]);

  const loadExistingProfile = async () => {
    try {
      const res = await studentApi.getProfile();
      if (res?.data) {
        const p = res.data;
        setName(p.fullName || user.username || '');
        setEmail(p.email || user.email || '');
        setMobile(p.phone || '');
        setGender(p.gender || 'male');
        setCgpa(p.cgpa ? p.cgpa.toString() : '8.85');
        setBranch(p.branch || 'Computer Science & Engineering');
        setGraduationYear(p.graduationYear ? p.graduationYear.toString() : '2026');
        setSkills(p.skillsJson || 'Java, Spring Boot, React, MySQL');
        setResumeUrl(p.resumeUrl || 'https://drive.google.com/file/d/demo-resume/view');
        return;
      }
    } catch {
      // Backend offline or first-time user
    }

    // Check localStorage fallback
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const existingProfile = profiles[user.email?.toLowerCase()] || profiles[user.username?.toLowerCase()];
    if (existingProfile) {
      setName(existingProfile.name || user.username || '');
      setEmail(existingProfile.email || user.email || '');
      setMobile(existingProfile.mobile || '');
      setGender(existingProfile.gender || 'male');
      setCgpa(existingProfile.cgpa ? existingProfile.cgpa.toString() : '8.85');
      setBranch(existingProfile.branch || 'Computer Science & Engineering');
      setGraduationYear(existingProfile.graduationYear ? existingProfile.graduationYear.toString() : '2026');
      setSkills(Array.isArray(existingProfile.skills) ? existingProfile.skills.join(', ') : (existingProfile.skills || 'Java, Spring Boot, React, MySQL'));
      setResumeUrl(existingProfile.resumeUrl || 'https://drive.google.com/file/d/demo-resume/view');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMobile = mobile.trim();
    
    if (!trimmedName || !trimmedEmail || !trimmedMobile || !cgpa || !branch) {
      addToast('Please complete all required profile fields.', 'error');
      return;
    }

    setIsSubmitting(true);

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');

    // 1. Attempt updating profile on Spring Boot backend
    try {
      await studentApi.updateProfile({
        fullName: trimmedName,
        phone: trimmedMobile,
        gender: gender,
        cgpa: parseFloat(cgpa) || 8.0,
        branch: branch,
        graduationYear: parseInt(graduationYear, 10) || 2026,
        resumeUrl: resumeUrl,
        skillsJson: skills
      });
      addToast('Academic profile updated on Spring Boot server!', 'success');
    } catch (err) {
      console.warn('Backend student profile update note:', err.message);
    }

    // 2. Save in student_profiles map
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const emailKey = trimmedEmail.toLowerCase();
    const usernameKey = (user.username || '').toLowerCase();

    const profileData = {
      username: user.username,
      name: trimmedName,
      email: trimmedEmail,
      mobile: trimmedMobile,
      gender: gender,
      cgpa: parseFloat(cgpa) || 8.0,
      branch: branch,
      graduationYear: graduationYear,
      skills: skillsArray,
      resumeUrl: resumeUrl
    };

    profiles[emailKey] = profileData;
    if (usernameKey) profiles[usernameKey] = profileData;

    localStorage.setItem('student_profiles', JSON.stringify(profiles));

    // Compatibility fields
    localStorage.setItem('studentName', trimmedName);
    localStorage.setItem('studentEmail', trimmedEmail);
    localStorage.setItem('studentMobile', trimmedMobile);
    localStorage.setItem('studentCgpa', cgpa);
    localStorage.setItem('studentBranch', branch);
    localStorage.setItem('gender', gender);

    setIsSubmitting(false);
    addToast('Profile saved successfully! Directing to student portal...', 'success');

    setTimeout(() => {
      onNavigate('dashboard');
    }, 600);
  };

  return (
    <div className="container">
      <div className="container-box" style={{ maxWidth: '680px', margin: '0 auto', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 className="accent-title" style={{ fontWeight: 800, marginBottom: '6px', fontSize: '26px' }}>
            Academic Profile & Onboarding
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px' }}>
            Complete your academic details to unlock matched placement opportunities and company drives.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="studentName">Full Name:</label>
              <input 
                type="text" 
                id="studentName" 
                placeholder="e.g. Guru Prasad" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="studentEmail">Academic Email:</label>
              <input 
                type="email" 
                id="studentEmail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group">
              <label htmlFor="studentMobile">Mobile Number:</label>
              <input 
                type="tel" 
                id="studentMobile" 
                placeholder="e.g. +91 98765 43210" 
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender:</label>
              <select 
                id="gender" 
                value={gender} 
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid-3" style={{ gap: '12px' }}>
            <div className="form-group">
              <label htmlFor="cgpa">Cumulative CGPA:</label>
              <input 
                type="number" 
                step="0.01" 
                id="cgpa" 
                min="0" 
                max="10" 
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="branch">Department / Branch:</label>
              <select 
                id="branch" 
                value={branch} 
                onChange={(e) => setBranch(e.target.value)}
                required
              >
                <option value="Computer Science & Engineering">Computer Science & Engg.</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Comm.</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Bio-Technology & Life Sciences">Bio-Technology</option>
                <option value="Healthcare Informatics">Healthcare Informatics</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="graduationYear">Graduation Year:</label>
              <select 
                id="graduationYear" 
                value={graduationYear} 
                onChange={(e) => setGraduationYear(e.target.value)}
                required
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="studentSkills">Key Technical Skills (comma separated):</label>
            <input 
              type="text" 
              id="studentSkills" 
              placeholder="e.g. Java, Spring Boot, React, SQL, Algorithms" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resumeUrl">Resume / Portfolio Link:</label>
            <input 
              type="url" 
              id="resumeUrl" 
              placeholder="e.g. https://drive.google.com/file/..." 
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '14px' }}>
            <button 
              type="button" 
              className="btn-outline" 
              style={{ flex: 1 }} 
              onClick={onBack}
            >
              ← Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Profile...' : 'Save Profile & Access Drives'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
