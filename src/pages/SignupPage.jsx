import React, { useState } from 'react';
import Logo from '../components/Logo';

export default function SignupPage({ onNavigate, onBack, addToast }) {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignupSubmit = (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername || !trimmedEmail || !password) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    let db = JSON.parse(localStorage.getItem('user_db')) || {};

    // Check if username already exists
    if (db[trimmedUsername.toLowerCase()]) {
      addToast(`Username "${trimmedUsername}" is already registered! Please choose another.`, 'error');
      return;
    }

    // Save user
    db[trimmedUsername.toLowerCase()] = {
      role: role,
      username: trimmedUsername,
      email: trimmedEmail,
      password: password
    };

    localStorage.setItem('user_db', JSON.stringify(db));
    addToast('Account created successfully! Redirecting to Login...', 'success');

    setTimeout(() => {
      onNavigate('login');
    }, 1500);
  };

  return (
    <div className="bg">
      <div className="container-box glass-card" style={{ maxWidth: '480px', padding: '40px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo height="80px" style={{ marginBottom: '15px' }} />
          <p style={{ color: 'var(--slate-600)', fontWeight: 500 }}>Create your recruitment portal account</p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSignupSubmit}>
          <div className="form-group">
            <label htmlFor="role">Select your role:</label>
            <select 
              id="role" 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="student">Student / Candidate</option>
              <option value="company">Recruiter / Company</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="username">Choose Username:</label>
            <input 
              type="text" 
              id="username" 
              placeholder="e.g. gurut99" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input 
              type="email" 
              id="email" 
              placeholder="e.g. guru@10000coders.co" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Create Password:</label>
            <input 
              type="password" 
              id="password" 
              placeholder="Min. 6 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Create Account</button>
          
          <button 
            type="button" 
            className="btn-outline" 
            style={{ marginTop: '10px', width: '100%' }} 
            onClick={onBack}
          >
            ← Back
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', fontWeight: 500, color: 'var(--slate-600)' }}>
            Already have an account?{' '}
            <a 
              href="#login" 
              style={{ color: 'var(--primary)', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Log In
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
