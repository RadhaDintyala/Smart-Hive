import React, { useState, useEffect } from 'react';
import { getStoredBatches, updateLabResults } from '../services/batchStore';

export default function LabView({ authToken }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeStep, setActiveStep] = useState(1); // 1 = Inspect Farmer Details, 2 = Enter Test Results
  const [formData, setFormData] = useState({
    purityPercentage: '99.8',
    moisturePercentage: '17.1',
    hmfMgKg: '12.4',
    antibioticResidues: 'Not Detected (0.0 ppm)',
    pollenCount: 'Dense Alpine Acacia & Wild Flora Grains',
    feedback: 'Sample passes all NABL purity parameters. Grade A raw honey certified.',
    status: 'PASS'
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchBatches();
    const handleUpdate = () => fetchBatches();
    window.addEventListener('sh_batches_updated', handleUpdate);
    return () => window.removeEventListener('sh_batches_updated', handleUpdate);
  }, []);

  const fetchBatches = () => {
    const list = getStoredBatches();
    setBatches(list);
    if (list.length > 0) {
      if (!selectedBatch) {
        setSelectedBatch(list[0]);
      } else {
        const found = list.find(b => b.batchId === selectedBatch.batchId);
        if (found) setSelectedBatch(found);
      }
    }
  };

  const handleSelectBatch = (batch) => {
    setSelectedBatch(batch);
    setActiveStep(1); // Reset to Step 1 Farmer Details first
    setMsg('');
    if (batch.labTestResults) {
      setFormData({
        purityPercentage: batch.labTestResults.purityPercentage || '99.8',
        moisturePercentage: batch.labTestResults.moisturePercentage || '17.1',
        hmfMgKg: batch.labTestResults.hmfMgKg || '12.4',
        antibioticResidues: batch.labTestResults.antibioticResidues || 'Not Detected (0.0 ppm)',
        pollenCount: batch.labTestResults.pollenCount || 'Acacia & Wild Flora',
        feedback: batch.labTestResults.feedback || 'Passes purity standards',
        status: batch.labTestResults.status || 'PASS'
      });
    } else {
      setFormData({
        purityPercentage: '99.8',
        moisturePercentage: '17.1',
        hmfMgKg: '12.4',
        antibioticResidues: 'Not Detected (0.0 ppm)',
        pollenCount: 'Dense Alpine Acacia & Wild Flora Grains',
        feedback: 'Sample passes all NABL purity parameters. Grade A raw honey certified.',
        status: 'PASS'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setLoading(true);
    setMsg('');

    setTimeout(() => {
      const updatedList = updateLabResults(selectedBatch.batchId, formData);
      setBatches(updatedList);
      const updatedBatch = updatedList.find(b => b.batchId === selectedBatch.batchId);
      if (updatedBatch) setSelectedBatch(updatedBatch);

      setLoading(false);
      setMsg('✓ NABL Laboratory Certificate & Feedback Issued & Sealed to Ledger Successfully!');
    }, 600);
  };

  const isAlreadyTested = Boolean(selectedBatch?.labTestResults);

  return (
    <main className="app-container" style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
          🧪 Quality Testing & NABL Lab Portal
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '4px 0 0 0' }}>
          Verify Beekeeper harvest batches, execute laboratory chemical purity tests, and issue digital blockchain lab certificates.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* LEFT COLUMN: PENDING BATCHES QUEUE FROM BEEKEEPER */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📋 Batches Queue</span>
            <span style={{ fontSize: '0.78rem', background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '12px' }}>
              {batches.length} Registered
            </span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {batches.map((batch) => {
              const isSelected = selectedBatch?.batchId === batch.batchId;
              const isTested = Boolean(batch.labTestResults);

              return (
                <div
                  key={batch.batchId}
                  onClick={() => handleSelectBatch(batch)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: isSelected ? '2px solid #f5b814' : '1px solid #e2e8f0',
                    background: isSelected ? 'linear-gradient(135deg, #fefce8, #fef3c7)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 8px 20px rgba(245, 184, 20, 0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{batch.batchId}</strong>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: isTested ? '#dcfce7' : '#fef3c7',
                      color: isTested ? '#15803d' : '#92400e'
                    }}>
                      {isTested ? '✓ VERIFIED' : '⏳ PENDING LAB TEST'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#475569', fontWeight: 600 }}>
                    🌾 {batch.cropName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    👨‍🌾 Beekeeper: {batch.beekeeperName || 'Apiary Beekeeper'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: LAB TEST & VERIFICATION FORM */}
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}>
          {selectedBatch ? (
            <div>
              <div style={{ borderBottom: '1.5px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase' }}>
                    NABL Lab Verification Form
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    Batch ID: <strong>{selectedBatch.batchId}</strong>
                  </span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {selectedBatch.cropName}
                </h2>
              </div>

              {/* STEP 1 / 2 NAVIGATION TABS */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: activeStep === 1 ? '#f5b814' : '#f1f5f9',
                    color: activeStep === 1 ? '#0f172a' : '#64748b',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  1. Inspect Beekeeper Data
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '12px',
                    border: 'none',
                    background: activeStep === 2 ? '#f5b814' : '#f1f5f9',
                    color: activeStep === 2 ? '#0f172a' : '#64748b',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  2. Input Lab Results
                </button>
              </div>

              {activeStep === 1 ? (
                /* STEP 1: INSPECT BEEKEEPER HARVEST DATA */
                <div style={{ background: '#fafafa', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    🌾 Beekeeper Harvest Specs
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                    <div><strong>Floral Source:</strong> {selectedBatch.floralSource}</div>
                    <div><strong>Harvest Date:</strong> {selectedBatch.harvestStartDate}</div>
                    <div><strong>Yield:</strong> {selectedBatch.yieldQuantityKg} kg</div>
                    <div><strong>Geotag:</strong> {selectedBatch.geoCoords}</div>
                    <div><strong>IoT Hive Temp/Humidity:</strong> {selectedBatch.temperature}°C / {selectedBatch.humidity}%</div>
                    <div><strong>Acoustic Spectrogram:</strong> {selectedBatch.audioFilename || 'spectrogram.wav'} ({selectedBatch.audioFreq || '225'} Hz)</div>
                  </div>

                  {/* 📌 MATCHING BLOCKCHAIN QR CODE BADGE FOR LAB TESTER */}
                  <div style={{ marginTop: '16px', background: '#f0fdf4', padding: '14px', borderRadius: '14px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 900, color: '#166534', textTransform: 'uppercase', marginBottom: '6px' }}>
                      ✅ Blockchain QR Code Matched: Verified Beekeeper Batch
                    </div>
                    <img
                      src={selectedBatch.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(selectedBatch.batchId)}`}
                      alt="Batch QR Tag"
                      style={{ width: '140px', height: '140px', margin: '4px auto', borderRadius: '10px', border: '1px solid #bbf7d0', background: '#fff', padding: '6px' }}
                    />
                    <div style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, marginTop: '4px' }}>
                      QR Payload: <code>{selectedBatch.batchId}</code>
                    </div>
                  </div>

                  {selectedBatch.imageBase64 && (
                    <div style={{ marginTop: '16px' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: '6px' }}>Comb Photo Evidence:</strong>
                      <img src={selectedBatch.imageBase64} alt="Evidence" style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '12px' }} />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="btn-yellow"
                    style={{ width: '100%', marginTop: '20px', padding: '12px', fontSize: '0.9rem' }}
                  >
                    <span>Proceed to Enter Lab Test Parameters ➔</span>
                  </button>
                </div>
              ) : (
                /* STEP 2: INPUT LAB TEST PARAMETERS & SUBMIT VERIFICATION */
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Purity Percentage (%)
                      </label>
                      <input
                        type="text"
                        className="neo-input"
                        value={formData.purityPercentage}
                        onChange={e => setFormData({ ...formData, purityPercentage: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Moisture Content (%)
                      </label>
                      <input
                        type="text"
                        className="neo-input"
                        value={formData.moisturePercentage}
                        onChange={e => setFormData({ ...formData, moisturePercentage: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        HMF Level (mg/kg)
                      </label>
                      <input
                        type="text"
                        className="neo-input"
                        value={formData.hmfMgKg}
                        onChange={e => setFormData({ ...formData, hmfMgKg: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Antibiotic Residue Check
                      </label>
                      <input
                        type="text"
                        className="neo-input"
                        value={formData.antibioticResidues}
                        onChange={e => setFormData({ ...formData, antibioticResidues: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Pollen Grain Count & Flora Match
                    </label>
                    <input
                      type="text"
                      className="neo-input"
                      value={formData.pollenCount}
                      onChange={e => setFormData({ ...formData, pollenCount: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      NABL Analyst Certificate Remarks
                    </label>
                    <textarea
                      className="neo-input"
                      rows={3}
                      value={formData.feedback}
                      onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Verification Decision
                    </label>
                    <select
                      className="neo-input"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="PASS">✓ PASS - Certify Grade A Raw Honey</option>
                      <option value="REJECT">❌ REJECT - Adulteration or High Moisture</option>
                    </select>
                  </div>

                  {msg && (
                    <div style={{ padding: '12px', borderRadius: '12px', background: msg.includes('✓') ? '#dcfce7' : '#fee2e2', color: msg.includes('✓') ? '#166534' : '#991b1b', fontSize: '0.85rem', fontWeight: 700 }}>
                      {msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-yellow"
                    style={{ padding: '14px', fontSize: '1rem', fontWeight: 800, marginTop: '8px' }}
                  >
                    <span>{loading ? 'Sealing Certificate to Ledger...' : '📜 Issue Lab Certificate & Verify Batch'}</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              Select a batch from the queue on the left to inspect data and issue lab test results.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
