import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { authApi } from '../services/api';

export default function LoginPage({ onNavigate, onBack, addToast, setCurrentUser }) {
  const [role, setRole] = useState('student');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const landingRole = localStorage.getItem('landing_role');
    if (landingRole) {
      setRole(landingRole);
      localStorage.removeItem('landing_role');
    }

    // Seed default demo accounts in client storage for offline compatibility
    let db = JSON.parse(localStorage.getItem('user_db')) || {};
    if (!db['student@campus.edu'] && !db['student']) {
      db['student@campus.edu'] = {
        role: 'student',
        username: 'Guru Prasad',
        email: 'student@campus.edu',
        password: 'Student@123',
        cgpa: '8.85',
        branch: 'Computer Science & Engineering',
        graduationYear: '2026',
        skills: ['Java', 'Spring Boot', 'React', 'MySQL', 'REST API']
      };
      db['recruiter@google.com'] = {
        role: 'company',
        username: 'Google Careers',
        email: 'recruiter@google.com',
        password: 'Recruiter@123',
        companyName: 'Google LLC',
        industry: 'Software & Cloud'
      };
      db['admin@campus.edu'] = {
        role: 'admin',
        username: 'Dean of Placements',
        email: 'admin@campus.edu',
        password: 'Admin@123'
      };
      db['student'] = db['student@campus.edu'];
      db['company'] = db['recruiter@google.com'];
      db['admin'] = db['admin@campus.edu'];
      
      localStorage.setItem('user_db', JSON.stringify(db));
    }
  }, []);

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
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const trimmedInput = usernameOrEmail.trim();
    if (!trimmedInput || !password) {
      addToast('Please enter your email and password.', 'error');
      return;
    }

    setIsLoading(true);

    // 1. Try real Spring Boot backend API first
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
        setCurrentUser(sessionUser);
        addToast('Authenticated with Spring Boot Backend!', 'success');
        setIsLoading(false);
        redirectToDashboard(mappedRole);
        return;
      }
    } catch (err) {
      // Backend not running locally yet; fall back to pre-seeded local storage
    }

    // 2. Client-side Fallback
    const db = JSON.parse(localStorage.getItem('user_db')) || {};
    const inputKey = trimmedInput.toLowerCase();
    const user = db[inputKey];

    if (!user) {
      setIsLoading(false);
      addToast('Account not found. Please click Create an Account below or select a 1-Click Demo Portal.', 'error');
      return;
    }

    if (user.password !== password) {
      setIsLoading(false);
      addToast('Incorrect password. Please try again.', 'error');
      return;
    }

    if (user.role !== role) {
      setIsLoading(false);
      addToast(`This account is registered as a ${user.role}. Please switch to the appropriate portal tab above!`, 'error');
      return;
    }

    const sessionUser = {
      username: user.username,
      role: user.role,
      email: user.email
    };
    localStorage.setItem('current_user', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);

    addToast(`Signed in successfully as ${user.username}!`, 'success');
    setIsLoading(false);
    redirectToDashboard(role);
  };

  const redirectToDashboard = (targetRole) => {
    setTimeout(() => {
      if (targetRole === 'student') {
        const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
        const studentProfile = profiles[usernameOrEmail.toLowerCase()] || profiles['student@campus.edu'];
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
    }, 600);
  };

  return (
    <div className="bg">
      <div className="container-box" style={{ maxWidth: '520px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="54px" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', fontWeight: 500 }}>
            Sign in to access your placement dashboard
          </p>
        </div>

        {/* 1-Click Demo Login Bar */}
        <div style={{ background: 'var(--slate-100)', padding: '10px 14px', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px', border: '1px solid var(--slate-200)' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--slate-600)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
            ⚡ 1-Click Demo Portals (For Evaluators):
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              type="button" 
              onClick={() => fillDemoAccount('student')}
              className="btn-outline" 
              style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--white)' }}
            >
              🎓 Student Demo
            </button>
            <button 
              type="button" 
              onClick={() => fillDemoAccount('company')}
              className="btn-outline" 
              style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--white)' }}
            >
              💼 Recruiter Demo
            </button>
            <button 
              type="button" 
              onClick={() => fillDemoAccount('admin')}
              className="btn-outline" 
              style={{ fontSize: '12px', padding: '4px 10px', background: 'var(--white)' }}
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
            Placement Admin
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="usernameOrEmail">Email Address or Username:</label>
            <input 
              type="text" 
              id="usernameOrEmail" 
              placeholder="e.g. student@campus.edu" 
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your account password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : `Sign In to ${role.charAt(0).toUpperCase() + role.slice(1)} Portal`}
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
