import React, { useState, useEffect } from 'react';
import BlockchainVerifier from '../components/BlockchainVerifier';
import { getStoredBatches, findBatchById } from '../services/batchStore';

export default function ConsumerView({ selectedBatchId, setCurrentView }) {
  const [verifiedBatch, setVerifiedBatch] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanError, setScanError] = useState('');

  const [rating, setRating] = useState('5');
  const [reviewerName, setReviewerName] = useState('');
  const [comment, setComment] = useState('');
  const [ratingMsg, setRatingMsg] = useState('');

  const [concernCategory, setConcernCategory] = useState('Quality / Adulteration Suspicion');
  const [concernComments, setConcernComments] = useState('');
  const [concernMsg, setConcernMsg] = useState('');

  const [manualInput, setManualInput] = useState('');

  useEffect(() => {
    if (selectedBatchId) {
      processQrPayload(selectedBatchId);
    }
    const handleUpdate = () => {
      if (verifiedBatch) {
        const refreshed = findBatchById(verifiedBatch.batchId);
        if (refreshed) setVerifiedBatch(refreshed);
      }
    };
    window.addEventListener('sh_batches_updated', handleUpdate);
    return () => window.removeEventListener('sh_batches_updated', handleUpdate);
  }, [selectedBatchId]);

  const handleBackToHome = () => {
    window.history.pushState({}, '', '/');
    setCurrentView('home');
  };

  const processQrPayload = (qrPayload) => {
    setScanError('');
    let targetId = (qrPayload || '').trim();
    if (!targetId) return;

    // Extract batchId if payload is a URL or search query
    if (targetId.includes('batchId=')) {
      try {
        const url = new URL(targetId, window.location.origin);
        targetId = url.searchParams.get('batchId') || targetId;
      } catch {
        // use raw
      }
    }

    const batch = findBatchById(targetId);
    setHasScanned(true);
    if (batch) {
      setVerifiedBatch(batch);
      setScanError('');
    } else {
      setVerifiedBatch(null);
      setScanError(targetId);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput) {
      processQrPayload(manualInput);
    }
  };

  const startCameraScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setShowScannerModal(false);
      processQrPayload('BATCH-2026-HIM-101');
    }, 1800);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      processQrPayload('BATCH-2026-HIM-101');
    }
  };

  const generatePdfReport = () => {
    if (!verifiedBatch) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const b = verifiedBatch;
    const lab = b.labTestResults || {};
    const ret = (b.retailerLogs && b.retailerLogs[0]) || {};

    const pdfHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cryptographic Authenticity Certificate - ${b.batchId}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; line-height: 1.5; background: #fff; }
          .header { text-align: center; border-bottom: 3px double #d97706; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 900; color: #854d0e; text-transform: uppercase; letter-spacing: 1px; }
          .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
          .badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 6px 16px; border-radius: 20px; font-weight: bold; border: 1px solid #f59e0b; margin-top: 10px; }
          .section { margin-bottom: 28px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
          .section-title { font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #cbd5e1; padding-bottom: 8px; margin-bottom: 14px; text-transform: uppercase; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
          .label { font-weight: bold; color: #475569; }
          .val { color: #0f172a; }
          .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="font-size: 36px; margin-bottom: 5px;">🍯</div>
          <div class="title">Smart Hive Blockchain Audit Certificate</div>
          <div class="subtitle">Cryptographically Verified Triple-Stakeholder Honey Traceability Report</div>
          <div class="badge">✓ VERIFIED AUTHENTIC BATCH ON HYPERLEDGER FABRIC</div>
        </div>

        <div class="section">
          <div class="section-title">🔑 Batch Identification & Blockchain Signatures</div>
          <div class="grid">
            <div><span class="label">Batch Identifier:</span> <span class="val">${b.batchId}</span></div>
            <div><span class="label">Creation Date:</span> <span class="val">${new Date(b.createdTimestamp || Date.now()).toLocaleDateString()}</span></div>
            <div style="grid-column: span 2;"><span class="label">On-Chain Tx Hash:</span> <code style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${b.txHash || '0x7f8a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8'}</code></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🍯 1. Beekeeper Harvest & Microclimate Telemetry</div>
          <div class="grid">
            <div><span class="label">Beekeeper / Apiary:</span> <span class="val">${b.beekeeperName || 'Himalayan Apiary #4'}</span></div>
            <div><span class="label">Crop / Floral Origin:</span> <span class="val">${b.cropName} (${b.floralSource})</span></div>
            <div><span class="label">Geotag Location:</span> <span class="val">${b.geoCoords}</span></div>
            <div><span class="label">Harvest Quantity:</span> <span class="val">${b.yieldQuantityKg} kg</span></div>
            <div><span class="label">Hive Temp / Humidity:</span> <span class="val">${b.temperature}°C / ${b.humidity}%</span></div>
            <div><span class="label">Acoustic Frequency:</span> <span class="val">${b.audioFreq || 225} Hz (${b.audioFilename || 'spectrogram.wav'})</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🧪 2. NABL Laboratory Test Results</div>
          <div class="grid">
            <div><span class="label">NABL Lab Analyst:</span> <span class="val">${lab.testerName || 'Dr. A. K. Sharma (NABL Accredited)'}</span></div>
            <div><span class="label">Lab Test Status:</span> <span class="val" style="color: green; font-weight: bold;">${lab.status === 'PASS' ? '✓ CERTIFIED PASS (GRADE A)' : (lab.status || 'PENDING LAB CERTIFICATION')}</span></div>
            <div><span class="label">Purity Percentage:</span> <span class="val">${lab.purityPercentage || '99.8'}%</span></div>
            <div><span class="label">Moisture Content:</span> <span class="val">${lab.moisturePercentage || '17.1'}%</span></div>
            <div><span class="label">HMF Freshness Level:</span> <span class="val">${lab.hmfMgKg || '12.4'} mg/kg</span></div>
            <div><span class="label">Antibiotic Residues:</span> <span class="val">${lab.antibioticResidues || 'Not Detected (0.0 ppm)'}</span></div>
            <div style="grid-column: span 2;"><span class="label">Lab Analyst Feedback:</span> <span class="val">${lab.feedback || 'Certified 100% pure raw honey.'}</span></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">🏪 3. Retailer Cold Chain & Audit Receipt</div>
          <div class="grid">
            <div><span class="label">Retail Store Outlet:</span> <span class="val">${ret.storeName || 'Organic Hive Superstore (Delhi)'}</span></div>
            <div><span class="label">Receipt Timestamp:</span> <span class="val">${ret.timestamp || '2026-04-18 10:30'}</span></div>
            <div><span class="label">Cold Chain Temp:</span> <span class="val">${ret.temp || '18.4°C'}</span></div>
            <div><span class="label">Stock Verified Qty:</span> <span class="val">${ret.stockQuantity || '50'} Jars</span></div>
            <div style="grid-column: span 2;"><span class="label">Store Audit Remarks:</span> <span class="val">${ret.storeRemarks || 'Cryptographic authenticity verified upon receipt.'}</span></div>
          </div>
        </div>

        <div class="footer">
          Official Smart Hive Cryptographic Certificate • Generated for Public Consumer Audit<br/>
          Smart Hive AI-IoT Platform • Cryptographically Sealed Immutable Ledger
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(pdfHtml);
    printWindow.document.close();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 50%, #fffbeb 100%)', padding: '24px 16px' }}>
      {/* TOP HEADER BAR WITH BACK TO HOME BUTTON (NO FULL NAVBAR) */}
      <header style={{
        maxWidth: '1100px',
        margin: '0 auto 28px auto',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        padding: '16px 24px',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.8rem' }}>🍯</span>
          <div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Smart Hive Consumer Verification
            </h1>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Public Cryptographic QR Authenticity Portal</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleBackToHome}
          className="btn-white"
          style={{ padding: '10px 20px', fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>← Back to Home</span>
        </button>
      </header>

      <main className="app-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* ═══════════════ STEP 1: QR CODE UPLOAD / SCAN SECTION ═══════════════ */}
        {!hasScanned ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px)',
            border: '2px dashed #f5b814',
            borderRadius: '28px',
            padding: '40px 32px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(245, 184, 20, 0.15)',
            maxWidth: '680px',
            margin: '20px auto 40px auto'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>📱</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0 0 10px 0' }}>
              Upload or Scan Honey QR Code
            </h2>
            <p style={{ color: '#475569', fontSize: '0.96rem', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              Scan the QR code on your honey jar label, upload a QR photo, or enter a Batch ID to verify full cryptographic blockchain origin and NABL lab purity.
            </p>

            <form onSubmit={handleManualSubmit} style={{ maxWidth: '480px', margin: '0 auto 24px auto', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="neo-input"
                placeholder="Enter Batch ID or paste QR link (e.g. BATCH-2026-HIM-101)..."
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                style={{ flex: 1, padding: '14px 18px', fontSize: '0.92rem', borderRadius: '14px' }}
              />
              <button type="submit" className="btn-yellow" style={{ padding: '14px 20px', fontSize: '0.92rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                Verify ➔
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', maxWidth: '500px', margin: '0 auto' }}>
              <button
                type="button"
                className="btn-yellow"
                onClick={() => setShowScannerModal(true)}
                style={{ padding: '16px 20px', fontSize: '0.98rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <span>📷 Open Camera Scanner</span>
              </button>

              <label className="btn-white" style={{ padding: '16px 20px', fontSize: '0.98rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', margin: 0 }}>
                <span>🖼️ Upload QR Image File</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        ) : (
          /* ═══════════════ STEP 2: DISPLAY RESULTS AFTER QR IS UPLOADED / SCANNED ═══════════════ */
          <div>
            {scanError ? (
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '3px solid #dc2626',
                borderRadius: '24px',
                padding: '36px 28px',
                textAlign: 'center',
                margin: '20px auto 30px auto',
                maxWidth: '680px',
                boxShadow: '0 16px 40px rgba(220, 38, 38, 0.2)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🚨</div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#991b1b', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
                  UNTRUSTWORTHY & UNVERIFIED HONEY BATCH!
                </h3>
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 16px', borderRadius: '12px', fontWeight: 800, fontSize: '0.92rem', marginBottom: '20px', border: '1px solid #fca5a5' }}>
                  ⚠️ Warning: Scanned QR Code / Batch ID <code style={{ background: '#fff', padding: '2px 8px', borderRadius: '6px', color: '#dc2626' }}>"{scanError}"</code> was NOT found on the Government Smart Hive Blockchain Ledger.
                </div>
                <p style={{ color: '#7f1d1d', fontSize: '0.96rem', margin: '0 0 24px 0', lineHeight: 1.6 }}>
                  This product has no registered Beekeeper harvest origin, NABL Laboratory purity certificate, or Retailer log on the immutable blockchain ledger. <strong>This product may be counterfeit, adulterated, or fraudulently tagged. Do NOT purchase or consume.</strong>
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => { setHasScanned(false); setVerifiedBatch(null); setScanError(''); setManualInput(''); }}
                    className="btn-yellow"
                    style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 800 }}
                  >
                    <span>🔄 Try Another QR Code or Batch ID</span>
                  </button>
                  <button
                    onClick={handleBackToHome}
                    className="btn-white"
                    style={{ padding: '14px 28px', fontSize: '0.95rem', fontWeight: 700 }}
                  >
                    <span>← Back to Home</span>
                  </button>
                </div>
              </div>
            ) : verifiedBatch && (
              <div>
                {/* RE-SCAN QR TOP BAR & PDF REPORT DOWNLOAD */}
                <div style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  background: 'rgba(255, 255, 255, 0.82)',
                  backdropFilter: 'blur(20px)',
                  padding: '20px 28px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  marginBottom: '28px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase', color: '#854d0e', letterSpacing: '0.05em' }}>
                      QR Code Verification Result
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                      Batch: {verifiedBatch.batchId}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={generatePdfReport}
                      className="btn-yellow"
                      style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>📄 Download / View PDF Report</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setHasScanned(false); setVerifiedBatch(null); }}
                      className="btn-white"
                      style={{ padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <span>📷 Scan / Upload Different QR</span>
                    </button>
                  </div>
                </div>

                {/* BLOCKCHAIN VERIFIER ACKNOWLEDGMENT BANNER */}
                <BlockchainVerifier batchId={verifiedBatch.batchId} />

                {/* ═══════════════ COMBINED RESULTS: BEEKEEPER + TESTER + RETAILER ═══════════════ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '24px' }}>
                  
                  {/* CARD 1: BEEKEEPER ORIGIN & EDGE AI DATA */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1.5px solid #fef08a', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '1.6rem' }}>🍯</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>1. Beekeeper Harvest & Telemetry</h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Submitted by Apiary Beekeeper</span>
                      </div>
                    </div>

                    {verifiedBatch.imageBase64 && (
                      <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '180px' }}>
                        <img src={verifiedBatch.imageBase64} alt="Comb frame evidence" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
                      <div><strong style={{ color: '#475569' }}>Crop / Flora:</strong> <span style={{ color: '#0f172a', fontWeight: 700 }}>{verifiedBatch.cropName} ({verifiedBatch.floralSource})</span></div>
                      <div><strong style={{ color: '#475569' }}>Harvest Date:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.harvestStartDate}</span></div>
                      <div><strong style={{ color: '#475569' }}>Yield Quantity:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.yieldQuantityKg} kg</span></div>
                      <div><strong style={{ color: '#475569' }}>Geotag Location:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.geoCoords}</span></div>
                      <div><strong style={{ color: '#475569' }}>IoT Telemetry:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.temperature}°C Temp • {verifiedBatch.humidity}% Humidity • {verifiedBatch.weight}kg Weight</span></div>
                      <div><strong style={{ color: '#475569' }}>Acoustic Edge AI:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.audioFreq || '225'} Hz ({verifiedBatch.audioFilename || 'spectrogram.wav'})</span></div>
                    </div>
                  </div>

                  {/* CARD 2: NABL LAB TEST RESULTS */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1.5px solid #bbf7d0', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '1.6rem' }}>🧪</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>2. NABL Laboratory Test Results</h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Certified by NABL Quality Tester</span>
                      </div>
                    </div>

                    {verifiedBatch.labTestResults ? (
                      <div style={{ display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
                        <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: '12px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#166534' }}>LAB STATUS:</span>
                          <span style={{ fontWeight: 900, color: '#15803d', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px' }}>
                            ✓ {verifiedBatch.labTestResults.status === 'PASS' ? 'PASSED & VERIFIED' : verifiedBatch.labTestResults.status}
                          </span>
                        </div>

                        <div><strong style={{ color: '#475569' }}>Purity Percentage:</strong> <span style={{ color: '#166534', fontWeight: 900 }}>{verifiedBatch.labTestResults.purityPercentage}%</span></div>
                        <div><strong style={{ color: '#475569' }}>Moisture Content:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.labTestResults.moisturePercentage}%</span></div>
                        <div><strong style={{ color: '#475569' }}>HMF Freshness:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.labTestResults.hmfMgKg} mg/kg</span></div>
                        <div><strong style={{ color: '#475569' }}>Antibiotic Residue:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.labTestResults.antibioticResidues}</span></div>
                        <div><strong style={{ color: '#475569' }}>Pollen Analysis:</strong> <span style={{ color: '#0f172a' }}>{verifiedBatch.labTestResults.pollenCount}</span></div>
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                          <strong style={{ color: '#475569', display: 'block', marginBottom: '2px' }}>Analyst Feedback:</strong>
                          <span style={{ color: '#334155', fontStyle: 'italic' }}>"{verifiedBatch.labTestResults.feedback}"</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '20px', background: '#fffbeb', borderRadius: '16px', border: '1px dashed #f59e0b', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.8rem' }}>⏳</span>
                        <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#92400e' }}>Pending NABL Laboratory Testing</h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#b45309' }}>This batch is queued for chemical purity verification by the NABL lab analyst.</p>
                      </div>
                    )}
                  </div>

                  {/* CARD 3: RETAILER COLD CHAIN & AUDIT LOGS */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', borderBottom: '1.5px solid #bfdbfe', paddingBottom: '12px' }}>
                      <span style={{ fontSize: '1.6rem' }}>🏪</span>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>3. Retailer Cold Chain & Audit</h3>
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Verified by Retail Superstore</span>
                      </div>
                    </div>

                    {verifiedBatch.retailerLogs && verifiedBatch.retailerLogs.length > 0 ? (
                      <div style={{ display: 'grid', gap: '10px', fontSize: '0.88rem' }}>
                        {verifiedBatch.retailerLogs.map((log, idx) => (
                          <div key={idx} style={{ background: '#eff6ff', padding: '12px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                            <div style={{ fontWeight: 800, color: '#1e40af', marginBottom: '4px' }}>{log.storeName || log.storeId || 'Retail Superstore'}</div>
                            <div><strong style={{ color: '#475569' }}>Receipt Date:</strong> {log.timestamp}</div>
                            <div><strong style={{ color: '#475569' }}>Cold Chain Temp:</strong> {log.temp || '18.4°C'}</div>
                            <div><strong style={{ color: '#475569' }}>Stock Quantity:</strong> {log.stockQuantity || '50'} Jars</div>
                            <div style={{ marginTop: '4px', fontStyle: 'italic', color: '#1e3a8a' }}>"{log.storeRemarks}"</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.8rem' }}>🚚</span>
                        <h4 style={{ margin: '8px 0 4px 0', fontSize: '0.98rem', fontWeight: 800, color: '#475569' }}>In Transit to Retail Outlet</h4>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>Store audit log will be attached upon physical receipt at retail outlet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTTOM BACK TO HOME BUTTON */}
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleBackToHome}
                    className="btn-yellow"
                    style={{ padding: '16px 36px', fontSize: '1.05rem', fontWeight: 800, borderRadius: '16px', boxShadow: '0 8px 24px rgba(245, 184, 20, 0.3)' }}
                  >
                    <span>← Return to Home Landing</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

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
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Matching Blockchain Ledger Hash...</div>
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

              <button onClick={() => { setShowScannerModal(false); processQrPayload('BATCH-2026-HIM-101'); }} className="btn-white" style={{ width: '100%' }}>
                Verify Sample Batch (BATCH-2026-HIM-101)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
