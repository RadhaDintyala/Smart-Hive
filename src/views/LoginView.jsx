import React, { useState } from 'react';
import { ShieldCheck, KeyRound, Lock, User, FlaskConical, Store, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function LoginView({ onLoginSuccess }) {
  const [selectedUser, setSelectedUser] = useState('beekeeper1');
  const [selectedRole, setSelectedRole] = useState('Beekeeper');
  const [password, setPassword] = useState('pass123');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const rolesList = [
    {
      id: 'beekeeper1',
      title: 'Beekeeper',
      badge: 'Producer',
      icon: <span style={{ fontSize: '1.5rem' }}>🐝</span>,
      lucideIcon: <User size={22} className="text-amber-500" />,
      desc: 'IoT Sensors, Audio, Spectrums & Harvest Logs',
      color: '#f59e0b'
    },
    {
      id: 'lab1',
      title: 'Laboratory',
      badge: 'NABL Certified',
      icon: <span style={{ fontSize: '1.5rem' }}>🧪</span>,
      lucideIcon: <FlaskConical size={22} className="text-blue-500" />,
      desc: 'Purity Testing & Quality Feedback Verification',
      color: '#3b82f6'
    },
    {
      id: 'retailer1',
      title: 'Retailer',
      badge: 'Supply Chain',
      icon: <span style={{ fontSize: '1.5rem' }}>🏪</span>,
      lucideIcon: <Store size={22} className="text-emerald-500" />,
      desc: 'Batch QR Code Verification & Stock Inventory',
      color: '#10b981'
    }
  ];

  const handleRoleSelect = (username, role) => {
    setSelectedUser(username);
    setSelectedRole(role);
    setPassword('pass123');
    setErrorMsg('');
  };

  const DEMO_USERS = {
    beekeeper1: {
      username: 'beekeeper1',
      role: 'Beekeeper',
      name: 'Rajesh Kumar (Master Beekeeper)',
      apiary: 'Himalayan Organic Apiary, Dehradun',
      license: 'GOV-HONEY-AP-8821',
      bio: 'Certified organic beekeeper with 15+ years experience in high-altitude wild flora honey collection.'
    },
    lab1: {
      username: 'lab1',
      role: 'Laboratory',
      name: 'Central National Honey Quality Control Lab',
      accreditation: 'NABL & ISO/IEC 17025 Accredited',
      license: 'GOV-LAB-TEST-9920'
    },
    retailer1: {
      username: 'retailer1',
      role: 'Retailer',
      name: 'Pure Natural Foods & Retail Outlets',
      storeLocation: 'Connaught Place, New Delhi',
      license: 'RETAIL-GOV-4410'
    }
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
          setErrorMsg(data.error || 'Authentication failed. Invalid credentials.');
          return;
        }
      }
    } catch (err) {
      console.warn('Backend server connection notice, using local demo fallback:', err);
    }

    setLoading(false);
    const demoUser = DEMO_USERS[selectedUser];
    if (demoUser && (password === 'pass123' || password === '')) {
      const token = 'demo_session_token_' + Date.now();
      let redirectRoute = '/beekeeper';
      if (demoUser.role === 'Beekeeper') redirectRoute = '/beekeeper';
      else if (demoUser.role === 'Laboratory') redirectRoute = '/tester';
      else if (demoUser.role === 'Retailer') redirectRoute = '/retailer';

      onLoginSuccess(token, demoUser, redirectRoute);
    } else {
      setErrorMsg('Invalid Username or Password.');
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 16px'
    }}>
      {/* GLASS CARD STRUCTURE WRAPPER */}
      <div style={{
        maxWidth: '820px',
        width: '100%',
        padding: '38px 32px',
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 20px 50px rgba(31, 38, 135, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
        borderRadius: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Decorative Header Accent Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(254, 240, 138, 0.65)',
          border: '1px solid rgba(245, 184, 20, 0.4)',
          backdropFilter: 'blur(10px)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontWeight: 800,
          fontSize: '0.82rem',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: '16px',
          color: '#92400e'
        }}>
          <ShieldCheck size={16} color="#d97706" />
          <span>Government Honey Traceability Platform</span>
        </div>

        {/* Header Title & Subtitle */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 900,
            color: '#0f172a',
            margin: '0 0 8px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}>
            Select Portal Workspace
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: '#64748b',
            margin: 0,
            fontWeight: 500
          }}>
            Choose your assigned supply chain role below to sign in into your workspace.
          </p>
        </div>

        {/* ROLE SELECTION CARD GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {rolesList.map((r) => {
            const isSelected = selectedUser === r.id;
            return (
              <div
                key={r.id}
                onClick={() => handleRoleSelect(r.id, r.title)}
                style={{
                  background: isSelected ? 'rgba(255, 253, 240, 0.95)' : 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px)',
                  border: isSelected ? '1.5px solid #f5b814' : '1px solid rgba(0,0,0,0.08)',
                  boxShadow: isSelected ? '0 8px 24px rgba(245, 184, 20, 0.25)' : '0 4px 14px rgba(0,0,0,0.03)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  borderRadius: '16px',
                  padding: '18px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    color: '#d97706'
                  }}>
                    <CheckCircle2 size={20} />
                  </div>
                )}

                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    {r.icon}
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      background: isSelected ? 'rgba(245, 184, 20, 0.25)' : 'rgba(0,0,0,0.05)',
                      color: isSelected ? '#92400e' : '#475569',
                      borderRadius: '12px'
                    }}>
                      {r.badge}
                    </span>
                  </div>

                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    margin: '0 0 4px 0',
                    color: '#0f172a'
                  }}>
                    {r.title}
                  </h3>

                  <p style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.4
                  }}>
                    {r.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AUTHENTICATION FORM CARD SECTION */}
        <form onSubmit={handleSubmit} style={{
          background: 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
          borderRadius: '18px',
          padding: '24px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
            marginBottom: '20px'
          }}>
            {/* Username */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '6px',
                color: '#0f172a'
              }}>
                Username
              </label>
              <input
                type="text"
                value={selectedUser}
                readOnly
                className="neo-input"
                style={{
                  background: 'rgba(241, 245, 249, 0.8)',
                  fontWeight: 800,
                  color: '#0f172a'
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontWeight: 800,
                fontSize: '0.85rem',
                marginBottom: '6px',
                color: '#0f172a'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="neo-input"
              />
            </div>
          </div>

          {errorMsg && (
            <div style={{
              background: 'rgba(254, 226, 226, 0.75)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#b91c1c',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Lock size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-yellow"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <KeyRound size={20} />
            <span>{loading ? 'Authenticating Credentials...' : `Enter ${selectedRole} Workspace`}</span>
            <ArrowRight size={20} />
          </button>
        </form>

        {/* DEMO CREDENTIALS FOOTER CARD */}
        <div style={{
          marginTop: '20px',
          padding: '14px 18px',
          background: 'rgba(254, 252, 232, 0.8)',
          border: '1px dashed rgba(217, 119, 6, 0.4)',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.85rem',
          color: '#78350f'
        }}>
          <Sparkles size={18} color="#d97706" style={{ flexShrink: 0 }} />
          <div>
            <strong>Quick Demo Credentials:</strong> Default password for all role accounts is <code>pass123</code>. Click any role card above to autofill credentials.
          </div>
        </div>
      </div>
    </div>
  );
}
