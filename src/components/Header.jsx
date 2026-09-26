import React from 'react';

export default function Header({ currentView, setCurrentView, currentUser, onLogout, toggleSidebar }) {
  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('home');
  };

  const getRoleDashboardRoute = (role) => {
    if (role === 'Beekeeper') return 'beekeeper';
    if (role === 'Laboratory') return 'tester';
    if (role === 'Retailer') return 'retailer';
    if (role === 'End Consumer') return 'consumer';
    return 'login';
  };

  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Sidebar trigger is global - previously suppressed on the public
            landing view, which left the root route with no navigation. */}
        <button className="hamburger-btn-react" onClick={toggleSidebar} title="Open Sidebar Navigation">
          ☰ Menu
        </button>
        <div className="brand-title" onClick={navigateToHome} style={{ cursor: 'pointer' }}>
          <span>Smart Hive</span>
        </div>
      </div>

      {/* Right side Action & Auth buttons */}
      <div className="header-right-btns" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          className="btn-white" 
          onClick={() => { window.history.pushState({}, '', '/explore'); setCurrentView('explore'); }}
          style={{ padding: '8px 16px', fontSize: '0.88rem', fontWeight: 700, margin: 0 }}
        >
          📖 Explore Platform
        </button>

        {currentUser ? (
          <>
            <button 
              className="btn-yellow"
              onClick={() => {
                const route = getRoleDashboardRoute(currentUser.role);
                window.history.pushState({}, '', `/${route}`);
                setCurrentView(route);
              }}
              style={{ padding: '8px 16px', fontSize: '0.88rem', fontWeight: 800, margin: 0 }}
            >
              📊 {currentUser.name ? currentUser.name.split(' ')[0] : currentUser.role} Dashboard
            </button>
            <button className="btn-logout-react" onClick={onLogout}>
              <span>➔ Log Out</span>
            </button>
          </>
        ) : (
          <button 
            className="btn-logout-react" 
            onClick={() => { window.history.pushState({}, '', '/login'); setCurrentView('login'); }}
          >
            <span>🔑 Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
}

