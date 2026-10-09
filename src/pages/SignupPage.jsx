import React, { useState } from 'react';
import Logo from '../components/Logo';
import { authApi } from '../services/api';

export default function SignupPage({ onNavigate, onBack, addToast }) {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setIsLoading(true);

    // 1. Try creating account on Spring Boot backend if available
    try {
      if (role === 'student') {
        await authApi.registerStudent({
          email: trimmedEmail,
          password: password,
          fullName: trimmedUsername,
          phone: '+91 98765 43210',
          gender: 'other',
          branch: 'Computer Science & Engineering',
          cgpa: 8.5
        });
      } else {
        await authApi.registerCompany({
          email: trimmedEmail,
          password: password,
          companyName: trimmedUsername,
          industry: 'Technology',
          website: 'https://company.com',
          location: 'Bengaluru / Hybrid'
        });
      }

      addToast('Account created successfully on Spring Boot backend! Please sign in.', 'success');
      setIsLoading(false);
      setTimeout(() => onNavigate('login'), 1000);
      return;
    } catch (err) {
      console.warn('Backend registration note:', err.message);
      // Fall through to localStorage db if backend is unreachable or local demo
    }

    let db = JSON.parse(localStorage.getItem('user_db')) || {};

    // Check if user already exists
    if (db[trimmedEmail.toLowerCase()] || db[trimmedUsername.toLowerCase()]) {
      setIsLoading(false);
      addToast(`An account with this email/username is already registered! Please sign in.`, 'error');
      return;
    }

    // Save user locally
    const newUser = {
      role: role,
      username: trimmedUsername,
      email: trimmedEmail,
      password: password
    };

    db[trimmedEmail.toLowerCase()] = newUser;
    db[trimmedUsername.toLowerCase()] = newUser;

    localStorage.setItem('user_db', JSON.stringify(db));
    setIsLoading(false);
    addToast('Account registered successfully! Redirecting to login...', 'success');

    setTimeout(() => {
      onNavigate('login');
    }, 1000);
  };

  return (
    <div className="bg">
      <div className="container-box" style={{ maxWidth: '500px', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="54px" style={{ marginBottom: '12px' }} />
          <p style={{ color: 'var(--slate-500)', fontSize: '14px', fontWeight: 500 }}>
            Create your account to start recruiting or applying
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignupSubmit}>
          <div className="form-group">
            <label htmlFor="role">Account Type / Role:</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student / Placement Candidate</option>
              <option value="company">Corporate Recruiter / Company</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">
              {role === 'student' ? 'Full Name:' : 'Company / Recruiter Name:'}
            </label>
            <input 
              type="text" 
              id="username" 
              placeholder={role === 'student' ? 'e.g. Guru Prasad' : 'e.g. Google India'} 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Official Email Address:</label>
            <input 
              type="email" 
              id="email" 
              placeholder={role === 'student' ? 'e.g. student@campus.edu' : 'e.g. recruiter@company.com'} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Create Password:</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Minimum 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Register Account'}
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
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
