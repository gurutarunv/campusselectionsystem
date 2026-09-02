import React from 'react';
import Logo from './Logo';

export default function Navbar({ user, onLogout, onNavigate, onBack, canGoBack }) {
  return (
    <nav className="main-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {canGoBack && (
          <button 
            onClick={onBack}
            className="btn-outline"
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              borderRadius: 'var(--border-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: '1px solid var(--slate-300)',
              background: 'var(--white)',
              cursor: 'pointer',
              fontWeight: 600,
              color: 'var(--slate-700)',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            title="Go to previous page"
          >
            ← Back
          </button>
        )}
        <div className="nav-brand" onClick={() => onNavigate('landing')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <Logo height="44px" />
        </div>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <div className="nav-user" id="user-badge">
              <span>{user.username}</span>
              <span 
                className="user-role" 
                style={user.role === 'company' ? { background: 'var(--dark)' } : {}}
              >
                {user.role === 'company' ? 'Recruiter' : 'Student'}
              </span>
            </div>
            <button 
              className="btn-outline" 
              style={{ padding: '6px 14px', fontSize: '13px' }} 
              onClick={onLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a 
              href="#login" 
              style={{ fontWeight: 600, color: 'var(--slate-800)', cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Portal Login
            </a>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 18px', fontSize: '14px', boxShadow: 'none' }}
              onClick={() => onNavigate('signup')}
            >
              Register Now
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
