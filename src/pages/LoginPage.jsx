import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';

export default function LoginPage({ onNavigate, onBack, addToast, setCurrentUser }) {
  const [role, setRole] = useState('student');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if landing role override was passed
  useEffect(() => {
    const landingRole = localStorage.getItem('landing_role');
    if (landingRole) {
      setRole(landingRole);
      localStorage.removeItem('landing_role');
    }

    // Seed default demo accounts to localStorage if empty
    let db = JSON.parse(localStorage.getItem('user_db')) || {};
    if (!db['student@campus.edu'] && !db['student']) {
      db['student@campus.edu'] = {
        role: 'student',
        username: 'Guru Prasad',
        email: 'student@campus.edu',
        password: 'password123',
        cgpa: '8.85',
        branch: 'Computer Science',
        graduationYear: '2026',
        skills: ['Java', 'Spring Boot', 'React', 'MySQL', 'REST API']
      };
      db['recruiter@google.com'] = {
        role: 'company',
        username: 'Google Careers',
        email: 'recruiter@google.com',
        password: 'password123',
        companyName: 'Google LLC',
        industry: 'Software & Cloud'
      };
      db['admin@campus.edu'] = {
        role: 'admin',
        username: 'Dean of Placements',
        email: 'admin@campus.edu',
        password: 'password123'
      };
      // Backwards compatibility mappings
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
      setPassword('password123');
    } else if (demoRole === 'company') {
      setUsernameOrEmail('recruiter@google.com');
      setPassword('password123');
    } else if (demoRole === 'admin') {
      setUsernameOrEmail('admin@campus.edu');
      setPassword('password123');
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

    // Try authenticating against real backend API first if available
    try {
      const response = await fetch('http://localhost:8080/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedInput, password: password })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.token) {
          localStorage.setItem('auth_token', result.data.token);
          const userSession = {
            username: result.data.user.fullName || result.data.user.email.split('@')[0],
            email: result.data.user.email,
            role: result.data.user.role.replace('ROLE_', '').toLowerCase() === 'recruiter' ? 'company' : result.data.user.role.replace('ROLE_', '').toLowerCase()
          };
          localStorage.setItem('current_user', JSON.stringify(userSession));
          setCurrentUser(userSession);
          addToast('Authenticated with Spring Boot backend!', 'success');
          setIsLoading(false);
          redirectToDashboard(userSession.role);
          return;
        }
      }
    } catch (err) {
      // Backend not running on local port yet or offline fallback
    }

    // Client/Local Fallback
    const db = JSON.parse(localStorage.getItem('user_db')) || {};
    const inputKey = trimmedInput.toLowerCase();
    const user = db[inputKey];

    if (!user) {
      setIsLoading(false);
      addToast('Account not found. Please register an account below or use a 1-Click Demo Login.', 'error');
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
      } else if (targetRole === 'company') {
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
