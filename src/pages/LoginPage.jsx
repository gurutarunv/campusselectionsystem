import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';

export default function LoginPage({ onNavigate, onBack, addToast, setCurrentUser }) {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Seed default demo accounts to localStorage if completely empty on page load
  useEffect(() => {
    // Check if landing role override is set
    const landingRole = localStorage.getItem('landing_role');
    if (landingRole) {
      setRole(landingRole);
      localStorage.removeItem('landing_role');
    }

    let db = JSON.parse(localStorage.getItem('user_db')) || {};
    if (Object.keys(db).length === 0) {
      db['student'] = {
        role: 'student',
        username: 'Student',
        email: 'student@10000coders.co',
        password: 'password123'
      };
      db['company'] = {
        role: 'company',
        username: 'Company',
        email: 'recruiter@google.com',
        password: 'password123'
      };
      localStorage.setItem('user_db', JSON.stringify(db));
    }
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      addToast('Please fill out all fields.', 'error');
      return;
    }

    const db = JSON.parse(localStorage.getItem('user_db')) || {};
    const usernameKey = trimmedUsername.toLowerCase();
    const user = db[usernameKey];

    if (!user) {
      addToast(
        `Account does not exist! Please click <a href="#signup" style="color:var(--white); text-decoration:underline; font-weight:700;">Create an Account</a> below to register.`,
        'error'
      );
      return;
    }

    if (user.password !== password) {
      addToast('Incorrect password. Please try again!', 'error');
      return;
    }

    if (user.role !== role) {
      addToast(`This account is registered as a ${user.role}. Please switch tabs above!`, 'error');
      return;
    }

    // Save session state
    const sessionUser = {
      username: user.username,
      role: user.role,
      email: user.email
    };
    localStorage.setItem('current_user', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);

    addToast('Logged in successfully! Redirecting...', 'success');

    setTimeout(() => {
      if (role === 'student') {
        const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
        const studentProfile = profiles[usernameKey];
        if (studentProfile) {
          onNavigate('dashboard');
        } else {
          onNavigate('onboarding');
        }
      } else if (role === 'company') {
        onNavigate('recruiter-dashboard');
      }
    }, 1000);
  };

  return (
    <div className="bg">
      <div className="container-box glass-card" style={{ maxWidth: '480px', padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="80px" style={{ marginBottom: '15px' }} />
          <p style={{ color: 'var(--slate-600)', fontWeight: 500 }}>Access the placement & training portal</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => setRole('student')}
          >
            Student Portal
          </button>
          <button 
            type="button" 
            className={`auth-tab ${role === 'company' ? 'active' : ''}`}
            onClick={() => setRole('company')}
          >
            Recruiter Portal
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input 
              type="text" 
              id="username" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Sign In</button>
          
          <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: '10px' }}>
            <button 
              type="button" 
              className="btn-outline" 
              style={{ flex: 1 }} 
              onClick={onBack}
            >
              ← Back
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', fontWeight: 500, color: 'var(--slate-600)' }}>
            New to 10000 Coders?{' '}
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
