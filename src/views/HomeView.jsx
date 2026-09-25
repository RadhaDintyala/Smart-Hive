import React, { useState } from 'react';

export default function HomeView({ setCurrentView, setSelectedBatchId }) {
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [homeInput, setHomeInput] = useState('');

  const handleVerifyBatch = (batchId) => {
    if (setSelectedBatchId) setSelectedBatchId(batchId);
    window.history.pushState({}, '', `/consumer?batchId=${encodeURIComponent(batchId)}`);
    setCurrentView('consumer');
  };

  const startCameraScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setShowScannerModal(false);
      handleVerifyBatch('BATCH-2026-HIM-101');
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleVerifyBatch('BATCH-2026-HIM-101');
    }
  };

  const handleRegisterBatchClick = () => {
    window.history.pushState({}, '', '/login');
    setCurrentView('login');
  };

  return (
    <main className="landing-main-wrapper" style={{ paddingBottom: '60px' }}>
      {/* ═══════════════ MAIN HERO SECTION WITH PHOTO & CTA CARD ═══════════════ */}
      <section className="landing-hero-card" style={{
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(24px) saturate(190%)',
        WebkitBackdropFilter: 'blur(24px) saturate(190%)',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: '0 20px 50px rgba(31, 38, 135, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.8)',
        borderRadius: '24px',
        padding: '36px 32px'
      }}>
        {/* Left Column: Hero Photo & CTA Box "Register New Batch" */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* HERO PHOTO */}
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid rgba(245, 184, 20, 0.4)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            maxHeight: '220px'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80" 
              alt="Himalayan Apiary & Organic Honey Comb" 
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85), transparent)',
              padding: '16px 20px',
              color: '#fff'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#f5b814', letterSpacing: '0.05em' }}>
                Apiary Origin Traceability
              </span>
              <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>
                Himalayan Alpine Wild Flora Honey Extraction
              </div>
            </div>
          </div>

          {/* REGISTER NEW BATCH CTA CARD */}
          <div className="hero-bee-wrapper" style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justify: 'center',
            background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.5) 0%, rgba(245, 184, 20, 0.3) 100%)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(245, 184, 20, 0.5)',
            borderRadius: '20px',
            padding: '24px 20px',
            textAlign: 'center',
            boxShadow: '0 12px 32px rgba(245, 184, 20, 0.18)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🍯</div>
            <span style={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', color: '#854d0e', letterSpacing: '0.05em', background: 'rgba(255,255,255,0.85)', padding: '4px 12px', borderRadius: '12px', marginBottom: '10px', border: '1px solid rgba(245, 184, 20, 0.4)' }}>
              Beekeeper Portal
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.2 }}>
              Register New Honey Batch
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.45 }}>
              Log IoT sensors, audio spectrograms, comb photo geotags, and mint national QR codes.
            </p>

            <button 
              type="button" 
              className="btn-yellow" 
              onClick={handleRegisterBatchClick}
              style={{ width: '100%', fontSize: '1rem', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <span>⚡ Register New Batch</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Content & Scanner for Common Consumer */}
        <div className="hero-content-col">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 184, 20, 0.18)', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, marginBottom: '12px', border: '1px solid rgba(245, 184, 20, 0.3)' }}>
            <span>👋 Public Consumer Verification</span>
            <span>• Instant QR Verification Portal</span>
          </div>

          <h1 className="hero-title-bold" style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            color: '#0f172a',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '14px'
          }}>
            SCAN HONEY QR CODE<br />
            <span style={{ color: '#d97706', background: 'linear-gradient(135deg, #f5b814, #d97706)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              VERIFY BLOCKCHAIN PURITY
            </span>
          </h1>

          <p className="hero-desc-text" style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.6, marginBottom: '20px' }}>
            Scan or upload the QR code on your honey jar label to verify cryptographic origin, Beekeeper microclimate telemetry, NABL lab purity certificates, and retailer cold-chain audit logs.
          </p>

          {/* 🍯 PRIMARY QR SCANNER PORTAL CARD FOR CONSUMERS */}
          <div style={{
            width: '100%',
            maxWidth: '560px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid #f5b814',
            boxShadow: '0 12px 36px rgba(245, 184, 20, 0.18)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '1.6rem' }}>📱</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                  Scan / Upload Honey Jar QR Code
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Encrypted cryptographic blockchain ledger verification</span>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (homeInput) handleVerifyBatch(homeInput); }} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="neo-input"
                placeholder="Enter Batch ID or paste QR payload (e.g. BATCH-2026-HIM-101)..."
                value={homeInput}
                onChange={(e) => setHomeInput(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn-yellow" style={{ padding: '12px 18px', fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                Verify Batch ➔
              </button>
            </form>

            {/* ACTION BUTTONS FOR QR SCANNING */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <button
                type="button"
                className="btn-yellow"
                onClick={() => setShowScannerModal(true)}
                style={{ padding: '16px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>📷 Camera QR Scanner</span>
              </button>
              
              <label className="btn-white" style={{ padding: '16px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                <span>🖼️ Upload QR Image</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ 4 FEATURE CARDS GRID ═══════════════ */}
      <div className="feature-cards-grid" style={{ marginTop: '32px' }}>
        <div className="feature-card-neo" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '20px' }}>
          <div className="feature-card-icon">🐝</div>
          <h3 className="feature-card-title">1. Beekeeper Telemetry</h3>
          <p className="feature-card-desc">
            IoT microclimate sensors (temperature, humidity, weight, VOC) combined with mandatory comb frame photo evidence.
          </p>
        </div>

        <div className="feature-card-neo" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '20px' }}>
          <div className="feature-card-icon">🧪</div>
          <h3 className="feature-card-title">2. NABL Lab Analysis</h3>
          <p className="feature-card-desc">
            Moisture %, HMF freshness, pollen identification, and antibiotic residue verification.
          </p>
        </div>

        <div className="feature-card-neo" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '20px' }}>
          <div className="feature-card-icon">🏪</div>
          <h3 className="feature-card-title">3. Retailer Stock Audit</h3>
          <p className="feature-card-desc">
            Cryptographic batch hash verification and physical stock quantity tracking at retail outlets.
          </p>
        </div>

        <div className="feature-card-neo" style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.8)', borderRadius: '20px' }}>
          <div className="feature-card-icon">📱</div>
          <h3 className="feature-card-title">4. Public QR Verification</h3>
          <p className="feature-card-desc">
            Instant scan transparency for consumers with purity scores, beekeeper profiles, and feedback logs.
          </p>
        </div>
      </div>

      {/* ═══════════════ CAMERA SCANNER MODAL ═══════════════ */}
      {showScannerModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(12px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1.5px solid #f5b814', borderRadius: '24px', padding: '28px', maxWidth: '480px', width: '100%', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>📷 Camera QR Code Scanner</h3>
              <button onClick={() => setShowScannerModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ background: '#000000', borderRadius: '16px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', position: 'relative', overflow: 'hidden', margin: '16px 0' }}>
              {scanning ? (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }} className="animate-bounce">📱</div>
                  <div style={{ fontWeight: 800, color: '#f5b814', fontSize: '0.95rem' }}>Scanning Honey Jar QR Code...</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Matching Ledger Hash...</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Align QR Code within camera viewport</div>
                  <button onClick={startCameraScan} className="btn-yellow" style={{ marginTop: '14px', padding: '10px 24px', fontSize: '0.88rem' }}>
                    Capture & Verify QR
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => handleVerifyBatch('BATCH-2026-HIM-101')} className="btn-white" style={{ width: '100%' }}>
              Verify Sample Batch (BATCH-2026-HIM-101)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
