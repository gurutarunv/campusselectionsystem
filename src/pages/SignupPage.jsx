import { useState } from 'react';
import Logo from '../components/Logo';
import { authApi } from '../services/api';

export default function SignupPage({ onNavigate, onBack, addToast, setCurrentUser }) {
  const [role, setRole] = useState('student');

  // Shared account fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Student required registration fields: Name, Age, Email, Password
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');

  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateStudentForm = () => {
    const errors = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Full Name is required (minimum 2 characters).';
    }

    const parsedAge = parseInt(age, 10);
    if (!age || isNaN(parsedAge) || parsedAge < 16 || parsedAge > 99) {
      errors.age = 'Please enter a valid age between 16 and 99.';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'A valid email address is required.';
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
      const studentPayload = {
        email: email.trim().toLowerCase(),
        password: password,
        fullName: fullName.trim(),
        age: parseInt(age, 10)
      };

      try {
        const res = await authApi.registerStudent(studentPayload);
        
        if (res && res.data && res.data.token) {
          localStorage.setItem('auth_token', res.data.token);
          const sessionUser = {
            id: res.data.user.id,
            username: res.data.user.fullName || fullName.trim(),
            email: res.data.user.email,
            role: 'student',
            age: parseInt(age, 10)
          };
          localStorage.setItem('current_user', JSON.stringify(sessionUser));
          if (setCurrentUser) setCurrentUser(sessionUser);

          // Save student profile locally for synchronization
          const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
          profiles[email.trim().toLowerCase()] = {
            name: fullName.trim(),
            age: parseInt(age, 10),
            email: email.trim().toLowerCase(),
            mobile: '',
            branch: '',
            graduationYear: '',
            cgpa: '',
            skills: [],
            resumeUrl: null
          };
          localStorage.setItem('student_profiles', JSON.stringify(profiles));

          addToast('Account created successfully! Please complete your academic profile and resume.', 'success');
          setIsLoading(false);
          setTimeout(() => onNavigate('onboarding'), 600);
          return;
        }
      } catch (err) {
        console.warn('[Signup] Backend registration notice:', err);

        // Fallback for offline mode or network reachability
        if (err.isNetworkError || err.message?.includes('connect to backend') || err.message?.includes('Failed to fetch')) {
          const localId = Date.now();
          const localToken = 'local-jwt-' + localId;
          localStorage.setItem('auth_token', localToken);

          const sessionUser = {
            id: localId,
            username: fullName.trim(),
            email: email.trim().toLowerCase(),
            role: 'student',
            age: parseInt(age, 10)
          };
          localStorage.setItem('current_user', JSON.stringify(sessionUser));
          if (setCurrentUser) setCurrentUser(sessionUser);

          const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
          profiles[email.trim().toLowerCase()] = {
            name: fullName.trim(),
            age: parseInt(age, 10),
            email: email.trim().toLowerCase(),
            mobile: '',
            branch: '',
            graduationYear: '',
            cgpa: '',
            skills: [],
            resumeUrl: null
          };
          localStorage.setItem('student_profiles', JSON.stringify(profiles));

          // Save for offline login authentication
          const localUsers = JSON.parse(localStorage.getItem('local_registered_users')) || [];
          localUsers.push({
            email: email.trim().toLowerCase(),
            password: password,
            fullName: fullName.trim(),
            age: parseInt(age, 10),
            role: 'student'
          });
          localStorage.setItem('local_registered_users', JSON.stringify(localUsers));

          setIsLoading(false);
          addToast('Account created successfully! Proceeding to complete your profile & resume.', 'success');
          setTimeout(() => onNavigate('onboarding'), 600);
          return;
        }

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
          setTimeout(() => onNavigate('recruiter-dashboard'), 600);
          return;
        }
      } catch (err) {
        console.warn('[Signup] Recruiter registration notice:', err);
        if (err.isNetworkError || err.message?.includes('connect to backend') || err.message?.includes('Failed to fetch')) {
          const localId = Date.now();
          localStorage.setItem('auth_token', 'local-jwt-' + localId);
          const sessionUser = {
            id: localId,
            username: companyName.trim(),
            email: email.trim().toLowerCase(),
            role: 'company'
          };
          localStorage.setItem('current_user', JSON.stringify(sessionUser));
          if (setCurrentUser) setCurrentUser(sessionUser);
          setIsLoading(false);
          addToast('Recruiter account created successfully! Redirecting...', 'success');
          setTimeout(() => onNavigate('recruiter-dashboard'), 600);
          return;
        }

        setIsLoading(false);
        addToast(err.message || 'Company registration failed.', 'error');
        return;
      }
    }
  };

  return (
    <div className="bg">
      <div className="container-box" style={{ maxWidth: '520px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="54px" style={{ marginBottom: '12px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', fontFamily: "'Outfit', sans-serif" }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
            Register your basic account details. You can configure your profile, skills, and resume immediately after.
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
                🎓 Student
              </button>
              <button 
                type="button" 
                className={`auth-tab ${role === 'company' ? 'active' : ''}`}
                onClick={() => setRole('company')}
              >
                💼 Recruiter
              </button>
            </div>
          </div>

          {/* STUDENT REGISTRATION (Name, Age, Email, Password) */}
          {role === 'student' ? (
            <div className="form-section-card" style={{ marginBottom: '20px' }}>
              <div className="form-section-title">
                👤 Student Account Credentials
              </div>

              {/* Full Name */}
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

              {/* Age */}
              <div className="form-group">
                <label htmlFor="age">Age: <span className="req-star">*</span></label>
                <input 
                  type="number" 
                  id="age" 
                  placeholder="Enter your age (e.g. 21)" 
                  min="16"
                  max="99"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={validationErrors.age ? 'input-error' : ''}
                  required 
                />
                {validationErrors.age && (
                  <span className="field-error-msg">{validationErrors.age}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label htmlFor="email">Email Address: <span className="req-star">*</span></label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? 'input-error' : ''}
                  required 
                />
                {validationErrors.email && (
                  <span className="field-error-msg">{validationErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="password">Create Password: <span className="req-star">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  placeholder="Minimum 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={validationErrors.password ? 'input-error' : ''}
                  required 
                />
                {validationErrors.password && (
                  <span className="field-error-msg">{validationErrors.password}</span>
                )}
              </div>
            </div>
          ) : (
            /* RECRUITER REGISTRATION */
            <div className="form-section-card" style={{ marginBottom: '20px' }}>
              <div className="form-section-title">
                🏢 Company Details
              </div>

              <div className="form-group">
                <label htmlFor="companyName">Company / Organization: <span className="req-star">*</span></label>
                <input 
                  type="text" 
                  id="companyName" 
                  placeholder="e.g. Google LLC" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={validationErrors.companyName ? 'input-error' : ''}
                  required 
                />
                {validationErrors.companyName && (
                  <span className="field-error-msg">{validationErrors.companyName}</span>
                )}
              </div>

              <div className="grid-2" style={{ gap: '14px' }}>
                <div className="form-group">
                  <label htmlFor="industry">Industry Sector:</label>
                  <input 
                    type="text" 
                    id="industry" 
                    placeholder="e.g. Cloud & AI" 
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Corporate Location:</label>
                  <input 
                    type="text" 
                    id="location" 
                    placeholder="e.g. Bengaluru / Hybrid" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="website">Website URL:</label>
                <input 
                  type="url" 
                  id="website" 
                  placeholder="https://company.com" 
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="recruiterEmail">Work Email Address: <span className="req-star">*</span></label>
                <input 
                  type="email" 
                  id="recruiterEmail" 
                  placeholder="recruiter@company.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? 'input-error' : ''}
                  required 
                />
                {validationErrors.email && (
                  <span className="field-error-msg">{validationErrors.email}</span>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="recruiterPassword">Create Password: <span className="req-star">*</span></label>
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '12px', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="recruiterPassword" 
                  placeholder="Minimum 6 characters" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={validationErrors.password ? 'input-error' : ''}
                  required 
                />
                {validationErrors.password && (
                  <span className="field-error-msg">{validationErrors.password}</span>
                )}
              </div>
            </div>
          )}

          {/* Step Indicator Note */}
          <div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '13px', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>ℹ️</span>
            <span>
              {role === 'student'
                ? 'After creating your account, you will immediately proceed to update your skills, CGPA, department, and upload your resume PDF.'
                : 'Recruiter accounts allow publishing campus drives and managing candidate interview pipelines.'}
            </span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 700 }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account & Continue →'}
          </button>
        </form>

        {/* Existing Account Footer */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '14px', color: 'var(--slate-600)' }}>
          Already have an account?{' '}
          <span 
            onClick={() => onNavigate('login')} 
            style={{ color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign In here
          </span>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button 
            type="button" 
            onClick={onBack} 
            className="btn btn-secondary" 
            style={{ padding: '6px 14px', fontSize: '13px', background: 'transparent', border: 'none', color: 'var(--slate-500)' }}
          >
            ← Back to Landing
          </button>
        </div>
      </div>
    </div>
  );
}
