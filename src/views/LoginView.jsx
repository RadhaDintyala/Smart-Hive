import React, { useState } from 'react';

export default function LoginView({ onLoginSuccess }) {
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
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onLoginSuccess(data.token, data.profile, data.redirectRoute);
      } else {
        setErrorMsg(data.error || 'Authentication failed');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error connecting to backend server');
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
