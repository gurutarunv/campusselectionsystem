import { useState } from 'react';
import Logo from '../components/Logo';
import ResumeUploader from '../components/ResumeUploader';
import SkillsTagInput from '../components/SkillsTagInput';
import { authApi } from '../services/api';

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

export default function SignupPage({ onNavigate, onBack, addToast, setCurrentUser }) {
  const [role, setRole] = useState('student');

  // Shared account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student profile fields (Clean state, no hardcoded sample values)
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [department, setDepartment] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [skills, setSkills] = useState([]);
  const [resumeFile, setResumeFile] = useState(null);

  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Mobile number validation (Indian 10-digit format)
  const validateMobile = (num) => {
    const cleaned = num.replace(/[\s-]/g, '');
    const indianMobileRegex = /^(\+91)?[6-9]\d{9}$/;
    return indianMobileRegex.test(cleaned);
  };

  const validateStudentForm = () => {
    const errors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'A valid email address is required.';
    }

    if (!mobile.trim() || !validateMobile(mobile.trim())) {
      errors.mobile = 'Enter a valid 10-digit mobile number (e.g. 9876543210 or +91 9876543210).';
    }

    if (!department) {
      errors.department = 'Please select your department.';
    }

    if (!graduationYear) {
      errors.graduationYear = 'Please select your graduation year.';
    }

    const parsedCgpa = parseFloat(cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      errors.cgpa = 'CGPA must be a number between 0.0 and 10.0.';
    }

    if (skills.length === 0) {
      errors.skills = 'Please add at least one technical skill.';
    }

    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    return errors;
  };

  const validateCompanyForm = () => {
    const errors = {};
    if (!companyName.trim()) errors.companyName = 'Company name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Valid corporate email is required.';
    }
    if (!password || password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }
    return errors;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors({});

    const errors = role === 'student' ? validateStudentForm() : validateCompanyForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      addToast(firstError, 'error');
      return;
    }

    setIsLoading(true);

    if (role === 'student') {
      try {
        const formData = new FormData();
        formData.append('email', email.trim().toLowerCase());
        formData.append('password', password);
        formData.append('fullName', fullName.trim());
        formData.append('phone', mobile.trim());
        formData.append('branch', department);
        formData.append('graduationYear', graduationYear);
        formData.append('cgpa', parseFloat(cgpa).toFixed(2));
        formData.append('skillsJson', skills.join(', '));
        formData.append('gender', 'unspecified');

        if (resumeFile) {
          formData.append('resumeFile', resumeFile);
        }

        const res = await authApi.registerStudent(formData);
        
        if (res && res.data && res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
          const sessionUser = {
            id: res.data.user.id,
            username: res.data.user.fullName || fullName.trim(),
            email: res.data.user.email,
            role: 'student'
          };
          localStorage.setItem('current_user', JSON.stringify(sessionUser));
          if (setCurrentUser) setCurrentUser(sessionUser);

          // Save student profile locally for synchronization
          const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
          profiles[email.trim().toLowerCase()] = {
            name: fullName.trim(),
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            branch: department,
            graduationYear: graduationYear,
            cgpa: parseFloat(cgpa).toFixed(2),
            skills: skills,
            resumeUrl: resumeFile ? '/api/v1/students/resume/download' : null
          };
          localStorage.setItem('student_profiles', JSON.stringify(profiles));

          addToast('Account created successfully! Welcome to Campus Placement Assistance.', 'success');
          setIsLoading(false);
          setTimeout(() => onNavigate('dashboard'), 800);
          return;
        }
      } catch (err) {
        setIsLoading(false);
        const errMsg = err.message || 'Registration failed. Please check your information.';
        addToast(errMsg, 'error');
        return;
      }
    } else {
      // Recruiter registration
      try {
        const res = await authApi.registerCompany({
          email: email.trim().toLowerCase(),
          password: password,
          companyName: companyName.trim(),
          industry: industry.trim() || 'Technology',
          website: website.trim() || 'https://company.com',
          location: location.trim() || 'Bengaluru / Hybrid',
          description: 'Verified corporate recruiter.'
        });

        if (res && res.data && res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
          const sessionUser = {
            id: res.data.user.id,
            username: companyName.trim(),
            email: res.data.user.email,
            role: 'company'
          };
          localStorage.setItem('current_user', JSON.stringify(sessionUser));
          if (setCurrentUser) setCurrentUser(sessionUser);

          addToast('Recruiter account created successfully! Redirecting...', 'success');
          setIsLoading(false);
          setTimeout(() => onNavigate('recruiter-dashboard'), 800);
          return;
        }
      } catch (err) {
        setIsLoading(false);
        addToast(err.message || 'Company registration failed.', 'error');
        return;
      }
    }
  };

  return (
    <div className="bg">
      <div className="container-box" style={{ maxWidth: role === 'student' ? '720px' : '520px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="54px" style={{ marginBottom: '12px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', fontFamily: "'Outfit', sans-serif" }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
            Register to explore matched job drives or connect with verified campus candidates.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignupSubmit} noValidate>
          {/* Account Role Selector */}
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label htmlFor="role" style={{ fontWeight: 700 }}>Select Account Type:</label>
            <div className="auth-tabs" style={{ marginBottom: 0 }}>
              <button 
                type="button" 
                className={`auth-tab ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                🎓 Student / Placement Candidate
              </button>
              <button 
                type="button" 
                className={`auth-tab ${role === 'company' ? 'active' : ''}`}
                onClick={() => setRole('company')}
              >
                💼 Corporate Recruiter
              </button>
            </div>
          </div>

          {/* STUDENT REGISTRATION SECTIONS */}
          {role === 'student' ? (
            <>
              {/* 1. Personal Information */}
              <div className="form-section-card">
                <div className="form-section-title">
                  👤 1. Personal Information
                </div>

                <div className="grid-2" style={{ gap: '14px' }}>
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name: <span className="req-star">*</span></label>
                    <input 
                      type="text" 
                      id="fullName" 
                      placeholder="Enter your full name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={validationErrors.fullName ? 'input-error' : ''}
                      required 
                    />
                    {validationErrors.fullName && (
                      <span className="field-error-msg">{validationErrors.fullName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="mobile">Mobile Number (10 digits): <span className="req-star">*</span></label>
                    <input 
                      type="tel" 
                      id="mobile" 
                      placeholder="e.g. 9876543210" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className={validationErrors.mobile ? 'input-error' : ''}
                      required 
                    />
                    {validationErrors.mobile && (
                      <span className="field-error-msg">{validationErrors.mobile}</span>
                    )}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="email">Email Address: <span className="req-star">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="Enter your university or personal email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={validationErrors.email ? 'input-error' : ''}
                    required 
                  />
                  {validationErrors.email && (
                    <span className="field-error-msg">{validationErrors.email}</span>
                  )}
                </div>
              </div>

              {/* 2. Academic Information */}
              <div className="form-section-card">
                <div className="form-section-title">
                  🎓 2. Academic Information
                </div>

                <div className="grid-3" style={{ gap: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="department">Department / Branch: <span className="req-star">*</span></label>
                    <select 
                      id="department" 
                      value={department} 
                      onChange={(e) => setDepartment(e.target.value)}
                      className={validationErrors.department ? 'input-error' : ''}
                      required
                    >
                      <option value="">-- Select Department --</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    {validationErrors.department && (
                      <span className="field-error-msg">{validationErrors.department}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="graduationYear">Graduation Year: <span className="req-star">*</span></label>
                    <select 
                      id="graduationYear" 
                      value={graduationYear} 
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className={validationErrors.graduationYear ? 'input-error' : ''}
                      required
                    >
                      <option value="">-- Select Year --</option>
                      {GRADUATION_YEARS.map((yr) => (
                        <option key={yr} value={yr}>{yr}</option>
                      ))}
                    </select>
                    {validationErrors.graduationYear && (
                      <span className="field-error-msg">{validationErrors.graduationYear}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cgpa">CGPA (0 - 10 scale): <span className="req-star">*</span></label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      max="10" 
                      id="cgpa" 
                      placeholder="e.g. 8.5" 
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      className={validationErrors.cgpa ? 'input-error' : ''}
                      required 
                    />
                    {validationErrors.cgpa && (
                      <span className="field-error-msg">{validationErrors.cgpa}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Technical Skills */}
              <div className="form-section-card">
                <div className="form-section-title">
                  💻 3. Technical Skills <span className="req-star">*</span>
                </div>
                <SkillsTagInput 
                  selectedSkills={skills} 
                  onChange={setSkills} 
                />
                {validationErrors.skills && (
                  <span className="field-error-msg" style={{ display: 'block', marginTop: '6px' }}>
                    {validationErrors.skills}
                  </span>
                )}
              </div>

              {/* 4. Resume PDF Upload */}
              <div className="form-section-card">
                <div className="form-section-title">
                  📄 4. Resume PDF Upload (Optional during registration)
                </div>
                <ResumeUploader 
                  file={resumeFile}
                  onFileChange={setResumeFile}
                  addToast={addToast}
                />
              </div>

              {/* 5. Account Security */}
              <div className="form-section-card">
                <div className="form-section-title">
                  🔒 5. Account Security
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="password">Create Password (min. 6 characters): <span className="req-star">*</span></label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      placeholder="Create a strong account password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={validationErrors.password ? 'input-error' : ''}
                      required 
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      id="signupPasswordToggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <span className="field-error-msg">{validationErrors.password}</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* RECRUITER REGISTRATION SECTION */
            <>
              <div className="form-group">
                <label htmlFor="companyName">Company / Organization Name: <span className="req-star">*</span></label>
                <input 
                  type="text" 
                  id="companyName" 
                  placeholder="Enter corporate hiring entity name" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={validationErrors.companyName ? 'input-error' : ''}
                  required 
                />
                {validationErrors.companyName && (
                  <span className="field-error-msg">{validationErrors.companyName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Official Recruiter Email: <span className="req-star">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="e.g. recruiter@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? 'input-error' : ''}
                  required 
                />
                {validationErrors.email && (
                  <span className="field-error-msg">{validationErrors.email}</span>
                )}
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="industry">Industry / Sector:</label>
                  <input 
                    type="text" 
                    id="industry" 
                    placeholder="e.g. Cloud & AI Technologies" 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Hiring Location:</label>
                  <input 
                    type="text" 
                    id="location" 
                    placeholder="e.g. Bengaluru / Hyderabad / Remote" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Company Careers Website:</label>
                <input 
                  type="url" 
                  id="website" 
                  placeholder="https://company.com/careers" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password: <span className="req-star">*</span></label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    placeholder="Minimum 6 characters" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={validationErrors.password ? 'input-error' : ''}
                    required 
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    id="signupPasswordToggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
                {validationErrors.password && (
                  <span className="field-error-msg">{validationErrors.password}</span>
                )}
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px', padding: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account & Profile...' : `Register ${role === 'student' ? 'Student' : 'Recruiter'} Account`}
          </button>
          
          <button 
            type="button" 
            className="btn-outline" 
            style={{ marginTop: '12px', width: '100%' }} 
            onClick={onBack}
          >
            ← Back to Home
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', fontWeight: 500, color: 'var(--slate-600)' }}>
            Already registered?{' '}
            <a 
              href="#login" 
              style={{ color: 'var(--primary)', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Sign In to Your Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
