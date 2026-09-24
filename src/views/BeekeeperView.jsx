import React, { useState, useEffect } from 'react';

export default function BeekeeperView({ authToken, currentUser }) {
  const [batches, setBatches] = useState([]);
  const [formData, setFormData] = useState({
    batchIdCustom: '',
    cropName: 'Wild Himalayan Mustard & Acacia Honey',
    floralSource: 'Wild Alpine Acacia Flora',
    harvestStartDate: '2026-03-20',
    yieldQuantityKg: '120.0',
    hiveId: 'HIVE-ALP-02',
    temperature: '35.2',
    humidity: '58.0',
    weight: '46.5',
    vocPpm: '115',
    audioFilename: 'spectrogram_hive_02.wav',
    audioFreq: '225',
    imageCaption: 'Sealed honeycomb frame evidence prior to extraction',
    imageBase64: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [generatedBatch, setGeneratedBatch] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, imageBase64: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.imageBase64) {
      setErrorMsg('Mandatory Photo Evidence Required: Please select a comb/frame photo evidence before submitting.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/beekeeper/batch/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessMsg(data.message);
        setGeneratedBatch(data.batch);
        fetchBatches();
      } else {
        setErrorMsg(data.error || 'Failed to register batch');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Network error registering batch');
    }
  };

  return (
    <main className="app-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🐝 Beekeeper Harvest & IoT Registry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Log IoT microclimate data, acoustics, comb photo evidence, and yield metrics for cryptographic batch verification.
        </p>
      </div>

      <div className="grid-2col">
        {/* BEEKEEPER BATCH FORM */}
        <div className="neo-card">
          <h3 className="neo-card-title">Register New Honey Batch</h3>
          <p className="neo-card-subtitle" style={{ marginBottom: '16px', color: '#b45309', fontWeight: 700 }}>
            * Photo Evidence is MANDATORY for batch registration.
          </p>

          <form id="form-beekeeper" onSubmit={handleSubmit}>
            {!formData.imageBase64 && (
              <div style={{ background: '#fef3c7', border: '2px solid #b45309', color: '#78350f', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontWeight: 700, fontSize: '0.88rem' }}>
                📢 <strong>Beekeeper Action Required:</strong> Please upload the mandatory comb frame photo evidence below to register this honey batch and generate its national QR code.
              </div>
            )}

            <div className="form-group">
              <label>Custom Batch Identifier (Optional)</label>
              <input 
                type="text" 
                className="neo-input" 
                placeholder="e.g. BATCH-2026-HIM-102"
                value={formData.batchIdCustom}
                onChange={e => setFormData({ ...formData, batchIdCustom: e.target.value })}
              />
            </div>

            <div className="form-row" id="bk-crop-name">
              <div className="form-group">
                <label>Crop Name / Honey Type *</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  value={formData.cropName}
                  onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Floral Source *</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  value={formData.floralSource}
                  onChange={e => setFormData({ ...formData, floralSource: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Harvest Start Date *</label>
                <input 
                  type="date" 
                  className="neo-input" 
                  value={formData.harvestStartDate}
                  onChange={e => setFormData({ ...formData, harvestStartDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Harvest Yield Quantity (kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.yieldQuantityKg}
                  onChange={e => setFormData({ ...formData, yieldQuantityKg: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row" id="bk-temp">
              <div className="form-group">
                <label>Hive Identifier *</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  value={formData.hiveId}
                  onChange={e => setFormData({ ...formData, hiveId: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hive Temperature (°C) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.temperature}
                  onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Hive Humidity (%) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.humidity}
                  onChange={e => setFormData({ ...formData, humidity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Hive Net Weight (kg) *</label>
                <input 
                  type="number" 
                  step="0.1" 
                  className="neo-input" 
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>VOC Gas Level (ppm) *</label>
              <input 
                type="number" 
                step="1" 
                className="neo-input" 
                value={formData.vocPpm}
                onChange={e => setFormData({ ...formData, vocPpm: e.target.value })}
                required
              />
            </div>

            <div className="form-row" id="bk-audio-filename">
              <div className="form-group">
                <label>Audio File Spectrogram Record</label>
                <input 
                  type="text" 
                  className="neo-input" 
                  value={formData.audioFilename}
                  onChange={e => setFormData({ ...formData, audioFilename: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Vibrational Frequency (Hz)</label>
                <input 
                  type="number" 
                  step="1" 
                  className="neo-input" 
                  value={formData.audioFreq}
                  onChange={e => setFormData({ ...formData, audioFreq: e.target.value })}
                />
              </div>
            </div>

            {/* MANDATORY IMAGE UPLOAD FIELD */}
            <div id="bk-image-file" className="form-group" style={{ background: '#fffbe6', padding: '16px', border: '2px dashed #000', borderRadius: '6px', marginBottom: '20px' }}>
              <label style={{ fontWeight: 900, color: '#92400e' }}>📷 Mandatory Frame / Comb Image Upload *</label>
              <p style={{ fontSize: '0.8rem', color: '#78350f', marginBottom: '8px' }}>
                Form submission is locked until photo evidence of the sealed comb frame is selected.
              </p>
              <input 
                type="file" 
                className="neo-input" 
                accept="image/*" 
                onChange={handleImageChange}
                required
                style={{ background: '#ffffff' }}
              />

              {imagePreview && (
                <div style={{ marginTop: '10px' }}>
                  <img src={imagePreview} alt="Frame Evidence Preview" style={{ maxHeight: '140px', border: '2px solid #000', borderRadius: '4px' }} />
                </div>
              )}

              <input 
                type="text" 
                className="neo-input" 
                placeholder="Image Caption e.g. Sealed honeycomb frame evidence"
                value={formData.imageCaption}
                onChange={e => setFormData({ ...formData, imageCaption: e.target.value })}
                style={{ marginTop: '8px' }}
              />
            </div>

            {errorMsg && (
              <div style={{ color: 'var(--red-accent)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            {successMsg && (
              <div style={{ color: 'var(--green-accent)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px' }}>
                ✓ {successMsg}
              </div>
            )}

            <button type="submit" className="btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Batch & Generate National QR Code'}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: GENERATED QR & BATCH LIST */}
        <div>
          {generatedBatch && (
            <div id="bk-qr-box" className="qr-card-box" style={{ background: '#fffdf0', border: '3px solid #000', padding: '20px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ background: '#22c55e', color: '#fff', fontWeight: 900, padding: '6px 12px', borderRadius: '4px', display: 'inline-block', marginBottom: '12px', fontSize: '0.85rem' }}>
                ✓ BATCH REGISTERED & QR GENERATED
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '6px 0' }}>BATCH ID: {generatedBatch.batchId}</h4>
              
              <a href={`/consumer?batchId=${encodeURIComponent(generatedBatch.batchId)}`} target="_blank" rel="noopener noreferrer" title="Click to open full provenance details on a new page">
                <img className="qr-img" src={generatedBatch.qrCodeDataUrl} alt="Batch QR Code" style={{ cursor: 'pointer', margin: '12px auto' }} />
              </a>

              <div className="hash-box" style={{ marginTop: '12px' }}>
                <span>SHA-256 Ledger Hash Signature:</span>
                <div style={{ color: '#d97706', marginTop: '4px', fontWeight: 700, wordBreak: 'break-all', fontSize: '0.75rem' }}>
                  {generatedBatch.sha256Hash}
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <a 
                  href={`/consumer?batchId=${encodeURIComponent(generatedBatch.batchId)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-yellow" 
                  style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontWeight: 800, padding: '10px 16px', fontSize: '0.95rem' }}
                >
                  🔗 Open Generated Details Page (New Window)
                </a>
              </div>
            </div>
          )}

          <div className="neo-card">
            <h3 className="neo-card-title">Your Registered Honey Batches</h3>
            <div id="bk-batches-list">
              {batches.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No registered batches found.</p>
              ) : (
                batches.map(b => (
                  <div key={b.batchId} style={{ background: '#fdfbf7', border: '2px solid #000', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <a 
                        href={`/consumer?batchId=${encodeURIComponent(b.batchId)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#000', textDecoration: 'underline' }}
                        title="View batch details on new page"
                      >
                        {b.batchId} 🔗
                      </a>
                      <span className={`badge-status ${b.status === 'FAILED_QUALITY_TEST' ? 'FAIL' : 'PASS'}`}>{b.status}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px', color: '#333' }}>
                      {b.cropDetails?.cropName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#666', marginTop: '2px' }}>
                      Harvested: {b.cropDetails?.harvestStartDate} | Yield: {b.cropDetails?.yieldQuantityKg} kg
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
