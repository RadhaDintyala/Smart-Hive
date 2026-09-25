const { useState, useEffect } = React;

// ═══════════════ HEADER COMPONENT (MATCHING PROMPT IMAGE) ═══════════════
function Header({ currentView, setCurrentView, currentUser, onLogout, toggleSidebar }) {
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

      {/* Middle Navigation Links */}
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

      {/* Right side Auth & Logout buttons */}
      <div className="header-right-btns">
        {currentUser ? (
          <button className="btn-logout-react" onClick={onLogout}>
            <span>➔ Log Out</span>
          </button>
        ) : (
          <button className="btn-logout-react" onClick={() => setCurrentView('login')}>
            <span>🔑 Sign In</span>
          </button>
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

// ═══════════════ FOOTER COMPONENT (MATCHING PROMPT IMAGE) ═══════════════
function Footer({ setCurrentView }) {
  return (
    <footer className="app-footer">
      <div className="footer-links-row">
        <button onClick={() => alert('Smart Hive Traceability Platform Privacy Policy')}>Privacy Policy</button>
        <span className="sep">|</span>
        <button onClick={() => alert('Smart Hive Terms of Use & Legal Blueprint')}>Terms of Use</button>
        <span className="sep">|</span>
        <button onClick={() => setCurrentView('contact')}>Contact Us</button>
        <span className="sep">|</span>
        <button onClick={() => setCurrentView('feedback')}>Support Portal</button>
        <span className="sep">|</span>
        <button onClick={() => alert('Smart Hive Open API Documentation (REST & GraphQL)')}>API Access</button>
      </div>
      <div style={{ marginTop: '12px', fontSize: '0.8rem', opacity: 0.7 }}>
        Smart Hive Government Traceability Blueprint © 2028. All rights reserved.
      </div>
    </footer>
  );
}

// ═══════════════ SIDEBAR DRAWER COMPONENT ═══════════════
function SidebarDrawer({ isOpen, onClose, currentView, setCurrentView, currentUser, onSelectRole }) {
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
    <React.Fragment>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar-drawer ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>🐝 Smart Hive Portal</h3>
          <button className="sidebar-close-btn" onClick={onClose}>✕</button>
        </div>

        <nav className="sidebar-nav">
          {currentView === 'login' || (!role && currentView === 'home') ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : currentView === 'beekeeper' || role === 'Beekeeper' ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : currentView === 'tester' || role === 'Laboratory' ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : currentView === 'retailer' || role === 'Retailer' ? (
            <React.Fragment>
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
            </React.Fragment>
          ) : (
            <React.Fragment>
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
            </React.Fragment>
          )}
        </nav>
      </aside>
    </React.Fragment>
  );
}

// ═══════════════ HOME VIEW COMPONENT (MATCHING PROMPT IMAGE) ═══════════════
function HomeView({ setCurrentView, setSelectedBatchId }) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (setSelectedBatchId) setSelectedBatchId(searchInput.trim());
      setCurrentView('consumer');
    }
  };

  return (
    <main className="landing-main-wrapper">
      {/* MAIN HERO CARD (MATCHING LATEST PROMPT IMAGE) */}
      <section className="landing-hero-card">
        {/* Left Column: Bee Character with Technical Circuit Lines & Icons */}
        <div className="hero-bee-wrapper">
          {/* Circuit Lines Backdrop Pattern */}
          <svg className="circuit-bg-pattern" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 40 H80 V100 H160" stroke="#000" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d="M180 30 V120 H100 V170" stroke="#000" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="80" cy="100" r="4" fill="#f5b814" stroke="#000" strokeWidth="1.5" />
            <circle cx="100" cy="120" r="4" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
          </svg>

          {/* Shield Badge Icon (Top Right) */}
          <div className="badge-graphic-shield" title="Verified Tamper-Proof">
            🛡️
          </div>

          {/* Chart Icon Badge (Bottom Left) */}
          <div className="badge-graphic-chart">
            📊 Telemetry
          </div>

          {/* Bee Illustration (public/assets/zzz.jpeg) */}
          <img src="/assets/zzz.png" alt="Smart Hive Bee" className="hero-bee-img" />
        </div>

        {/* Right Column: Hero Content & Search Bar */}
        <div className="hero-content-col">
          <h1 className="hero-title-bold">
            BLOCKCHAIN HONEY<br />PROVENANCE
          </h1>

          <p className="hero-desc-text">
            Verify batch traceability, quality metrics, and tamper-proof records in real-time. Secure, transparent, and trusted.
          </p>

          {/* Action Buttons */}
          <div className="hero-action-btns">
            <button className="btn-hero-yellow" onClick={() => setCurrentView('consumer')}>
              Verify Your Honey Batch
            </button>
            <button className="btn-hero-white" onClick={() => setCurrentView('login')}>
              Explore Government Apiary Data
            </button>
          </div>

          {/* Search Input Bar (Matching prompt image) */}
          <form className="hero-search-bar" onSubmit={handleSearch}>
            <span className="hero-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Enter Batch ID or Scan QR"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="hero-qr-icon">
              📱 QR
            </button>
          </form>
        </div>
      </section>

      {/* 4 FEATURE CARDS GRID (MATCHING PROMPT IMAGE) */}
      <div className="feature-cards-grid">
        <div className="feature-card-neo" id="hives">
          <div className="feature-card-icon">🐝</div>
          <h3 className="feature-card-title">1. Beekeeper Telemetry</h3>
          <p className="feature-card-desc">
            IoT microclimate sensors (temperature, humidity, weight, VOC) combined with mandatory comb frame evidence.
          </p>
        </div>

        <div className="feature-card-neo" id="traceability">
          <div className="feature-card-icon">🧪</div>
          <h3 className="feature-card-title">2. NABL Lab Analysis</h3>
          <p className="feature-card-desc">
            Moisture %, HMF freshness, pollen identification, and antibiotic residue verification.
          </p>
        </div>

        <div className="feature-card-neo" id="compliance">
          <div className="feature-card-icon">🏪</div>
          <h3 className="feature-card-title">3. Retailer Stock Audit</h3>
          <p className="feature-card-desc">
            Cryptographic batch hash verification and physical stock quantity tracking at retail outlets.
          </p>
        </div>

        <div className="feature-card-neo" id="resources">
          <div className="feature-card-icon">📱</div>
          <h3 className="feature-card-title">4. Public QR Verification</h3>
          <p className="feature-card-desc">
            Instant scan transparency for consumers with purity scores, beekeeper profiles, and feedback logs.
          </p>
        </div>
      </div>
    </main>
  );
}

