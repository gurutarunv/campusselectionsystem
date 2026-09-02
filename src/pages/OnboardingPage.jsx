import React, { useState, useEffect } from 'react';

export default function OnboardingPage({ user, onNavigate, onBack, addToast }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    if (!user) {
      onNavigate('login');
      return;
    }
    
    // Pre-fill email from session if available
    if (user.email) {
      setEmail(user.email);
    }

    // Check if profile already exists (to edit profile)
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const existingProfile = profiles[user.username.toLowerCase()];
    if (existingProfile) {
      setName(existingProfile.name || '');
      setEmail(existingProfile.email || user.email || '');
      setMobile(existingProfile.mobile || '');
      setGender(existingProfile.gender || '');
      setSkills(existingProfile.skills ? existingProfile.skills.join(', ') : '');
    }
  }, [user, onNavigate]);

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMobile = mobile.trim();
    
    if (!trimmedName || !trimmedEmail || !trimmedMobile || !gender) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    const skillsArray = skills
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '');

    // Save in student_profiles map
    const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
    const usernameKey = user.username.toLowerCase();

    profiles[usernameKey] = {
      username: user.username,
      name: trimmedName,
      email: trimmedEmail,
      mobile: trimmedMobile,
      gender: gender,
      skills: skillsArray
    };

    localStorage.setItem('student_profiles', JSON.stringify(profiles));

    // Compatibility fields
    localStorage.setItem('studentName', trimmedName);
    localStorage.setItem('studentEmail', trimmedEmail);
    localStorage.setItem('studentMobile', trimmedMobile);
    localStorage.setItem('gender', gender);

    addToast('Profile completed! Directing to candidate panel...', 'success');

    setTimeout(() => {
      onNavigate('dashboard');
    }, 1000);
  };

  return (
    <div className="container">
      <div className="container-box glass-card" style={{ maxWidth: '650px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 className="accent-title" style={{ fontWeight: 800, marginBottom: '5px' }}>Profile Onboarding</h1>
          <p style={{ color: 'var(--slate-600)', fontWeight: 500 }}>Complete your candidate profile to access matching streams</p>
        </div>

        <form onSubmit={handleProfileSubmit}>
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
            <label htmlFor="studentEmail">Contact Email:</label>
            <input 
              type="email" 
              id="studentEmail" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <small style={{ color: 'var(--slate-600)', fontSize: '12px', marginTop: '4px' }}>Used by recruiters to contact you.</small>
          </div>

          <div className="form-group">
            <label htmlFor="studentMobile">Mobile Number:</label>
            <input 
              type="tel" 
              id="studentMobile" 
              placeholder="e.g. +91 98765 43210" 
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required 
              pattern="[0-9+\s\-]{10,15}"
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
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="studentSkills">Key Technical Skills (comma separated):</label>
            <input 
              type="text" 
              id="studentSkills" 
              placeholder="e.g. HTML, CSS, JavaScript, React, Java" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
            <button 
              type="button" 
              className="btn-outline" 
              style={{ flex: 1 }} 
              onClick={onBack}
            >
              ← Back
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Profile & Proceed</button>
          </div>
        </form>
      </div>
    </div>
  );
}
