import React from 'react';

export default function SidebarDrawer({ isOpen, onClose, currentView, setCurrentView, currentUser, onSelectRole }) {
  const role = currentUser?.role || null;

  const scrollToElement = (id) => {
    onClose();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulse');
      setTimeout(() => el.classList.remove('highlight-pulse'), 1500);
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🐝 Smart Hive Portal</h3>
          <button className="sidebar-close-btn" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {currentView === 'login' || (!role && currentView === 'home') ? (
            <>
              <div className="role-menu-header" style={{ fontSize: '1.2rem', marginBottom: '12px' }}>
                🔑 Role Workspaces Overview
              </div>

              {/* Beekeeper Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">🐝 Beekeeper</div>
                <ul className="role-task-list">
                  <li onClick={() => { onClose(); onSelectRole('beekeeper1'); }}>Enters IOT sensor details</li>
                  <li onClick={() => { onClose(); onSelectRole('beekeeper1'); }}>Enters Audio files</li>
                  <li onClick={() => { onClose(); onSelectRole('beekeeper1'); }}>Uploads images</li>
                  <li onClick={() => { onClose(); onSelectRole('beekeeper1'); }}>Enters harvest logs (Crop details & harvest start date)</li>
                  <li onClick={() => { onClose(); onSelectRole('beekeeper1'); }}>Registers honey Batches</li>
                  <li onClick={() => { onClose(); onSelectRole('beekeeper1'); }}>Generates the QR code</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />

              {/* Laboratory Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">🧪 Laboratory</div>
                <ul className="role-task-list">
                  <li onClick={() => { onClose(); onSelectRole('lab1'); }}>Tests & uploads the product results</li>
                  <li onClick={() => { onClose(); onSelectRole('lab1'); }}>Provide feedback to beekeeper on quality issues</li>
                  <li onClick={() => { onClose(); onSelectRole('lab1'); }}>Maintain test records</li>
                  <li onClick={() => { onClose(); onSelectRole('lab1'); }}>Scans the QR & check</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />

              {/* Retailer Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">🏪 Retailer</div>
                <ul className="role-task-list">
                  <li onClick={() => { onClose(); onSelectRole('retailer1'); }}>Verifies batch records</li>
                  <li onClick={() => { onClose(); onSelectRole('retailer1'); }}>Maintains all logs (about the product batch & QR)</li>
                  <li onClick={() => { onClose(); onSelectRole('retailer1'); }}>Scans the QR & checks</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />

              {/* End Consumer Section */}
              <div className="role-menu-section">
                <div className="role-menu-header">👥 End consumer</div>
                <ul className="role-task-list">
                  <li onClick={() => { onClose(); onSelectRole('consumer1'); }}>Scan the QR code & verifies it's purity</li>
                  <li onClick={() => { onClose(); onSelectRole('consumer1'); }}>Reads beekeeper profile</li>
                  <li onClick={() => { onClose(); onSelectRole('consumer1'); }}>Provide rating</li>
                  <li onClick={() => { onClose(); onSelectRole('consumer1'); }}>Reports (any) concerns</li>
                </ul>
              </div>

              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
            </>
          ) : currentView === 'beekeeper' || role === 'Beekeeper' ? (
            <>
              <div className="role-menu-header">🐝 Beekeeper Workspace</div>
              <ul className="role-task-list">
                <li onClick={() => scrollToElement('bk-temp')}>📡 Enters IOT sensor details</li>
                <li onClick={() => scrollToElement('bk-audio-filename')}>🎵 Enters Audio files</li>
                <li onClick={() => scrollToElement('bk-image-file')}>📷 Uploads images</li>
                <li onClick={() => scrollToElement('bk-crop-name')}>🌾 Enters harvest logs (Crop details & harvest start date)</li>
                <li onClick={() => scrollToElement('form-beekeeper')}>🍯 Registers honey Batches</li>
                <li onClick={() => scrollToElement('bk-qr-box')}>📱 Generates the QR code</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Select / Switch Role
              </button>
            </>
          ) : currentView === 'tester' || role === 'Laboratory' ? (
            <>
              <div className="role-menu-header">🧪 Laboratory Workspace</div>
              <ul className="role-task-list">
                <li onClick={() => scrollToElement('form-lab-test')}>📊 Tests & uploads the product results</li>
                <li onClick={() => scrollToElement('lab-feedback')}>💬 Provide feedback to beekeeper on quality issues</li>
                <li onClick={() => scrollToElement('lab-records-list')}>📜 Maintain test records</li>
                <li onClick={() => scrollToElement('lab-batch-cards-container')}>📱 Scans the QR & check</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Select / Switch Role
              </button>
            </>
          ) : currentView === 'retailer' || role === 'Retailer' ? (
            <>
              <div className="role-menu-header">🏪 Retailer Workspace</div>
              <ul className="role-task-list">
                <li onClick={() => scrollToElement('form-retailer-verify')}>✅ Verifies batch records</li>
                <li onClick={() => scrollToElement('retailer-logs-list')}>📋 Maintains all logs (about the product batch & QR)</li>
                <li onClick={() => scrollToElement('retailer-batch-cards-container')}>📱 Scans the QR & checks</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Select / Switch Role
              </button>
            </>
          ) : (
            <>
              <div className="role-menu-header">👥 End Consumer Workspace</div>
              <ul className="role-task-list">
                <li onClick={() => scrollToElement('consumer-batch-cards-container')}>🔍 Scan the QR code & verifies it's purity</li>
                <li onClick={() => scrollToElement('c-profile-box')}>👨‍🌾 Reads beekeeper profile</li>
                <li onClick={() => scrollToElement('btn-goto-feedback')}>⭐ Provide rating</li>
                <li onClick={() => scrollToElement('btn-goto-contact')}>⚠️ Reports (any) concerns</li>
              </ul>
              <hr className="sidebar-divider" />
              <button className="btn-white" style={{ width: '100%', marginBottom: '8px' }} onClick={() => { onClose(); setCurrentView('home'); }}>
                🏠 Home Landing
              </button>
              <button className="btn-yellow" style={{ width: '100%' }} onClick={() => { onClose(); setCurrentView('login'); }}>
                🔑 Select / Switch Role
              </button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
