import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import NeuralNetworkBackground from './components/NeuralNetworkBackground';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import StudentDashboard from './pages/StudentDashboard';
import JobOpeningsPage from './pages/JobOpeningsPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('current_user')) || null;
    } catch {
      return null;
    }
  });

  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('current_user'));
      if (savedUser) {
        if (savedUser.role === 'student') {
          const profiles = JSON.parse(localStorage.getItem('student_profiles')) || {};
          const studentProfile = profiles[savedUser.email?.toLowerCase()] || profiles[savedUser.username?.toLowerCase()];
          return studentProfile ? 'dashboard' : 'onboarding';
        } else if (savedUser.role === 'company' || savedUser.role === 'recruiter') {
          return 'recruiter-dashboard';
        } else if (savedUser.role === 'admin') {
          return 'admin-dashboard';
        }
      }
    } catch {
      // ignore
    }
    return 'landing';
  });

  const [toasts, setToasts] = useState([]);
  
  // Custom navigation stack
  const [historyStack, setHistoryStack] = useState(() => [currentPage]);

  // Session popstate initialization
  useEffect(() => {
    window.history.replaceState({ page: currentPage }, '', '');

    // Listen to browser back/forward buttons
    const handlePopState = (event) => {
      if (event.state && event.state.page) {
        setCurrentPage(event.state.page);
        // Sync our history stack
        setHistoryStack((prev) => {
          const index = prev.indexOf(event.state.page);
          if (index !== -1) {
            return prev.slice(0, index + 1);
          }
          return [...prev, event.state.page];
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const addToast = (message, type = 'error') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleNavigate = (page, replace = false) => {
    if (replace) {
      window.history.replaceState({ page }, '', '');
      setHistoryStack([page]);
    } else {
      window.history.pushState({ page }, '', '');
      setHistoryStack((prev) => {
        if (prev[prev.length - 1] === page) return prev;
        return [...prev, page];
      });
    }
    setCurrentPage(page);
  };

  const handleBack = () => {
    if (historyStack.length > 1) {
      window.history.back();
    } else {
      handleNavigate('landing', true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    addToast('Signed out of placement session.', 'success');
    handleNavigate('landing', true);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return (
          <LoginPage 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            addToast={addToast} 
            setCurrentUser={setCurrentUser} 
          />
        );
      case 'signup':
        return (
          <SignupPage 
            onNavigate={handleNavigate} 
            onBack={handleBack} 
            addToast={addToast} 
            setCurrentUser={setCurrentUser} 
          />
        );
      case 'onboarding':
        return (
          <OnboardingPage 
            user={currentUser} 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            addToast={addToast} 
          />
        );
      case 'dashboard':
        return <StudentDashboard user={currentUser} onNavigate={handleNavigate} onBack={handleBack} addToast={addToast} />;
      case 'it-placements':
        return (
          <JobOpeningsPage 
            user={currentUser} 
            streamType="IT" 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            addToast={addToast} 
          />
        );
      case 'non-it-placements':
        return (
          <JobOpeningsPage 
            user={currentUser} 
            streamType="NON-IT" 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            addToast={addToast} 
          />
        );
      case 'recruiter-dashboard':
        return (
          <RecruiterDashboard 
            user={currentUser} 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            addToast={addToast} 
          />
        );
      case 'admin-dashboard':
        return (
          <AdminDashboard 
            user={currentUser} 
            onNavigate={handleNavigate} 
            onBack={handleBack}
            addToast={addToast} 
          />
        );
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  const showNavbar = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <NeuralNetworkBackground />

      {showNavbar && (
        <Navbar 
          user={currentUser} 
          onLogout={handleLogout} 
          onNavigate={handleNavigate} 
          onBack={handleBack}
          canGoBack={historyStack.length > 1}
        />
      )}
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {renderPage()}
      </main>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
