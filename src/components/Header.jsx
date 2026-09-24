import React from 'react';

export default function Header({ currentView, setCurrentView, currentUser, onLogout, toggleSidebar }) {
  return (
    <header className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentView !== 'home' && (
          <button className="hamburger-btn-react" onClick={toggleSidebar}>
            ☰ Menu
          </button>
        )}
        <div className="brand-title" onClick={() => setCurrentView('home')}>
          <span>Smart Hive</span>
        </div>
      </div>

      {/* Middle Navigation Links (as shown in prompt image) */}
      <nav className="header-nav-links">
        <span 
          className={`nav-link ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          Home
        </span>
        <span 
          className="nav-link"
          onClick={() => { setCurrentView('home'); setTimeout(() => { document.getElementById('hives')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
        >
          Hives & Apiaries
        </span>
        <span 
          className="nav-link"
          onClick={() => { setCurrentView('home'); setTimeout(() => { document.getElementById('traceability')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
        >
          Traceability
        </span>
        <span 
          className="nav-link"
          onClick={() => { setCurrentView('home'); setTimeout(() => { document.getElementById('compliance')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
        >
          Compliance
        </span>
        <span 
          className="nav-link"
          onClick={() => { setCurrentView('home'); setTimeout(() => { document.getElementById('resources')?.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
        >
          Resources
        </span>
        <span className="nav-link" onClick={() => setCurrentView('home')}>
          Analytics
        </span>
        <span className="nav-link" onClick={() => setCurrentView('contact')}>
          Help Center
        </span>
      </nav>

      {/* Right side Profile & Logout buttons (as shown in prompt image) */}
      <div className="header-right-btns">
        {currentUser ? (
          <>
            <button className="btn-profile-react" onClick={() => setCurrentView(getRoleView(currentUser.role))}>
              <span>🖊 Profile ˅</span>
            </button>
            <button className="btn-logout-react" onClick={onLogout}>
              <span>➔ Log Out</span>
            </button>
          </>
        ) : (
          <>
            <button className="btn-profile-react" onClick={() => setCurrentView('login')}>
              <span>🖊 Profile ˅</span>
            </button>
            <button className="btn-logout-react" onClick={() => setCurrentView('login')}>
              <span>🔑 Sign In</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function getRoleView(role) {
  if (role === 'Beekeeper') return 'beekeeper';
  if (role === 'Laboratory') return 'tester';
  if (role === 'Retailer') return 'retailer';
  if (role === 'End Consumer') return 'consumer';
  return 'login';
}
