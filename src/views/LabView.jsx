import React, { useState, useEffect } from 'react';

export default function LabView({ authToken }) {
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

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await fetch('/api/batches');
      const data = await res.json();
      if (data.success) {
        setBatches(data.batches);
        if (data.batches.length > 0 && !selectedBatch) {
          setSelectedBatch(data.batches[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/lab/test/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          batchId: selectedBatch.batchId,
          ...formData
        })
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

      {/* BATCH CARDS SELECTION GRID */}
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
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                {b.cropDetails?.cropName}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>
                Beekeeper: {b.beekeeperProfile?.name}
              </div>
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
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.purityPercentage}
                  onChange={e => setFormData({ ...formData, purityPercentage: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Moisture Content (%) [Max 20%] *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.moisturePercentage}
                  onChange={e => setFormData({ ...formData, moisturePercentage: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>HMF Freshness (mg/kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.hmfMgKg}
                  onChange={e => setFormData({ ...formData, hmfMgKg: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Antibiotic Residues *</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  value={formData.antibioticResidues}
                  onChange={e => setFormData({ ...formData, antibioticResidues: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Pollen Analysis Signature *</label>
              <input 
                type="text" 
                className="neo-input" 
                value={formData.pollenCount}
                onChange={e => setFormData({ ...formData, pollenCount: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Quality Feedback to Beekeeper *</label>
              <textarea 
                id="lab-feedback"
                className="neo-input" 
                rows="3" 
                value={formData.feedback}
                onChange={e => setFormData({ ...formData, feedback: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Quality Status *</label>
              <select 
                className="neo-input" 
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PASS">PASS — Grade A Pure Honey Certified</option>
                <option value="FAIL">FAIL — Non-Compliant / Adulterated</option>
              </select>
            </div>

            {msg && (
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px', color: msg.startsWith('✓') ? 'var(--green-accent)' : 'var(--red-accent)' }}>
                {msg}
              </div>
            )}

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
