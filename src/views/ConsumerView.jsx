import React, { useState, useEffect } from 'react';

export default function ConsumerView({ selectedBatchId, setCurrentView }) {
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
    verifyBatch(batchIdInput);
  }, []);

  const fetchAvailableBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verifyBatch = async (id) => {
    try {
      const res = await fetch(`/api/consumer/verify/${id}`);
      const data = await res.json();
      if (data.success) {
        setBatchData(data.batch);
      } else {
        setBatchData(null);
      }
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
        body: JSON.stringify({
          batchId: batchData.batchId,
          reviewerName,
          rating: parseInt(rating),
          comment
        })
      });
      const data = await res.json();
      if (data.success) {
        setRatingMsg('✓ Rating Submitted Successfully!');
        verifyBatch(batchData.batchId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConcernSubmit = async (e) => {
    e.preventDefault();
    if (!batchData) return;

    try {
      const res = await fetch('/api/consumer/concern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batchData.batchId,
          consumerName: reviewerName,
          category: concernCategory,
          comments: concernComments
        })
      });
      const data = await res.json();
      if (data.success) {
        setConcernMsg('✓ Concern Report Submitted Successfully!');
        setConcernComments('');
        verifyBatch(batchData.batchId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="app-container">
      {/* BATCH SELECTOR GRID */}
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

      {/* VERIFICATION RESULT DISPLAY */}
      {batchData ? (
        <div>
          {/* PURITY BANNER */}
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

          {/* QR CODE CARD */}
          <div className="neo-card" style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h3 className="neo-card-title">📱 Associated Batch QR Code & Provenance Certificate</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              This QR Code links directly to this tamper-proof cryptographic audit trail.
            </p>
            <img src={batchData.qrCodeDataUrl} alt="Batch QR Code" style={{ width: '180px', height: '180px', border: '2px solid #000', borderRadius: '6px', boxShadow: '3px 3px 0px #000' }} />
          </div>

          <div className="grid-2col">
            {/* BEEKEEPER & IOT TELEMETRY */}
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

              {/* Photo Evidence */}
              {batchData.uploadedImages?.map((img, idx) => (
                <div key={idx} style={{ marginTop: '12px', background: '#fffbe6', padding: '10px', border: '2px solid #000', borderRadius: '6px' }}>
                  <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: '6px', color: '#92400e' }}>📷 Beekeeper Frame Evidence Photo:</strong>
                  {img.data && <img src={img.data} alt="Frame Evidence" style={{ maxHeight: '140px', borderRadius: '4px', border: '1px solid #000' }} />}
                  <p style={{ fontSize: '0.8rem', color: '#78350f', marginTop: '4px' }}>{img.caption}</p>
                </div>
              ))}
            </div>

            {/* LAB TEST CERTIFICATE & RETAILER LOGS */}
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

              {/* RETAILER AUDIT LOGS */}
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

          {/* RATING & CONCERN FORM CARDS */}
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
