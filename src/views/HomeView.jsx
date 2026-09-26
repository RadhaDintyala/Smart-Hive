import React, { useState } from 'react';
import VerificationCard from '../components/VerificationCard';

/**
 * Public landing / consumer entry.
 *
 * Consumers reach this view with zero authentication. The only gated action is
 * "Register New Batch", which is a beekeeper task and correctly routes to login.
 */
export default function HomeView({ setCurrentView, setSelectedBatchId }) {
  const [homeInput, setHomeInput] = useState('');

  /**
   * A decoded QR payload (or a typed Batch ID) hands off to the consumer
   * verification viewport, which performs the authoritative ledger lookup.
   */
  const handleVerifyBatch = (batchId) => {
    const id = (batchId || '').trim();
    if (!id) return;
    if (setSelectedBatchId) setSelectedBatchId(id);
    window.history.pushState({}, '', `/consumer?batchId=${encodeURIComponent(id)}`);
    setCurrentView('consumer');
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
        {/* Left Column: Hero Photo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* HERO PHOTO - organic apiary smart-hive asset */}
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            overflow: 'hidden',
            border: '2px solid rgba(245, 184, 20, 0.4)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
            height: '100%',
            minHeight: '320px'
          }}>
            <img
              src="https://images.unsplash.com/photo-1473973266408-ed4e27abdd47?auto=format&fit=crop&w=800&q=80"
              alt="Organic apiary smart hive among Himalayan alpine flora"
              style={{ width: '100%', height: '100%', minHeight: '320px', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85), transparent)',
              padding: '20px',
              color: '#fff'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#f5b814', letterSpacing: '0.05em' }}>
                Apiary Origin Traceability
              </span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '2px' }}>
                Organic Smart-Hive Apiary &amp; Alpine Wild Flora Extraction
              </div>
            </div>
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

          {/* 🍯 UNIFIED VERIFICATION BOX: Honey Verification + Batch ID Input + QR Scanner */}
          <VerificationCard
            title="Honey Verification"
            subtitle="Encrypted cryptographic blockchain ledger verification"
            value={homeInput}
            onChange={setHomeInput}
            onSubmit={handleVerifyBatch}
          />
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
    </main>
  );
}
