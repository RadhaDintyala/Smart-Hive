import React from 'react';

export default function SidebarDrawer({ isOpen, onClose, currentView, setCurrentView, currentUser, onSelectRole }) {
  const role = currentUser?.role || null;

  const navigateToAndScroll = (targetView, elementId) => {
    onClose();
    if (currentView !== targetView) {
      setCurrentView(targetView);
      window.history.pushState({}, '', `/${targetView}`);
    }
    setTimeout(() => {
      const el = document.getElementById(elementId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-pulse');
        setTimeout(() => el.classList.remove('highlight-pulse'), 1500);
      }
    }, 150);
  };

  const handleRoleSelection = (roleId) => {
    onClose();
    if (onSelectRole) onSelectRole(roleId);
    setCurrentView('login');
    window.history.pushState({}, '', '/login');
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🐝 Smart Hive Portal Navigation</h3>
          <button className="sidebar-close-btn" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {currentView === 'login' || (!role && currentView === 'home') ? (
            <>
              <div className="role-menu-header" style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#0f172a' }}>
                🔑 Staff Workspaces (Login Required)
              </div>

              {/* Beekeeper Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">🐝 Beekeeper Workspace</div>
                <ul className="role-task-list">
                  <li onClick={() => handleRoleSelection('beekeeper1')}>📡 IoT Sensor & Microclimate Telemetry</li>
                  <li onClick={() => handleRoleSelection('beekeeper1')}>🎵 Audio Frequency Spectrograms</li>
                  <li onClick={() => handleRoleSelection('beekeeper1')}>📷 Frame Photo Geotag Uploads</li>
                  <li onClick={() => handleRoleSelection('beekeeper1')}>🌾 Harvest Logs & Yield Spec</li>
                  <li onClick={() => handleRoleSelection('beekeeper1')}>🍯 Batch Registration & QR Minting</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />

              {/* Laboratory Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">🧪 Laboratory Workspace</div>
                <ul className="role-task-list">
                  <li onClick={() => handleRoleSelection('lab1')}>📊 NABL Purity Testing & Chemical Analysis</li>
                  <li onClick={() => handleRoleSelection('lab1')}>💬 Provide Feedback to Beekeeper</li>
                  <li onClick={() => handleRoleSelection('lab1')}>📜 Maintain Digital Quality Records</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />

              {/* Retailer Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">🏪 Retailer Workspace</div>
                <ul className="role-task-list">
                  <li onClick={() => handleRoleSelection('retailer1')}>✅ Verify Batch Authenticity</li>
                  <li onClick={() => handleRoleSelection('retailer1')}>📋 Log Store Stock Receipts</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />

              {/* End Consumer Section (Public - No Login) */}
              <div className="role-menu-section">
                <div className="role-menu-header">👥 Public Consumer Verification</div>
                <ul className="role-task-list">
                  <li onClick={() => navigateToAndScroll('consumer', 'consumer-batch-lookup-container')}>🔍 Scan QR & Verify Purity</li>
                  <li onClick={() => navigateToAndScroll('consumer', 'c-profile-box')}>👨‍🌾 Read Beekeeper Apiary Profile</li>
                  <li onClick={() => navigateToAndScroll('consumer', 'btn-goto-feedback')}>⭐ Provide Product Rating</li>
                  <li onClick={() => navigateToAndScroll('consumer', 'btn-goto-contact')}>⚠️ Report Quality Concern</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
            </>
          ) : currentView === 'beekeeper' || role === 'Beekeeper' ? (
            <>
              <div className="role-menu-header">🐝 Beekeeper Navigation</div>
              <ul className="role-task-list">
                <li onClick={() => navigateToAndScroll('beekeeper', 'register-batch-card')}>📡 Enters IoT Sensor Details</li>
                <li onClick={() => navigateToAndScroll('beekeeper', 'register-batch-card')}>🎵 Enters Audio Spectrograms</li>
                <li onClick={() => navigateToAndScroll('beekeeper', 'register-batch-card')}>📷 Comb Photo Geotag Upload</li>
                <li onClick={() => navigateToAndScroll('beekeeper', 'register-batch-card')}>🌾 Harvest Logs & Yield Spec</li>
                <li onClick={() => navigateToAndScroll('beekeeper', 'register-batch-card')}>🍯 Register Honey Batch</li>
                <li onClick={() => navigateToAndScroll('beekeeper', 'bk-batches-list')}>📱 View Registered Batches & QR</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Switch Account
              </button>
            </>
          ) : currentView === 'tester' || role === 'Laboratory' ? (
            <>
              <div className="role-menu-header">🧪 Laboratory Navigation</div>
              <ul className="role-task-list">
                <li onClick={() => navigateToAndScroll('tester', 'form-lab-test')}>📊 Enter Quality Test Results</li>
                <li onClick={() => navigateToAndScroll('tester', 'lab-feedback')}>💬 Provide Quality Feedback</li>
                <li onClick={() => navigateToAndScroll('tester', 'lab-records-list')}>📜 View Test Records</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Switch Account
              </button>
            </>
          ) : currentView === 'retailer' || role === 'Retailer' ? (
            <>
              <div className="role-menu-header">🏪 Retailer Navigation</div>
              <ul className="role-task-list">
                <li onClick={() => navigateToAndScroll('retailer', 'form-retailer-verify')}>✅ Log Store Stock Receipt</li>
                <li onClick={() => navigateToAndScroll('retailer', 'retailer-logs-list')}>📋 Store Inventory Audit Logs</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Switch Account
              </button>
            </>
          ) : (
            <>
              <div className="role-menu-header">👥 Public Verification Navigation</div>
              <ul className="role-task-list">
                <li onClick={() => navigateToAndScroll('consumer', 'consumer-batch-lookup-container')}>🔍 Verify QR & Ledger Hash</li>
                <li onClick={() => navigateToAndScroll('consumer', 'c-profile-box')}>👨‍🌾 Beekeeper Apiary Profile</li>
                <li onClick={() => navigateToAndScroll('consumer', 'btn-goto-feedback')}>⭐ Submit Consumer Rating</li>
                <li onClick={() => navigateToAndScroll('consumer', 'btn-goto-contact')}>⚠️ Report Quality Concern</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Staff Login
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
