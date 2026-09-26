import React from 'react';

export default function ExploreView({ setCurrentView, setSelectedBatchId }) {
  const handleVerifySampleBatch = () => {
    if (setSelectedBatchId) setSelectedBatchId('BATCH-2026-HIM-101');
    window.history.pushState({}, '', '/consumer?batchId=BATCH-2026-HIM-101');
    setCurrentView('consumer');
  };

  const handleGoToLogin = () => {
    window.history.pushState({}, '', '/login');
    setCurrentView('login');
  };

  return (
    <main className="landing-main-wrapper" style={{ padding: '40px 20px 80px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* ═══════════════ HEADER BANNER ═══════════════ */}
      <section style={{
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid rgba(245, 184, 20, 0.4)',
        borderRadius: '24px',
        padding: '40px 32px',
        marginBottom: '40px',
        boxShadow: '0 20px 50px rgba(31, 38, 135, 0.08)'
      }}>
        <div style={{ display: 'inline-block', background: 'rgba(245, 184, 20, 0.18)', color: '#854d0e', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '14px', border: '1px solid rgba(245, 184, 20, 0.3)' }}>
          📖 Platform Architecture & Dashboard Guide
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, marginBottom: '14px' }}>
          Explore Smart Hive: How End-to-End Honey Provenance Works
        </h1>
        <p style={{ color: '#475569', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '850px' }}>
          Smart Hive is a next-generation blockchain and IoT honey traceability ecosystem. It bridges the gap between rural beekeepers, NABL certified testing laboratories, retail food outlets, and everyday consumers. Explore how each specialized dashboard operates in real-time.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
          <button onClick={handleVerifySampleBatch} className="btn-yellow" style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 800 }}>
            🔍 Try Live Verification (Sample Jar)
          </button>
          <button onClick={handleGoToLogin} className="btn-white" style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700 }}>
            🔑 Sign In to Role Dashboard
          </button>
        </div>
      </section>

      {/* ═══════════════ SUPPLY CHAIN PIPELINE STEPS ═══════════════ */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px', textAlign: 'center' }}>
        The 4-Stage Immutable Honey Supply Chain Flow
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '50px'
      }}>
        {/* Step 1 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(245, 184, 20, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#f5b814', color: '#000', fontWeight: 900, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🐝</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>1. Beekeeper Telemetry</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
            Beekeepers log harvest batch yield, real-time IoT microclimate telemetry (temperature, humidity, hive weight, VOC gases), vibrational sound hum frequencies, and comb photo evidence.
          </p>
        </div>

        {/* Step 2 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(34, 197, 94, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#22c55e', color: '#fff', fontWeight: 900, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🧪</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>2. NABL Lab Analysis</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
            Accredited quality control laboratories test samples for moisture %, HMF freshness, HPLC pollen grain origin, and zero antibiotic residue before digitally signing Pass certificates.
          </p>
        </div>

        {/* Step 3 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#3b82f6', color: '#fff', fontWeight: 900, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</div>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>🏪</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>3. Retail Stock Audit</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
            Retail outlets scan incoming jar QR codes, verify ledger cryptographic hashes against physical stock counts, and log retail store location & cold-chain audit status.
          </p>
        </div>

        {/* Step 4 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#a855f7', color: '#fff', fontWeight: 900, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>4</div>
          <div style={{ fontSize: '2.2rem', marginBottom: '12px' }}>📱</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>4. Public QR Verification</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5 }}>
            End consumers scan jar label QR codes to view 100% transparent purity scores, beekeeper profiles, lab test breakdown, and submit reviews or quality concern reports.
          </p>
        </div>
      </div>

      {/* ═══════════════ DETAILED DASHBOARD OVERVIEWS ═══════════════ */}
      <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '24px' }}>
        Deep Dive: How Each Role Dashboard Functions
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '60px' }}>
        {/* BEEKEEPER DASHBOARD BLOG SECTION */}
        <article style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1.5px solid rgba(245, 184, 20, 0.5)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>🐝</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#854d0e', letterSpacing: '0.05em' }}>
                Role Dashboard 1
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Beekeeper Harvest & IoT Telemetry Portal
              </h3>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
            The Beekeeper Dashboard empowers rural and commercial beekeepers to register newly extracted honey batches on the blockchain. Beekeepers fill in mandatory harvest data including crop floral source, extraction date range, and estimated yield.
          </p>
          <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#854d0e' }}>
              ⚡ Mandatory Data Points Required for Batch Minting:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#713f12', lineHeight: 1.6 }}>
              <li><strong>Microclimate Sensors:</strong> Temperature (°C), Relative Humidity (%), Hive Weight (kg), and VOC gas PPM.</li>
              <li><strong>Acoustic Spectrogram:</strong> Hive vibrational hum audio frequency (detects swarming or queenless state).</li>
              <li><strong>Comb Inspection Photo Evidence:</strong> Geotagged mandatory photo upload of honeycomb frame.</li>
            </ul>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
            Once submitted, Smart Hive computes an immutable SHA-256 hash and generates a unique national QR code label for the batch.
          </p>
        </article>

        {/* LAB DASHBOARD BLOG SECTION */}
        <article style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1.5px solid rgba(34, 197, 94, 0.5)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>🧪</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.05em' }}>
                Role Dashboard 2
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                NABL Accredited Quality Assurance Lab Portal
              </h3>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
            Before any honey batch can be sold to consumers, accredited testing facilities evaluate physical and chemical purity parameters. The Lab Dashboard allows scientists to look up pending batches by Batch ID and record certified test metrics.
          </p>
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#166534' }}>
              🔬 Laboratory Analytical Testing Suite:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#14532d', lineHeight: 1.6 }}>
              <li><strong>Purity Score %:</strong> Minimum threshold of 95%+ pure floral honey.</li>
              <li><strong>Moisture Content:</strong> Must remain below 20.0% to prevent fermentation.</li>
              <li><strong>HMF Freshness (mg/kg):</strong> Hydroxymethylfurfural testing ensures honey has not been overheated or adulterated with sugar syrups.</li>
              <li><strong>Antibiotic Residue Screening:</strong> Zero tolerance (0.0 ppm) verification for food safety.</li>
            </ul>
          </div>
          <p style={{ fontSize: '0.88rem', color: '#64748b', fontStyle: 'italic', margin: 0 }}>
            Submitting a "PASS" certification instantly updates the batch status on the public ledger.
          </p>
        </article>

        {/* RETAILER DASHBOARD BLOG SECTION */}
        <article style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1.5px solid rgba(59, 130, 246, 0.5)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>🏪</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#1e40af', letterSpacing: '0.05em' }}>
                Role Dashboard 3
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Retailer Inventory & Cold-Chain Audit Portal
              </h3>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
            Retail outlets use this portal to verify physical inventory when shipments arrive from apiaries or distribution centers. Retailers scan batch QR codes to confirm that lab clearance has passed and that cryptographic hashes match the blockchain.
          </p>
          <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e40af' }}>
              📦 Retailer Verification Actions:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#1e3a8a', lineHeight: 1.6 }}>
              <li><strong>Stock Audit:</strong> Log physical stock quantity available at specific store outlets.</li>
              <li><strong>Cold-Chain Verification:</strong> Record transit condition and shelf placement remarks.</li>
              <li><strong>Anti-Counterfeit Protection:</strong> Flags any unregistered or mismatched batch codes.</li>
            </ul>
          </div>
        </article>

        {/* CONSUMER DASHBOARD BLOG SECTION */}
        <article style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '24px',
          padding: '32px',
          border: '1.5px solid rgba(168, 85, 247, 0.5)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '2rem' }}>📱</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: '#6b21a8', letterSpacing: '0.05em' }}>
                Public Portal
              </span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Public Consumer Verification & Feedback Portal
              </h3>
            </div>
          </div>
          <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>
            No login is required for end consumers. By simply scanning the QR code on a jar of honey or typing in the Batch ID on the landing page, consumers gain instant access to complete origin transparency.
          </p>
          <div style={{ background: '#faf5ff', border: '1px solid #d8b4fe', borderRadius: '14px', padding: '16px 20px', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#6b21a8' }}>
              ✨ Consumer View Highlights:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.88rem', color: '#581c87', lineHeight: 1.6 }}>
              <li><strong>Interactive Origin Map & Beekeeper Profile:</strong> View apiary coordinates and beekeeper bio.</li>
              <li><strong>Complete Lab Certificate:</strong> Check purity %, moisture %, and antibiotic residue logs.</li>
              <li><strong>Consumer Review System:</strong> Rate products and submit feedback directly to the apiary.</li>
              <li><strong>Quality Concern Reporting:</strong> Flag adulteration suspicions or packaging seal issues.</li>
            </ul>
          </div>
        </article>
      </div>

      {/* ═══════════════ FINAL CALL TO ACTION ═══════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(254, 240, 138, 0.6) 0%, rgba(245, 184, 20, 0.4) 100%)',
        border: '2px solid #f5b814',
        borderRadius: '24px',
        padding: '36px',
        textAlign: 'center',
        boxShadow: '0 16px 40px rgba(245, 184, 20, 0.2)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🐝</div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', marginBottom: '10px' }}>
          Experience Smart Hive Traceability Today
        </h2>
        <p style={{ color: '#475569', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 24px' }}>
          Try scanning a sample honey batch or sign in to test the Beekeeper, Lab, or Retailer portals.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={handleVerifySampleBatch} className="btn-yellow" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 800 }}>
            🔍 Verify Sample Honey Jar (BATCH-2026-HIM-101)
          </button>
          <button onClick={handleGoToLogin} className="btn-white" style={{ padding: '14px 28px', fontSize: '1rem', fontWeight: 700 }}>
            🔑 Sign In to Platform
          </button>
        </div>
      </section>
    </main>
  );
}
