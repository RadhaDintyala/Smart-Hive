import React from 'react';

export default function Header({ currentView, setCurrentView, currentUser, onLogout, toggleSidebar }) {
  const navigateToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('home');
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

      {/* Right side Auth & Logout buttons */}
      <div className="header-right-btns">
        {currentUser ? (
          <button className="btn-logout-react" onClick={onLogout}>
            <span>➔ Log Out</span>
          </button>
        ) : (
          <button className="btn-logout-react" onClick={() => { window.history.pushState({}, '', '/login'); setCurrentView('login'); }}>
            <span>🔑 Login</span>
          </button>
        )}
      </div>
    </header>
  );
}
