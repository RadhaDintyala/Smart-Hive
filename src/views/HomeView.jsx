import React, { useState } from 'react';

export default function HomeView({ setCurrentView, setSelectedBatchId }) {
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
      {/* ═══════════════ MAIN HERO CARD (MATCHING LATEST PROMPT IMAGE) ═══════════════ */}
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
          <img src="/assets/zzz.jpeg" alt="Smart Hive Bee" className="hero-bee-img" />
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

      {/* ═══════════════ 4 FEATURE CARDS GRID ═══════════════ */}
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
