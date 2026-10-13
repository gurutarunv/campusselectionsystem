import Logo from './Logo';

export default function Navbar({ user, onLogout, onNavigate, onBack, canGoBack }) {
  const getRoleLabel = (role) => {
    if (role === 'company' || role === 'recruiter') return 'Recruiter';
    if (role === 'admin') return 'Placement Officer';
    return 'Student';
  };

  const getRoleBadgeClass = (role) => {
    if (role === 'company' || role === 'recruiter') return 'user-role recruiter';
    if (role === 'admin') return 'user-role admin';
    return 'user-role';
  };

  const handleDashboardClick = () => {
    if (!user) {
      onNavigate('landing');
      return;
    }
    if (user.role === 'company' || user.role === 'recruiter') {
      onNavigate('recruiter-dashboard');
    } else if (user.role === 'admin') {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('dashboard');
    }
  };

  return (
    <nav className="main-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {canGoBack && (
          <button 
            onClick={onBack}
            className="btn-outline"
            style={{
              padding: '6px 12px',
              fontSize: '13px'
            }}
            title="Go to previous page"
          >
            ← Back
          </button>
        )}
        <div 
          className="nav-brand" 
          onClick={handleDashboardClick}
        >
          <Logo height="44px" />
        </div>
      </div>

      <div className="nav-links">
        {user ? (
          <>
            <button 
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '13px', background: 'var(--slate-50)' }}
              onClick={handleDashboardClick}
            >
              📊 Portal Console
            </button>

            <div className="nav-user" id="user-badge">
              <span>{user.username}</span>
              <span className={getRoleBadgeClass(user.role)}>
                {getRoleLabel(user.role)}
              </span>
            </div>

            <button 
              className="btn-outline" 
              style={{ padding: '6px 14px', fontSize: '13px' }} 
              onClick={onLogout}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <a 
              href="#login" 
              style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '14px', cursor: 'pointer' }}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('login');
              }}
            >
              Portal Login
            </a>
            <button 
              className="btn-primary" 
              style={{ padding: '8px 18px', fontSize: '14px' }}
              onClick={() => onNavigate('signup')}
            >
              Register Candidate
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
