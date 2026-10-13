import { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { authApi, studentApi } from '../services/api';

export default function LoginPage({ onNavigate, onBack, addToast, setCurrentUser }) {
  const [role, setRole] = useState(() => {
    const landingRole = localStorage.getItem('landing_role');
    return landingRole || 'student';
  });
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('landing_role')) {
      localStorage.removeItem('landing_role');
    }
  }, []);

  // Demo account filler for evaluation / portfolio presentation
  const fillDemoAccount = (demoRole) => {
    setRole(demoRole);
    if (demoRole === 'student') {
      setUsernameOrEmail('student@campus.edu');
      setPassword('Student@123');
    } else if (demoRole === 'company') {
      setUsernameOrEmail('recruiter@google.com');
      setPassword('Recruiter@123');
    } else if (demoRole === 'admin') {
      setUsernameOrEmail('admin@campus.edu');
      setPassword('Admin@123');
    }
    addToast(`Filled demo credentials for ${demoRole}. Click Sign In to evaluate.`, 'info');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const trimmedInput = usernameOrEmail.trim();
    if (!trimmedInput || !password) {
      addToast('Please enter both your email address and password.', 'error');
      return;
    }

    setIsLoading(true);

    // 1. Authenticate against Spring Boot backend API
    try {
      const result = await authApi.login(trimmedInput, password);
      if (result && result.data && result.data.token) {
        localStorage.setItem('auth_token', result.data.token);
        const userRole = result.data.user.role.replace('ROLE_', '').toLowerCase();
        const mappedRole = userRole === 'recruiter' ? 'company' : userRole;

        const sessionUser = {
          id: result.data.user.id,
          username: result.data.user.fullName || result.data.user.email.split('@')[0],
          email: result.data.user.email,
          role: mappedRole
        };

        localStorage.setItem('current_user', JSON.stringify(sessionUser));
        if (setCurrentUser) setCurrentUser(sessionUser);

        // For student logins, load profile from backend
        if (mappedRole === 'student') {
          try {
            const profileRes = await studentApi.getProfile();
            if (profileRes?.data) {
              const p = profileRes.data;
              const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
              profiles[sessionUser.email.toLowerCase()] = {
                name: p.fullName,
                email: p.email,
                mobile: p.phone,
                branch: p.branch,
                graduationYear: p.graduationYear,
                cgpa: p.cgpa,
                skills: p.skillsJson ? p.skillsJson.split(',').map(s => s.trim()) : [],
                resumeUrl: p.resumeUrl,
                resumeFileName: p.resumeFileName,
                resumeFileSize: p.resumeFileSize
              };
              localStorage.setItem('student_profiles', JSON.stringify(profiles));
            }
          } catch (profileErr) {
            console.warn('Could not pre-cache student profile:', profileErr.message);
          }
        }

        addToast(`Signed in successfully as ${sessionUser.username}!`, 'success');
        setIsLoading(false);
        redirectToDashboard(mappedRole, trimmedInput);
        return;
      }
    } catch (err) {
      // If error is invalid credentials or bad request, display message immediately
      const errMsg = err.message || '';
      if (
        errMsg.toLowerCase().includes('bad credentials') ||
        errMsg.toLowerCase().includes('invalid') ||
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.toLowerCase().includes('not found') ||
        errMsg.toLowerCase().includes('401')
      ) {
        setIsLoading(false);
        addToast('Invalid email address or password. Please verify your credentials.', 'error');
        return;
      }

      // If backend is unreachable, check local storage fallback
      console.warn('Backend unavailable, checking client demo storage:', errMsg);
    }

    // 2. Client-side Fallback (for offline demo mode)
    const db = JSON.parse(localStorage.getItem('user_db')) || {};
    const localUsers = JSON.parse(localStorage.getItem('local_registered_users')) || [];
    const inputKey = trimmedInput.toLowerCase();
    
    let user = db[inputKey];
    if (!user) {
      const foundInLocal = localUsers.find((u) => u.email === inputKey);
      if (foundInLocal) {
        user = {
          username: foundInLocal.fullName,
          password: foundInLocal.password,
          role: foundInLocal.role,
          email: foundInLocal.email
        };
      }
    }

    if (!user) {
      setIsLoading(false);
      addToast('Account not found. Please click "Create an Account" or check your credentials.', 'error');
      return;
    }

    if (user.password !== password) {
      setIsLoading(false);
      addToast('Incorrect password. Please try again.', 'error');
      return;
    }

    const sessionUser = {
      username: user.username,
      role: user.role,
      email: user.email
    };
    localStorage.setItem('current_user', JSON.stringify(sessionUser));
    if (setCurrentUser) setCurrentUser(sessionUser);

    addToast(`Signed in as ${user.username}!`, 'success');
    setIsLoading(false);
    redirectToDashboard(user.role, trimmedInput);
  };

  const redirectToDashboard = (targetRole, inputEmail) => {
    setTimeout(() => {
      if (targetRole === 'student') {
        const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
        const studentProfile = profiles[inputEmail.toLowerCase()] || profiles['student@campus.edu'];
        if (studentProfile) {
          onNavigate('dashboard');
        } else {
          onNavigate('onboarding');
        }
      } else if (targetRole === 'company' || targetRole === 'recruiter') {
        onNavigate('recruiter-dashboard');
      } else if (targetRole === 'admin') {
        onNavigate('admin-dashboard');
      }
    }, 500);
  };

  return (
    <div className="bg">
      <div className="container-box" style={{ maxWidth: '520px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="54px" style={{ marginBottom: '12px' }} />
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--slate-900)', fontFamily: "'Outfit', sans-serif" }}>
            Sign In to Placement Portal
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', fontWeight: 500, marginTop: '4px' }}>
            Enter your registered account credentials to proceed
          </p>
        </div>

        {/* 1-Click Demo Portals for Portfolio Evaluators */}
        <div className="demo-portals-box">
          <div className="demo-portals-title">
            ⚡ Quick Demo Accounts (For Evaluators):
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => fillDemoAccount('student')}
              className="btn-outline demo-pill-btn"
            >
              🎓 Student Demo
            </button>
            <button 
              type="button" 
              onClick={() => fillDemoAccount('company')}
              className="btn-outline demo-pill-btn"
            >
              💼 Recruiter Demo
            </button>
            <button 
              type="button" 
              onClick={() => fillDemoAccount('admin')}
              className="btn-outline demo-pill-btn"
            >
              🏛️ Admin Demo
            </button>
          </div>
        </div>

        {/* Role Selection Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            Student
          </button>
          <button 
            type="button" 
            className={`auth-tab ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
          >
            Recruiter
          </button>
          <button 
            type="button" 
            className={`auth-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => setRole('admin')}
          >
            Placement Officer
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Email Address:</label>
            <input 
              type="email" 
              id="usernameOrEmail" 
              placeholder="Enter your registered email address" 
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Enter your account password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <button
                type="button"
                className="password-toggle-btn"
                id="loginPasswordToggle"
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
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '8px', padding: '11px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Authenticating...' : `Sign In to ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
          </button>
          
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px' }}>
            <button 
              type="button" 
              className="btn-outline" 
              style={{ width: '100%' }} 
              onClick={onBack}
            >
              ← Back to Home
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', fontWeight: 500, color: 'var(--slate-600)' }}>
            New to Campus Placement Assistance?{' '}
            <a 
              href="#signup" 
              style={{ color: 'var(--primary)', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('signup');
              }}
            >
              Create an Account
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