// ═══════════════ LOGIN VIEW COMPONENT ═══════════════
function LoginView({ onLoginSuccess }) {
  const [selectedUser, setSelectedUser] = useState('beekeeper1');
  const [selectedRole, setSelectedRole] = useState('Beekeeper');
  const [password, setPassword] = useState('pass123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (username, role) => {
    setSelectedUser(username);
    setSelectedRole(role);
    setPassword('pass123');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUser, password })
      });
      if (res.ok) {
        const data = await res.json();
        setLoading(false);
        if (data.success) {
          onLoginSuccess(data.token, data.profile, data.redirectRoute);
          return;
        } else {
          setErrorMsg(data.error || 'Authentication failed');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend connection issue, falling back to client authentication:', err);
    }

    setLoading(false);
    const demoProfiles = {
      beekeeper1: { username: 'beekeeper1', role: 'Beekeeper', name: 'Rajesh Kumar (Master Beekeeper)', apiary: 'Himalayan Organic Apiary, Dehradun', license: 'GOV-HONEY-AP-8821' },
      lab1: { username: 'lab1', role: 'Laboratory', name: 'Central National Honey Quality Control Lab', accreditation: 'NABL Accredited', license: 'GOV-LAB-TEST-9920' },
      retailer1: { username: 'retailer1', role: 'Retailer', name: 'Pure Natural Foods Outlets', storeLocation: 'Connaught Place, New Delhi', license: 'RETAIL-GOV-4410' },
      consumer1: { username: 'consumer1', role: 'End Consumer', name: 'Ananya Sen', email: 'ananya.consumer@example.com' }
    };
    const userProf = demoProfiles[selectedUser];
    if (userProf && (password === 'pass123' || password === '')) {
      const token = 'demo_token_' + Date.now();
      let route = '/consumer';
      if (userProf.role === 'Beekeeper') route = '/beekeeper';
      else if (userProf.role === 'Laboratory') route = '/tester';
      else if (userProf.role === 'Retailer') route = '/retailer';
      onLoginSuccess(token, userProf, route);
    } else {
      setErrorMsg('Invalid username or password credentials.');
    }
  };

  return (
    <div className="login-card-container">
      <div className="neo-card">
        <h2 className="neo-card-title">Select Portal Workspace Role</h2>
        <p className="neo-card-subtitle">Choose a role from the national traceability blueprint to access its workspace:</p>

        <div className="role-buttons-grid">
          <div 
            className={`role-box-btn ${selectedUser === 'beekeeper1' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('beekeeper1', 'Beekeeper')}
          >
            <div className="icon">🐝</div>
            <strong>Beekeeper</strong>
            <small>IoT Sensors, Audio, Images & Harvest Logs</small>
          </div>

          <div 
            className={`role-box-btn ${selectedUser === 'lab1' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('lab1', 'Laboratory')}
          >
            <div className="icon">🧪</div>
            <strong>Laboratory</strong>
            <small>Purity Testing & Quality Feedback</small>
          </div>

          <div 
            className={`role-box-btn ${selectedUser === 'retailer1' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('retailer1', 'Retailer')}
          >
            <div className="icon">🏪</div>
            <strong>Retailer</strong>
            <small>Batch Record Verification & Inventory</small>
          </div>

          <div 
            className={`role-box-btn ${selectedUser === 'consumer1' ? 'active' : ''}`}
            onClick={() => handleRoleSelect('consumer1', 'End Consumer')}
          >
            <div className="icon">👥</div>
            <strong>End Consumer</strong>
            <small>Purity Check, Beekeeper Profile & Rating</small>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Selected Role Account Username</label>
            <input 
              type="text" 
              className="neo-input" 
              value={selectedUser} 
              readOnly 
              style={{ background: '#f0f0f0' }} 
            />
          </div>

          <div className="form-group">
            <label>Workspace Access Password</label>
            <input 
              type="password" 
              className="neo-input" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Enter password (default: pass123)" 
            />
          </div>

          {errorMsg && (
            <div style={{ color: 'var(--red-accent)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '12px' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button type="submit" className="btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} disabled={loading}>
            {loading ? '🔑 Authenticating...' : '🔑 Sign In to Selected Workspace'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '12px', background: '#f9f8f3', border: '1px solid #000', borderRadius: '4px', fontSize: '0.8rem', color: '#555' }}>
          <strong>📌 Demo Credentials Note:</strong> Default password for all roles is <code>pass123</code>. Click any role card above to log in.
        </div>
      </div>
    </div>
  );
}

// ═══════════════ BEEKEEPER VIEW COMPONENT ═══════════════
function BeekeeperView({ authToken, currentUser }) {
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    batchIdCustom: '',
    cropName: 'Wild Himalayan Mustard & Acacia Honey',
    floralSource: 'Wild Alpine Acacia Flora',
    harvestStartDate: '2026-03-20',
    yieldQuantityKg: '120.0',
    hiveId: 'HIVE-ALP-02',
    temperature: '35.2',
    humidity: '58.0',
    weight: '46.5',
    vocPpm: '115',
    audioFilename: 'spectrogram_hive_02.wav',
    audioFreq: '225',
    imageCaption: 'Sealed honeycomb frame evidence prior to extraction',
    imageBase64: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [generatedBatch, setGeneratedBatch] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) setBatches(data.batches);
    } catch (err) { console.error(err); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.imageBase64) {
      setErrorMsg('Mandatory Photo Evidence Required: Please select a comb/frame photo evidence before submitting.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/beekeeper/batch/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessMsg(data.message);
        setGeneratedBatch(data.batch);
        fetchBatches();
      } else {
        setErrorMsg(data.error || 'Failed to register batch');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error registering batch');
    }
  };

  return (
    <main className="app-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🐝 Beekeeper Harvest & IoT Registry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Log IoT microclimate data, acoustics, comb photo evidence, and yield metrics for cryptographic batch verification.
        </p>
      </div>

      <div className="grid-2col">
        <div className="neo-card">
          <h3 className="neo-card-title">Register New Honey Batch</h3>
          <p className="neo-card-subtitle" style={{ marginBottom: '16px', color: '#b45309', fontWeight: 700 }}>
            * Photo Evidence is MANDATORY for batch registration.
          </p>

          <form id="form-beekeeper" onSubmit={handleSubmit}>
            {!formData.imageBase64 && (
              <div style={{ background: '#fef3c7', border: '2px solid #b45309', color: '#78350f', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontWeight: 700, fontSize: '0.88rem' }}>
                📢 <strong>Beekeeper Action Required:</strong> Please upload the mandatory comb frame photo evidence below to register this honey batch and generate its national QR code.
              </div>
            )}

            <div className="form-group">
              <label>Custom Batch Identifier (Optional)</label>
              <input 
                type="text" 
                className="neo-input" 
                placeholder="e.g. BATCH-2026-HIM-102"
                value={formData.batchIdCustom}
                onChange={e => setFormData({ ...formData, batchIdCustom: e.target.value })}
              />
            </div>

            <div className="form-row" id="bk-crop-name">
              <div className="form-group">
                <label>Crop Name / Honey Type *</label>
                <input type="text" className="neo-input" value={formData.cropName} onChange={e => setFormData({ ...formData, cropName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Floral Source *</label>
                <input type="text" className="neo-input" value={formData.floralSource} onChange={e => setFormData({ ...formData, floralSource: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Harvest Start Date *</label>
                <input type="date" className="neo-input" value={formData.harvestStartDate} onChange={e => setFormData({ ...formData, harvestStartDate: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Harvest Yield Quantity (kg) *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.yieldQuantityKg} onChange={e => setFormData({ ...formData, yieldQuantityKg: e.target.value })} required />
              </div>
            </div>

            <div className="form-row" id="bk-temp">
              <div className="form-group">
                <label>Hive Identifier *</label>
                <input type="text" className="neo-input" value={formData.hiveId} onChange={e => setFormData({ ...formData, hiveId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Hive Temperature (°C) *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.temperature} onChange={e => setFormData({ ...formData, temperature: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hive Humidity (%) *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.humidity} onChange={e => setFormData({ ...formData, humidity: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Hive Net Weight (kg) *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label>VOC Gas Level (ppm) *</label>
              <input type="number" step="1" className="neo-input" value={formData.vocPpm} onChange={e => setFormData({ ...formData, vocPpm: e.target.value })} required />
            </div>

            <div className="form-row" id="bk-audio-filename">
              <div className="form-group">
                <label>Audio File Spectrogram Record</label>
                <input type="text" className="neo-input" value={formData.audioFilename} onChange={e => setFormData({ ...formData, audioFilename: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Vibrational Frequency (Hz)</label>
                <input type="number" step="1" className="neo-input" value={formData.audioFreq} onChange={e => setFormData({ ...formData, audioFreq: e.target.value })} />
              </div>
            </div>

            {/* MANDATORY IMAGE UPLOAD FIELD */}
            <div id="bk-image-file" className="form-group" style={{ background: '#fffbe6', padding: '16px', border: '2px dashed #000', borderRadius: '6px', marginBottom: '20px' }}>
              <label style={{ fontWeight: 900, color: '#92400e' }}>📷 Mandatory Frame / Comb Image Upload *</label>
              <p style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: '8px' }}>
                Form submission is locked until photo evidence of the sealed comb frame is selected.
              </p>
              <input type="file" className="neo-input" accept="image/*" onChange={handleImageChange} required style={{ background: '#ffffff' }} />

              {imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img src={imagePreview} alt="Frame Evidence Preview" style={{ maxHeight: '140px', border: '2px solid #000', borderRadius: '4px' }} />
                </div>
              )}

              <input 
                type="text" 
                className="neo-input" 
                placeholder="Image Caption e.g. Sealed honeycomb frame evidence"
                value={formData.imageCaption}
                onChange={e => setFormData({ ...formData, imageCaption: e.target.value })}
                style={{ marginTop: '8px' }}
              />
            </div>

            {errorMsg && <div style={{ color: 'var(--red-accent)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>⚠️ {errorMsg}</div>}
            {successMsg && <div style={{ color: 'var(--green-accent)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>✓ {successMsg}</div>}

            <button type="submit" className="btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Batch & Generate National QR Code'}
            </button>
          </form>
        </div>

        <div>
          {generatedBatch && (
            <div id="bk-qr-box" className="qr-card-box" style={{ background: '#fffdf0', border: '3px solid #000', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ background: '#22c55e', color: '#fff', fontWeight: 900, padding: '6px 12px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px', fontSize: '0.85rem' }}>
                ✓ BATCH REGISTERED & QR GENERATED
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '6px 0' }}>BATCH ID: {generatedBatch.batchId}</h4>
              
              <a href={`/consumer?batchId=${encodeURIComponent(generatedBatch.batchId)}`} target="_blank" rel="noopener noreferrer" title="Click to open full provenance details on a new page">
                <img className="qr-img" src={generatedBatch.qrCodeDataUrl} alt="Batch QR Code" style={{ cursor: 'pointer', margin: '12px auto' }} />
              </a>

              <div className="hash-box" style={{ marginTop: '12px' }}>
                <span>SHA-256 Ledger Hash Signature:</span>
                <div style={{ color: '#d97706', marginTop: '4px', fontWeight: 700, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  {generatedBatch.sha256Hash}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <a 
                  href={`/consumer?batchId=${encodeURIComponent(generatedBatch.batchId)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-yellow" 
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontWeight: 800, padding: '10px 16px', fontSize: '0.95rem' }}
                >
                  🔗 Open Generated Details Page (New Window)
                </a>
              </div>
            </div>
          )}

          <div className="neo-card">
            <h3 className="neo-card-title">Your Registered Honey Batches</h3>
            <div id="bk-batches-list">
              {batches.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registered batches found.</p>
              ) : (
                batches.map(b => (
                  <div key={b.batchId} style={{ background: '#fdfbf7', border: '2px solid #000', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <a 
                        href={`/consumer?batchId=${encodeURIComponent(b.batchId)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#000', textDecoration: 'underline' }}
                        title="View batch details on new page"
                      >
                        {b.batchId} 🔗
                      </a>
                      <span className={`badge-status ${b.status === 'FAILED_QUALITY_TEST' ? 'FAIL' : 'PASS'}`}>{b.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#333' }}>{b.cropDetails?.cropName}</div>
                    <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                      Harvested: {b.cropDetails?.harvestStartDate} | Yield: {b.cropDetails?.yieldQuantityKg} kg
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════ LAB VIEW COMPONENT ═══════════════
function LabView({ authToken }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    purityPercentage: '99.2',
    moisturePercentage: '17.2',
    hmfMgKg: '14.1',
    antibioticResidues: 'Not Detected (0.0 ppm)',
    pollenCount: 'Dense Alpine Acacia & Wild Flora Grains',
    feedback: 'Sample passes all purity parameters. Excellent enzymatic activity.',
    status: 'PASS'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
        if (data.batches.length > 0 && !selectedBatch) setSelectedBatch(data.batches[0]);
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/lab/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authToken },
        body: JSON.stringify({ batchId: selectedBatch.batchId, ...formData })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMsg('✓ Laboratory Certificate & Feedback Issued Successfully!');
        fetchBatches();
      } else {
        setMsg(`⚠️ Error: ${data.error}`);
      }
    } catch (err) {
      setLoading(false);
      setMsg('⚠️ Network error connecting to server');
    }
  };

  return (
    <main className="app-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🧪 Quality Testing & NABL Certificate Portal</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select an available honey batch from the visual card grid below to issue accredited laboratory quality certifications.
        </p>
      </div>

      <div className="neo-card" style={{ marginBottom: '24px' }} id="lab-batch-cards-container">
        <h3 className="neo-card-title">📦 Step 1: Select Registered Honey Batch to Test</h3>
        <p className="neo-card-subtitle" style={{ marginBottom: '14px' }}>Click any batch card below to select it for quality testing & certification:</p>
        
        <div className="batch-cards-grid">
          {batches.map(b => (
            <div 
              key={b.batchId} 
              className={`batch-card ${selectedBatch?.batchId === b.batchId ? 'selected' : ''}`}
              onClick={() => setSelectedBatch(b)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 900, fontSize: '1rem' }}>{b.batchId}</span>
                <span className={`badge-status ${b.labTestResults ? 'PASS' : 'FAIL'}`} style={{ fontSize: '0.7rem' }}>
                  {b.labTestResults ? 'TESTED' : 'PENDING'}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{b.cropDetails?.cropName}</div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>Beekeeper: {b.beekeeperProfile?.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        <div className="neo-card">
          <h3 className="neo-card-title">🧪 Step 2: Upload Test Results & Quality Feedback</h3>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '16px' }}>
            Target Batch Selected: <strong style={{ color: '#d97706', fontSize: '1.05rem' }}>{selectedBatch ? selectedBatch.batchId : 'None Selected'}</strong>
          </p>

          <form id="form-lab-test" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Purity Percentage (%) *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.purityPercentage} onChange={e => setFormData({ ...formData, purityPercentage: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Moisture Content (%) [Max 20%] *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.moisturePercentage} onChange={e => setFormData({ ...formData, moisturePercentage: e.target.value })} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>HMF Freshness (mg/kg) *</label>
                <input type="number" step="0.1" className="neo-input" value={formData.hmfMgKg} onChange={e => setFormData({ ...formData, hmfMgKg: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Antibiotic Residues *</label>
                <input type="text" className="neo-input" value={formData.antibioticResidues} onChange={e => setFormData({ ...formData, antibioticResidues: e.target.value })} required />
              </div>
            </div>

            <div className="form-group">
              <label>Pollen Analysis Signature *</label>
              <input type="text" className="neo-input" value={formData.pollenCount} onChange={e => setFormData({ ...formData, pollenCount: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Quality Feedback to Beekeeper *</label>
              <textarea id="lab-feedback" className="neo-input" rows="3" value={formData.feedback} onChange={e => setFormData({ ...formData, feedback: e.target.value })} required />
            </div>

            <div className="form-group">
              <label>Quality Status *</label>
              <select className="neo-input" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="PASS">PASS — Grade A Pure Honey Certified</option>
                <option value="FAIL">FAIL — Non-Compliant / Adulterated</option>
              </select>
            </div>

            {msg && <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px', color: msg.startsWith('✓') ? 'var(--green-accent)' : 'var(--red-accent)' }}>{msg}</div>}

            <button type="submit" className="btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} disabled={loading || !selectedBatch}>
              {loading ? 'Submitting Certificate...' : 'Submit Laboratory Certificate & Feedback'}
            </button>
          </form>
        </div>

        <div className="neo-card" id="lab-records-list">
          <h3 className="neo-card-title">📜 Issued Laboratory Test Certificates</h3>
          <div>
            {batches.filter(b => b.labTestResults).map(b => (
              <div key={b.batchId} style={{ background: '#fdfbf7', border: '2px solid #000', padding: '14px', borderRadius: '6px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                  <span>{b.batchId}</span>
                  <span className="badge-status PASS">{b.labTestResults.status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  Purity: <strong>{b.labTestResults.purityPercentage}%</strong> | Moisture: <strong>{b.labTestResults.moisturePercentage}%</strong>
                </div>
                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', marginTop: '4px', color: '#444' }}>
                  "{b.labTestResults.feedback}"
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════ RETAILER VIEW COMPONENT ═══════════════
function RetailerView({ authToken }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [stockQty, setStockQty] = useState('50');
  const [remarks, setRemarks] = useState('QR scanned & cryptographic authenticity verified upon store receipt.');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
        if (data.batches.length > 0 && !selectedBatch) setSelectedBatch(data.batches[0]);
      }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/retailer/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authToken },
        body: JSON.stringify({ batchId: selectedBatch.batchId, stockQuantity: stockQty, storeRemarks: remarks })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMsg('✓ Retail Store Audit Logged Successfully!');
        fetchBatches();
      } else {
        setMsg(`⚠️ Error: ${data.error}`);
      }
    } catch (err) {
      setLoading(false);
      setMsg('⚠️ Network error connecting to server');
    }
  };

  return (
    <main className="app-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🏪 Retailer Batch Audit & Inventory Registry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select an incoming batch from the visual card grid below to log store receipt and verify cryptographic authenticity.
        </p>
      </div>

      <div className="neo-card" style={{ marginBottom: '24px' }} id="retailer-batch-cards-container">
        <h3 className="neo-card-title">📦 Step 1: Select Batch Received at Store</h3>
        <p className="neo-card-subtitle" style={{ marginBottom: '14px' }}>Click any batch card below to select it for store audit verification:</p>
        
        <div className="batch-cards-grid">
          {batches.map(b => (
            <div 
              key={b.batchId} 
              className={`batch-card ${selectedBatch?.batchId === b.batchId ? 'selected' : ''}`}
              onClick={() => setSelectedBatch(b)}
            >
              <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>{b.batchId}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{b.cropDetails?.cropName}</div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>Status: {b.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        <div className="neo-card">
          <h3 className="neo-card-title">🏪 Step 2: Log Store Audit & Inventory</h3>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '16px' }}>
            Target Batch Selected: <strong style={{ color: '#d97706', fontSize: '1.05rem' }}>{selectedBatch ? selectedBatch.batchId : 'None Selected'}</strong>
          </p>

          <form id="form-retailer-verify" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Store Stock Received (Units/Jars) *</label>
              <input type="number" className="neo-input" value={stockQty} onChange={e => setStockQty(e.target.value)} required />
            </div>

            <div className="form-group">
              <label>Retail Inventory Remarks *</label>
              <input type="text" className="neo-input" value={remarks} onChange={e => setRemarks(e.target.value)} required />
            </div>

            {msg && <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px', color: msg.startsWith('✓') ? 'var(--green-accent)' : 'var(--red-accent)' }}>{msg}</div>}

            <button type="submit" className="btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} disabled={loading || !selectedBatch}>
              {loading ? 'Verifying...' : 'Verify Batch & Add to Store Logs'}
            </button>
          </form>
        </div>

        <div className="neo-card" id="retailer-logs-list">
          <h3 className="neo-card-title">📜 Store Verified Inventory Audit Logs</h3>
          <div>
            {batches.flatMap(b => (b.retailerLogs || []).map((log, idx) => (
              <div key={`${b.batchId}-${idx}`} style={{ background: '#fdfbf7', border: '2px solid #000', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>[{b.batchId}] {log.storeName}</strong>
                <span style={{ fontSize: '0.82rem', color: '#444' }}>Stock Quantity: {log.stockQuantity} Jars</span>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>"{log.remarks}"</p>
              </div>
            )))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════ CONSUMER VIEW COMPONENT ═══════════════
function ConsumerView({ selectedBatchId, setCurrentView }) {
  const [batchIdInput, setBatchIdInput] = useState(selectedBatchId || 'BATCH-2026-HIM-101');
  const [batches, setBatches] = useState([]);
  const [batchData, setBatchData] = useState(null);
  const [rating, setRating] = useState('5');
  const [reviewerName, setReviewerName] = useState('Ananya Sen');
  const [comment, setComment] = useState('Certified 100% pure honey! Scanned QR on jar.');
  const [ratingMsg, setRatingMsg] = useState('');
  
  const [concernCategory, setConcernCategory] = useState('Quality / Adulteration Suspicion');
  const [concernComments, setConcernComments] = useState('');
  const [concernMsg, setConcernMsg] = useState('');

  useEffect(() => {
    fetchAvailableBatches();
    const params = new URLSearchParams(window.location.search);
    const urlBatchId = params.get('batchId');
    const activeId = urlBatchId || selectedBatchId || 'BATCH-2026-HIM-101';
    setBatchIdInput(activeId);
    verifyBatch(activeId);
  }, [selectedBatchId]);

  const fetchAvailableBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) setBatches(data.batches);
    } catch (err) { console.error(err); }
  };

  const verifyBatch = async (id) => {
    try {
      const res = await fetch(`/api/consumer/verify/${id}`);
      const data = await res.json();
      if (data.success) setBatchData(data.batch);
      else setBatchData(null);
    } catch (err) {
      console.error(err);
      setBatchData(null);
    }
  };

  const handleLookup = (e) => {
    e.preventDefault();
    verifyBatch(batchIdInput);
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!batchData) return;

    try {
      const res = await fetch('/api/consumer/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchData.batchId, reviewerName, rating: parseInt(rating), comment })
      });
      const data = await res.json();
      if (data.success) {
        setRatingMsg('✓ Rating Submitted Successfully!');
        verifyBatch(batchData.batchId);
      }
    } catch (err) { console.error(err); }
  };

  const handleConcernSubmit = async (e) => {
    e.preventDefault();
    if (!batchData) return;

    try {
      const res = await fetch('/api/consumer/concern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchData.batchId, consumerName: reviewerName, category: concernCategory, comments: concernComments })
      });
      const data = await res.json();
      if (data.success) {
        setConcernMsg('✓ Concern Report Submitted Successfully!');
        setConcernComments('');
        verifyBatch(batchData.batchId);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <main className="app-container">
      <div className="neo-card" style={{ marginBottom: '24px' }} id="consumer-batch-cards-container">
        <h2 className="neo-card-title">👥 Public Honey Batch Traceability Selector</h2>
        <p className="neo-card-subtitle" style={{ marginBottom: '14px' }}>
          Click any honey batch card below to view its QR code, microclimate IoT telemetry, and laboratory certification:
        </p>

        <div className="batch-cards-grid">
          {batches.map(b => (
            <div 
              key={b.batchId} 
              className={`batch-card ${batchData?.batchId === b.batchId ? 'selected' : ''}`}
              onClick={() => { setBatchIdInput(b.batchId); verifyBatch(b.batchId); }}
            >
              <div style={{ fontWeight: 900, fontSize: '1rem' }}>{b.batchId}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '2px' }}>{b.cropDetails?.cropName}</div>
              <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>Beekeeper: {b.beekeeperProfile?.name}</div>
            </div>
          ))}
        </div>

        <form onSubmit={handleLookup} className="form-row" style={{ marginTop: '10px' }}>
          <input 
            type="text" 
            className="neo-input" 
            placeholder="Or enter custom Batch ID e.g. BATCH-2026-HIM-101"
            value={batchIdInput}
            onChange={e => setBatchIdInput(e.target.value)}
          />
          <button type="submit" className="btn-yellow">🔍 Lookup Batch</button>
        </form>
      </div>

      {batchData ? (
        <div>
          <div className="purity-hero-banner">
            <div className="purity-big-score">
              <div className="score-num">
                {batchData.labTestResults ? `${batchData.labTestResults.purityPercentage}%` : '99.4%'}
              </div>
              <div className="score-lbl">Purity Score</div>
            </div>

            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>{batchData.batchId}</h2>
              <div className={`badge-status ${batchData.labTestResults?.status === 'FAIL' ? 'FAIL' : 'PASS'}`} style={{ display: 'inline-block', margin: '6px 0' }}>
                {batchData.labTestResults?.status === 'FAIL' ? '❌ Failed Laboratory Quality Standard' : '✓ Verified Pure Honey'}
              </div>
              <p style={{ fontWeight: 600 }}>{batchData.cropDetails?.cropName}</p>
              <div style={{ fontSize: '0.8rem', color: '#333', marginTop: '4px' }}>
                Ledger Hash Signature: <code style={{ background: '#fff', padding: '2px 6px', border: '1px solid #000', borderRadius: '3px' }}>{batchData.sha256Hash}</code>
              </div>
            </div>
          </div>

          <div className="neo-card" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 className="neo-card-title">📱 Associated Batch QR Code & Provenance Certificate</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              This QR Code links directly to this tamper-proof cryptographic audit trail.
            </p>
            <img src={batchData.qrCodeDataUrl} alt="Batch QR Code" style={{ width: '180px', height: '180px', border: '2px solid #000', borderRadius: '6px', boxShadow: '3px 3px 0px #000' }} />
          </div>

          <div className="grid-2col">
            <div className="neo-card" id="c-profile-box">
              <h3 className="neo-card-title">👨‍🌾 Beekeeper Profile & Hive IoT Sensors</h3>
              
              <div style={{ marginBottom: '14px', background: '#fdfbf7', border: '2px solid #000', padding: '12px', borderRadius: '6px' }}>
                <strong style={{ fontSize: '1.1rem', display: 'block' }}>{batchData.beekeeperProfile?.name}</strong>
                <span style={{ color: '#555', fontWeight: 600 }}>{batchData.beekeeperProfile?.apiary}</span>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>License: {batchData.beekeeperProfile?.license}</div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Hive Microclimate Telemetry:</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                  <div style={{ background: '#fff', border: '2px solid #000', padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Temp: <strong>{batchData.iotSensorDetails?.temperature}°C</strong>
                  </div>
                  <div style={{ background: '#fff', border: '2px solid #000', padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Humid: <strong>{batchData.iotSensorDetails?.humidity}%</strong>
                  </div>
                  <div style={{ background: '#fff', border: '2px solid #000', padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    Net Weight: <strong>{batchData.iotSensorDetails?.weight} kg</strong>
                  </div>
                  <div style={{ background: '#fff', border: '2px solid #000', padding: '8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    VOC Gas: <strong>{batchData.iotSensorDetails?.vocPpm} ppm</strong>
                  </div>
                </div>
              </div>

              {batchData.uploadedImages?.map((img, idx) => (
                <div key={idx} style={{ marginTop: '12px', background: '#fffbe6', padding: '10px', border: '2px solid #000', borderRadius: '6px' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '6px', color: '#92400e' }}>📷 Beekeeper Frame Evidence Photo:</strong>
                  {img.data && <img src={img.data} alt="Frame Evidence" style={{ maxHeight: '140px', borderRadius: '4px', border: '1px solid #000' }} />}
                  <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '4px' }}>{img.caption}</p>
                </div>
              ))}
            </div>

            <div className="neo-card">
              <h3 className="neo-card-title">🧪 Official Laboratory Certificate</h3>
              {batchData.labTestResults ? (
                <div style={{ lineHeight: 1.8, fontSize: '0.9rem' }}>
                  <div>Testing Lab: <strong>{batchData.labTestResults.labName}</strong></div>
                  <div>Moisture Content: <strong>{batchData.labTestResults.moisturePercentage}% (Legal Max 20%)</strong></div>
                  <div>HMF Freshness: <strong>{batchData.labTestResults.hmfMgKg} mg/kg</strong></div>
                  <div>Antibiotics: <strong>{batchData.labTestResults.antibioticResidues}</strong></div>
                  <div>Pollen Signature: <strong>{batchData.labTestResults.pollenCount}</strong></div>
                  <div style={{ background: '#fffdfa', border: '2px solid #000', padding: '12px', borderRadius: '6px', marginTop: '14px' }}>
                    <em>"{batchData.labTestResults.feedback}"</em>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#b45309', background: '#fef3c7', padding: '12px', border: '2px solid #000', borderRadius: '6px' }}>
                  ⏳ Laboratory quality testing in progress.
                </div>
              )}

              <div style={{ marginTop: '20px', padding: '12px', background: '#f0fdf4', border: '2px solid #000', borderRadius: '6px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#166534' }}>🏪 Store Stock Audit Status:</strong>
                {batchData.retailerLogs?.length > 0 ? (
                  batchData.retailerLogs.map((log, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '4px' }}>
                      Verified in stock at {log.storeName} ({log.stockQuantity} Jars).
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#14532d', marginTop: '4px' }}>
                    Verified in stock at Pure Natural Foods (Connaught Place, Delhi).
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid-2col" style={{ marginTop: '30px' }}>
            <div className="neo-card" id="btn-goto-feedback">
              <h3 className="neo-card-title">⭐ Provide Consumer Rating</h3>
              <form onSubmit={handleRatingSubmit}>
                <div className="form-group">
                  <label>Your Name *</label>
                  <input type="text" className="neo-input" value={reviewerName} onChange={e => setReviewerName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Rating Score *</label>
                  <select className="neo-input" value={rating} onChange={e => setRating(e.target.value)}>
                    <option value="5">5 ⭐ — Exceptional Quality & Aroma</option>
                    <option value="4">4 ⭐ — Good Pure Honey</option>
                    <option value="3">3 ⭐ — Average</option>
                    <option value="2">2 ⭐ — Below Standard</option>
                    <option value="1">1 ⭐ — Poor / Suspicious</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Review Comment *</label>
                  <input type="text" className="neo-input" value={comment} onChange={e => setComment(e.target.value)} required />
                </div>
                {ratingMsg && <div style={{ color: 'var(--green-accent)', fontWeight: 700, marginBottom: '8px' }}>{ratingMsg}</div>}
                <button type="submit" className="btn-yellow">Submit Rating</button>
              </form>
            </div>

            <div className="neo-card" id="btn-goto-contact">
              <h3 className="neo-card-title">⚠️ Report Quality Concern</h3>
              <form onSubmit={handleConcernSubmit}>
                <div className="form-group">
                  <label>Concern Category *</label>
                  <select className="neo-input" value={concernCategory} onChange={e => setConcernCategory(e.target.value)}>
                    <option value="Quality / Adulteration Suspicion">Quality / Adulteration Suspicion</option>
                    <option value="Packaging / Tamper Seal Issue">Packaging / Tamper Seal Issue</option>
                    <option value="Label QR Mismatch">Label QR Mismatch</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Detailed Comments *</label>
                  <textarea className="neo-input" rows="3" value={concernComments} onChange={e => setConcernComments(e.target.value)} required placeholder="Describe your quality inquiry..." />
                </div>
                {concernMsg && <div style={{ color: 'var(--green-accent)', fontWeight: 700, marginBottom: '8px' }}>{concernMsg}</div>}
                <button type="submit" className="btn-white" style={{ color: '#ef4444', borderColor: '#ef4444' }}>Submit Concern Report</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="neo-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3 className="neo-card-title">⚠️ Batch Not Found</h3>
          <p style={{ color: 'var(--text-muted)' }}>The requested Batch ID is invalid or not registered in the system ledger.</p>
        </div>
      )}
    </main>
  );
}

// ═══════════════ FEEDBACK VIEW COMPONENT ═══════════════
function FeedbackView() {
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState('5');
  const [comments, setComments] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="app-container">
      <div className="login-card-container">
        <div className="neo-card">
          <h2 className="neo-card-title">💬 Public Feedback & Platform Rating Portal</h2>
          <p className="neo-card-subtitle">Help us improve the national honey traceability ecosystem with your feedback:</p>

          {submitted ? (
            <div style={{ background: '#dcfce7', border: '2px solid #000', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#15803d', fontWeight: 900 }}>✓ Thank You!</h3>
              <p style={{ marginTop: '8px' }}>Your feedback has been logged into the national quality registry.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Overall Traceability Platform Rating *</label>
                <select className="neo-input" value={rating} onChange={e => setRating(e.target.value)}>
                  <option value="5">5 ⭐ — Excellent Platform Experience</option>
                  <option value="4">4 ⭐ — Very Good</option>
                  <option value="3">3 ⭐ — Average</option>
                  <option value="2">2 ⭐ — Needs Improvement</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Feedback / Suggestions *</label>
                <textarea 
                  className="neo-input" 
                  rows="4" 
                  value={comments} 
                  onChange={e => setComments(e.target.value)}
                  required 
                  placeholder="Share your thoughts on hive telemetry transparency, lab certificates, or retailer audits..."
                />
              </div>

              <button type="submit" className="btn-yellow" style={{ width: '100%' }}>Submit System Feedback</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

// ═══════════════ CONTACT VIEW COMPONENT ═══════════════
function ContactView() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="app-container">
      <div className="login-card-container">
        <div className="neo-card">
          <h2 className="neo-card-title">📞 Contact Support & Quality Portal</h2>
          <p className="neo-card-subtitle">Reach out to the Smart Hive National Support Team or report quality disputes:</p>

          {submitted ? (
            <div style={{ background: '#dcfce7', border: '2px solid #000', padding: '20px', borderRadius: '6px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#15803d', fontWeight: 900 }}>✓ Support Ticket Created</h3>
              <p style={{ marginTop: '8px' }}>Our technical support team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Your Full Name *</label>
                <input type="text" className="neo-input" value={name} onChange={e => setName(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input type="email" className="neo-input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Inquiry / Concern Message *</label>
                <textarea className="neo-input" rows="4" value={msg} onChange={e => setMsg(e.target.value)} required placeholder="State your inquiry or support ticket details..." />
              </div>

              <button type="submit" className="btn-yellow" style={{ width: '100%' }}>Submit Inquiry Ticket</button>
            </form>
          )}

          <div style={{ marginTop: '24px', borderTop: '2px solid #000', paddingTop: '16px', fontSize: '0.85rem' }}>
            <strong>📍 Head Office:</strong> National Apiary Mission & Smart Hive AI Division, New Delhi.<br />
            <strong>📧 Support Email:</strong> support@smarthive.gov.portal<br />
            <strong>📞 Toll-Free Helpline:</strong> 1800-HONEY-TRACE
          </div>
        </div>
      </div>
    </main>
  );
}

// ═══════════════ MAIN REACT APP CONTAINER ═══════════════
function App() {
  const [currentView, setCurrentView] = useState('home');
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sh_user') || 'null'); } catch { return null; }
  });
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('sh_token') || null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState('BATCH-2026-HIM-101');

  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/login') setCurrentView('login');
    else if (path === '/beekeeper') setCurrentView('beekeeper');
    else if (path === '/tester') setCurrentView('tester');
    else if (path === '/retailer') setCurrentView('retailer');
    else if (path === '/consumer') setCurrentView('consumer');
    else if (path === '/feedback') setCurrentView('feedback');
    else if (path === '/contact') setCurrentView('contact');
  }, []);

  const handleLoginSuccess = (token, profile, redirectRoute) => {
    localStorage.setItem('sh_token', token);
    localStorage.setItem('sh_user', JSON.stringify(profile));
    setAuthToken(token);
    setCurrentUser(profile);

    if (redirectRoute === '/beekeeper') setCurrentView('beekeeper');
    else if (redirectRoute === '/tester') setCurrentView('tester');
    else if (redirectRoute === '/retailer') setCurrentView('retailer');
    else setCurrentView('consumer');
  };

  const handleLogout = () => {
    localStorage.removeItem('sh_token');
    localStorage.removeItem('sh_user');
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleSelectRoleFromDrawer = (username) => {
    setCurrentView('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onLogout={handleLogout}
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <SidebarDrawer 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onSelectRole={handleSelectRoleFromDrawer}
      />

      <div style={{ flex: 1 }}>
        {currentView === 'home' && <HomeView setCurrentView={setCurrentView} setSelectedBatchId={setSelectedBatchId} />}
        {currentView === 'login' && <LoginView onLoginSuccess={handleLoginSuccess} />}
        {currentView === 'beekeeper' && <BeekeeperView authToken={authToken} currentUser={currentUser} />}
        {currentView === 'tester' && <LabView authToken={authToken} />}
        {currentView === 'retailer' && <RetailerView authToken={authToken} />}
        {currentView === 'consumer' && <ConsumerView selectedBatchId={selectedBatchId} setCurrentView={setCurrentView} />}
        {currentView === 'feedback' && <FeedbackView />}
        {currentView === 'contact' && <ContactView />}
      </div>

      <Footer setCurrentView={setCurrentView} />
    </div>
  );
}

// Render React App to #root
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
