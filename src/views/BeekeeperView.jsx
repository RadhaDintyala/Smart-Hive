import React, { useState, useEffect } from 'react';
import { getStoredBatches, saveBatch } from '../services/batchStore';

export default function BeekeeperView({ authToken, currentUser }) {
  const [batches, setBatches] = useState([]);
  const [geoCoords, setGeoCoords] = useState('GPS: 30.3165° N, 78.0322° E (Dehradun Apiary)');
  const [activeStep, setActiveStep] = useState(1);
  const [viewMode, setViewMode] = useState('stepper'); // 'stepper' or 'all_sections'
  const [batchSearch, setBatchSearch] = useState('');

  // Start with clean empty fields - NO MOCK PRE-FILLED DATA
  const [formData, setFormData] = useState({
    batchIdCustom: '',
    cropName: '',
    floralSource: '',
    harvestStartDate: '',
    yieldQuantityKg: '',
    hiveId: '',
    temperature: '',
    humidity: '',
    weight: '',
    vocPpm: '',
    audioFilename: '',
    audioFreq: '',
    imageCaption: '',
    imageBase64: ''
  });

  const [imagePreview, setImagePreview] = useState('');
  const [generatedBatch, setGeneratedBatch] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBatches();
    const handleUpdate = () => fetchBatches();
    window.addEventListener('sh_batches_updated', handleUpdate);
    return () => window.removeEventListener('sh_batches_updated', handleUpdate);
  }, []);

  const fetchBatches = () => {
    const list = getStoredBatches();
    setBatches(list);
  };

  const handleCaptureLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoords(`GPS: ${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E`);
        },
        () => {
          setGeoCoords('GPS: 30.3165° N, 78.0322° E (Geotagged Apiary #4)');
        }
      );
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleCaptureLocation();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ 
          ...prev, 
          imageBase64: reader.result,
          imageCaption: prev.imageCaption || `Sealed honeycomb frame evidence - ${file.name}`
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        audioFilename: file.name,
        audioFreq: prev.audioFreq || '225'
      }));
    }
  };

  const generateAutoBatchId = () => {
    const randNum = Math.floor(100 + Math.random() * 900);
    const year = new Date().getFullYear();
    setFormData(prev => ({ ...prev, batchIdCustom: `BATCH-${year}-HIM-${randNum}` }));
  };

  const handleAutofillSample = () => {
    setFormData({
      batchIdCustom: `BATCH-2026-HIM-${Math.floor(100 + Math.random() * 900)}`,
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
      imageCaption: 'Sealed honeycomb frame prior to extraction',
      imageBase64: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80'
    });
    setImagePreview('https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80');
  };

  // STRICT VALIDATION: Ensure NO required fields are empty
  const validateAllSections = () => {
    // Step 1 Check
    if (!formData.cropName.trim() || !formData.floralSource.trim() || !formData.harvestStartDate.trim() || !formData.yieldQuantityKg.trim()) {
      setErrorMsg('⚠️ Incomplete Section 1: Please fill in Crop Name, Floral Source, Harvest Date, and Yield Quantity (kg).');
      setActiveStep(1);
      return false;
    }

    // Step 2 Check
    if (!formData.hiveId.trim() || !formData.temperature.trim() || !formData.humidity.trim() || !formData.weight.trim() || !formData.vocPpm.trim()) {
      setErrorMsg('⚠️ Incomplete Section 2: Please fill in Hive Identifier, Hive Temperature, Humidity, Net Weight, and VOC Gas Level.');
      setActiveStep(2);
      return false;
    }

    // Step 3 Check
    if (!formData.audioFilename.trim() && !formData.audioFreq.trim()) {
      setErrorMsg('⚠️ Incomplete Section 3: Please upload an Audio Spectrogram File or enter Vibrational Frequency.');
      setActiveStep(3);
      return false;
    }

    // Step 4 Check (Mandatory Comb Photo Evidence)
    if (!formData.imageBase64) {
      setErrorMsg('⚠️ Incomplete Section 4: Mandatory Comb Frame Photo Evidence is required before batch submission.');
      setActiveStep(4);
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Execute strict validation across all 4 sections
    if (!validateAllSections()) {
      return;
    }

    setLoading(true);

    const newBatchId = formData.batchIdCustom || `BATCH-${new Date().getFullYear()}-HIM-${Math.floor(100 + Math.random() * 900)}`;

    const newBatchObj = {
      batchId: newBatchId,
      cropName: formData.cropName,
      floralSource: formData.floralSource,
      harvestStartDate: formData.harvestStartDate,
      yieldQuantityKg: formData.yieldQuantityKg,
      hiveId: formData.hiveId,
      temperature: formData.temperature,
      humidity: formData.humidity,
      weight: formData.weight,
      vocPpm: formData.vocPpm,
      audioFilename: formData.audioFilename || 'spectrogram_audio.wav',
      audioFreq: formData.audioFreq || '225',
      imageCaption: `${formData.imageCaption || 'Sealed Comb Frame'} [Geotag: ${geoCoords}]`,
      imageBase64: formData.imageBase64,
      geoCoords,
      txHash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      createdTimestamp: new Date().toISOString(),
      beekeeperName: currentUser?.fullName || 'Farmer Rajendra Singh (Beekeeper)',
      labTestResults: null, // Pending Lab Test
      retailerLogs: []
    };

    setTimeout(() => {
      saveBatch(newBatchObj);
      setLoading(false);
      setSuccessMsg(`✓ Batch ${newBatchId} registered successfully & submitted to NABL Lab Tester Queue!`);
      setGeneratedBatch({
        batchId: newBatchId,
        qrCodeDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(newBatchId)}`
      });
      setActiveStep(5);
      fetchBatches();
    }, 600);
  };

  const filteredBatches = batches.filter(b => 
    b.batchId.toLowerCase().includes(batchSearch.toLowerCase()) ||
    (b.cropName || b.cropDetails?.cropName || '').toLowerCase().includes(batchSearch.toLowerCase())
  );

  const isStep1Done = Boolean(formData.cropName && formData.floralSource && formData.harvestStartDate && formData.yieldQuantityKg);
  const isStep2Done = Boolean(formData.hiveId && formData.temperature && formData.humidity && formData.weight && formData.vocPpm);
  const isStep3Done = Boolean(formData.audioFilename || formData.audioFreq);
  const isStep4Done = Boolean(formData.imageBase64);

  const calculateCompletionPercent = () => {
    let done = 0;
    if (isStep1Done) done++;
    if (isStep2Done) done++;
    if (isStep3Done) done++;
    if (isStep4Done) done++;
    return Math.round((done / 4) * 100);
  };

  return (
    <main className="app-container" style={{ paddingBottom: '60px' }}>
      {/* 🐝 BEEKEEPER APIARY SUMMARY HEADER CARDS */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>🐝</span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Beekeeper Harvest & Hive Dashboard
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.98rem', margin: '6px 0 0 0', fontWeight: 500 }}>
              Real-time hive health monitoring, acoustic metrics, and mandatory comb frame photo evidence geotagging.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-white" 
              onClick={handleCaptureLocation}
              style={{ fontSize: '0.85rem', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📍 <span>{geoCoords.split('(')[0]}</span>
            </button>
          </div>
        </div>

        {/* 3 GLASS SUMMARY STATS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginTop: '22px'
        }}>
          <div className="neo-card" style={{ padding: '20px', background: 'rgba(254, 240, 138, 0.45)', border: '1px solid rgba(245, 184, 20, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#854d0e', letterSpacing: '0.05em' }}>Total Hives</span>
              <span style={{ fontSize: '1.2rem' }}>🍯</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>48 Hives</div>
            <div style={{ fontSize: '0.8rem', color: '#713f12', marginTop: '4px', fontWeight: 600 }}>Himalayan Apiary Sector 4</div>
          </div>

          <div className="neo-card" style={{ padding: '20px', background: 'rgba(254, 226, 226, 0.45)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#991b1b', letterSpacing: '0.05em' }}>Infected Alert</span>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#dc2626', marginTop: '4px' }}>2 Hives</div>
            <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '4px', fontWeight: 600 }}>Foulbrood VOC alert (HIVE-08, HIVE-12)</div>
          </div>

          <div className="neo-card" style={{ padding: '20px', background: 'rgba(220, 252, 231, 0.45)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#166534', letterSpacing: '0.05em' }}>Active Production</span>
              <span style={{ fontSize: '1.2rem' }}>✨</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#15803d', marginTop: '4px' }}>46 Hives</div>
            <div style={{ fontSize: '0.8rem', color: '#166534', marginTop: '4px', fontWeight: 600 }}>Healthy comb status & high yield</div>
          </div>
        </div>
      </div>

      {/* 🤖 SUBSECTION: AI-ENABLED METRICS */}
      <div className="neo-card" style={{ marginBottom: '32px', background: 'rgba(248, 250, 252, 0.75)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h3 className="neo-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <span>🤖</span> AI-Enabled Hive Intelligence Metrics
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Real-time Edge AI Acoustic Spectrogram Analysis and Production Forecast:
            </p>
          </div>
          <span style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 800, border: '1px solid rgba(37, 99, 235, 0.25)' }}>
            ⚡ Edge AI Active
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(0,0,0,0.08)', padding: '18px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <span>🎵</span> Acoustic Audio Spectrum (225 Hz)
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Swarm Risk Level:</span>
                <span style={{ color: '#16a34a', fontWeight: 800, background: 'rgba(22, 163, 74, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>LOW (4.2%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Queen Bee Frequency:</span>
                <span style={{ color: '#d97706', fontWeight: 800 }}>Normal Flight Buzz</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Foulbrood Disease Signal:</span>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>CLEAN (0.1%)</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(0,0,0,0.08)', padding: '18px', borderRadius: '16px', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
              <span>📊</span> Honey Yield Forecast
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Projected Season Yield:</span>
                <span style={{ color: '#2563eb', fontWeight: 800 }}>124.5 kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Flow Rate:</span>
                <span style={{ color: '#16a34a', fontWeight: 800 }}>+2.4 kg / day</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Optimal Harvest Date:</span>
                <span style={{ color: '#d97706', fontWeight: 800 }}>March 28, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ REDESIGNED FULL SCREEN CARD: REGISTER NEW HONEY BATCH ═══════════════ */}
      <div className="full-screen-batch-card" id="register-batch-card">
        {/* Card Header & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.6rem' }}>🍯</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Register New Honey Batch
              </h2>
              <span style={{ background: 'rgba(245, 184, 20, 0.2)', color: '#b45309', border: '1px solid rgba(245, 184, 20, 0.4)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800 }}>
                Full Screen Guided Mode
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
              All 4 sections must be completed by the beekeeper before cryptographic batch registration.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="btn-white"
              onClick={handleAutofillSample}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
              title="Click to fill sample demo values for fast testing"
            >
              ✨ Demo Sample Autofill
            </button>
            <div style={{ background: 'rgba(241, 245, 249, 0.8)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: '4px' }}>
              <button 
                type="button"
                onClick={() => setViewMode('stepper')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'stepper' ? '#ffffff' : 'transparent',
                  fontWeight: viewMode === 'stepper' ? 800 : 600,
                  fontSize: '0.8rem',
                  color: viewMode === 'stepper' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'stepper' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                📑 Step-by-Step
              </button>
              <button 
                type="button"
                onClick={() => setViewMode('all_sections')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'all_sections' ? '#ffffff' : 'transparent',
                  fontWeight: viewMode === 'all_sections' ? 800 : 600,
                  fontSize: '0.8rem',
                  color: viewMode === 'all_sections' ? '#0f172a' : '#64748b',
                  boxShadow: viewMode === 'all_sections' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer'
                }}
              >
                🔍 All Sections Grid
              </button>
            </div>
          </div>
        </div>

        {/* STEPPER HEADER NAV */}
        {viewMode === 'stepper' && (
          <div className="stepper-header-nav" style={{ marginBottom: '24px' }}>
            <div className={`stepper-pill ${activeStep === 1 ? 'active' : ''} ${isStep1Done ? 'done' : ''}`} onClick={() => setActiveStep(1)}>
              <span>{isStep1Done ? '✓' : '1'}</span>
              <span>🍯 1. Harvest & Flora</span>
            </div>
            <div className={`stepper-pill ${activeStep === 2 ? 'active' : ''} ${isStep2Done ? 'done' : ''}`} onClick={() => setActiveStep(2)}>
              <span>{isStep2Done ? '✓' : '2'}</span>
              <span>🐝 2. Hive Telemetry</span>
            </div>
            <div className={`stepper-pill ${activeStep === 3 ? 'active' : ''} ${isStep3Done ? 'done' : ''}`} onClick={() => setActiveStep(3)}>
              <span>{isStep3Done ? '✓' : '3'}</span>
              <span>🎵 3. Acoustic & Edge AI</span>
            </div>
            <div className={`stepper-pill ${activeStep === 4 ? 'active' : ''} ${isStep4Done ? 'done' : ''}`} onClick={() => setActiveStep(4)}>
              <span>{isStep4Done ? '✓' : '4'}</span>
              <span>📷 4. Photo Evidence</span>
            </div>
            <div className={`stepper-pill ${activeStep === 5 ? 'active' : ''}`} onClick={() => setActiveStep(5)}>
              <span>5</span>
              <span>⚡ 5. Review & QR Mint</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'stepper' ? '1fr 340px' : '1fr', gap: '24px' }}>
            
            {/* Left Column Form Input Fields */}
            <div>
              {/* SECTION 1 */}
              {(viewMode === 'all_sections' || activeStep === 1) && (
                <div className="glass-section-box" style={{ marginBottom: '20px' }}>
                  <div className="section-title">
                    <span>🍯</span>
                    <span>1. Harvest & Crop Flora Specs</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Custom Batch Number (Optional)
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" 
                          className="neo-input"
                          placeholder="e.g. BATCH-2026-HIM-101"
                          value={formData.batchIdCustom}
                          onChange={e => setFormData({ ...formData, batchIdCustom: e.target.value })}
                        />
                        <button type="button" className="btn-white" onClick={generateAutoBatchId} style={{ fontSize: '0.78rem', padding: '0 10px', whiteSpace: 'nowrap' }}>
                          Auto ID
                        </button>
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Crop / Flora Name *
                      </label>
                      <input 
                        type="text" 
                        className="neo-input"
                        placeholder="e.g. Wild Himalayan Mustard & Acacia"
                        value={formData.cropName}
                        onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Floral Source *
                      </label>
                      <input 
                        type="text" 
                        className="neo-input"
                        placeholder="e.g. Acacia & Alpine Wildflowers"
                        value={formData.floralSource}
                        onChange={e => setFormData({ ...formData, floralSource: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Harvest Date *
                      </label>
                      <input 
                        type="date" 
                        className="neo-input"
                        value={formData.harvestStartDate}
                        onChange={e => setFormData({ ...formData, harvestStartDate: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Yield Quantity (kg) *
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="neo-input"
                        placeholder="e.g. 150.0"
                        value={formData.yieldQuantityKg}
                        onChange={e => setFormData({ ...formData, yieldQuantityKg: e.target.value })}
                      />
                    </div>
                  </div>

                  {viewMode === 'stepper' && (
                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                      <button type="button" className="btn-yellow" onClick={() => setActiveStep(2)}>
                        Next: Hive Telemetry ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2 */}
              {(viewMode === 'all_sections' || activeStep === 2) && (
                <div className="glass-section-box" style={{ marginBottom: '20px' }}>
                  <div className="section-title">
                    <span>🐝</span>
                    <span>2. IoT Microclimate & Hive Sensor Telemetry</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Hive Identifier *
                      </label>
                      <input 
                        type="text" 
                        className="neo-input"
                        placeholder="e.g. HIVE-DEH-04"
                        value={formData.hiveId}
                        onChange={e => setFormData({ ...formData, hiveId: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Temperature (°C) *
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="neo-input"
                        placeholder="e.g. 34.2"
                        value={formData.temperature}
                        onChange={e => setFormData({ ...formData, temperature: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Humidity (%) *
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="neo-input"
                        placeholder="e.g. 62.0"
                        value={formData.humidity}
                        onChange={e => setFormData({ ...formData, humidity: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Net Comb Weight (kg) *
                      </label>
                      <input 
                        type="number" 
                        step="0.1"
                        className="neo-input"
                        placeholder="e.g. 48.5"
                        value={formData.weight}
                        onChange={e => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        VOC Gas Level (ppm) *
                      </label>
                      <input 
                        type="number" 
                        className="neo-input"
                        placeholder="e.g. 12"
                        value={formData.vocPpm}
                        onChange={e => setFormData({ ...formData, vocPpm: e.target.value })}
                      />
                    </div>
                  </div>

                  {viewMode === 'stepper' && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                      <button type="button" className="btn-white" onClick={() => setActiveStep(1)}>
                        ⬅ Back
                      </button>
                      <button type="button" className="btn-yellow" onClick={() => setActiveStep(3)}>
                        Next: Acoustic Edge AI ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3 */}
              {(viewMode === 'all_sections' || activeStep === 3) && (
                <div className="glass-section-box" style={{ marginBottom: '20px' }}>
                  <div className="section-title">
                    <span>🎵</span>
                    <span>3. Acoustic Audio Spectrogram & Edge AI</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Upload Beekeeper Audio File (.wav, .mp3)
                      </label>
                      <input 
                        type="file" 
                        accept="audio/*"
                        className="neo-input"
                        onChange={handleAudioFileChange}
                        style={{ padding: '6px' }}
                      />
                      {formData.audioFilename && (
                        <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
                          ✓ Audio Attached: {formData.audioFilename}
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Vibrational Frequency (Hz)
                      </label>
                      <input 
                        type="text" 
                        className="neo-input"
                        placeholder="e.g. 225 Hz (Swarm Risk Low)"
                        value={formData.audioFreq}
                        onChange={e => setFormData({ ...formData, audioFreq: e.target.value })}
                      />
                    </div>
                  </div>

                  {viewMode === 'stepper' && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                      <button type="button" className="btn-white" onClick={() => setActiveStep(2)}>
                        ⬅ Back
                      </button>
                      <button type="button" className="btn-yellow" onClick={() => setActiveStep(4)}>
                        Next: Mandatory Photo ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 4 */}
              {(viewMode === 'all_sections' || activeStep === 4) && (
                <div className="glass-section-box" style={{ marginBottom: '20px' }}>
                  <div className="section-title">
                    <span>📷</span>
                    <span>4. Mandatory Comb Frame Photo Evidence & Geotag</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Upload Comb Frame Image *
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="neo-input"
                        onChange={handleImageChange}
                        style={{ padding: '6px' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                        GPS Coordinates are automatically attached upon photo upload.
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Frame Evidence Caption
                      </label>
                      <input 
                        type="text" 
                        className="neo-input"
                        placeholder="e.g. Sealed honeycomb frame prior to extraction"
                        value={formData.imageCaption}
                        onChange={e => setFormData({ ...formData, imageCaption: e.target.value })}
                      />
                    </div>
                  </div>

                  {imagePreview && (
                    <div style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <img src={imagePreview} alt="Comb Preview" style={{ width: '120px', height: '90px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #f5b814' }} />
                      <div>
                        <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '0.88rem' }}>✓ Mandatory Comb Photo Geotagged</div>
                        <div style={{ fontSize: '0.78rem', color: '#475569' }}>Location: {geoCoords}</div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'stepper' && (
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                      <button type="button" className="btn-white" onClick={() => setActiveStep(3)}>
                        ⬅ Back
                      </button>
                      <button type="button" className="btn-yellow" onClick={() => setActiveStep(5)}>
                        Next: Review & Submit ➔
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5 */}
              {(viewMode === 'all_sections' || activeStep === 5) && (
                <div className="glass-section-box">
                  <div className="section-title">
                    <span>⚡</span>
                    <span>5. Final Review & QR Minting</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                      📋 Submission Checklist (No Mock Data Allowed)
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                      <div><strong>Crop Name:</strong> {formData.cropName || '❌ Missing'}</div>
                      <div><strong>Floral Source:</strong> {formData.floralSource || '❌ Missing'}</div>
                      <div><strong>Harvest Date:</strong> {formData.harvestStartDate || '❌ Missing'}</div>
                      <div><strong>Yield Quantity:</strong> {formData.yieldQuantityKg ? `${formData.yieldQuantityKg} kg` : '❌ Missing'}</div>
                      <div><strong>Hive ID / Temp:</strong> {formData.hiveId || '❌ Missing'} ({formData.temperature ? `${formData.temperature}°C` : '❌'})</div>
                      <div><strong>Photo Evidence:</strong> {formData.imageBase64 ? '✓ Uploaded & Geotagged' : '❌ Missing (Mandatory)'}</div>
                    </div>
                  </div>

                  {errorMsg && (
                    <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px' }}>
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div style={{ color: '#15803d', background: 'rgba(34, 197, 94, 0.12)', padding: '12px 16px', borderRadius: '12px', fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px' }}>
                      ✓ {successMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    {viewMode === 'stepper' && (
                      <button type="button" className="btn-white" onClick={() => setActiveStep(4)}>
                        ⬅ Back: Photo Evidence
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className="btn-yellow" 
                      style={{ flex: 1, fontSize: '1.05rem', padding: '16px' }} 
                      disabled={loading}
                    >
                      {loading ? 'Minting Ledger Records...' : '⚡ Submit Batch & Generate National QR Code'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Dynamic Batch Preview Widget */}
            {viewMode === 'stepper' && (
              <div>
                <div style={{ position: 'sticky', top: '90px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.9)', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>Live Certificate Preview</span>
                      <span style={{ fontSize: '0.72rem', background: '#fef08a', padding: '2px 8px', borderRadius: '10px', fontWeight: 800, color: '#854d0e' }}>
                        {calculateCompletionPercent()}% Complete
                      </span>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #fffdf0 100%)', border: '1px solid rgba(245, 184, 20, 0.3)', borderRadius: '14px', padding: '16px', boxShadow: '0 4px 16px rgba(245, 184, 20, 0.1)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706' }}>NATIONAL HONEY PROVENANCE</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: '4px 0 2px 0' }}>
                        {formData.cropName || '(Enter Crop Name)'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        Source: {formData.floralSource || '(Enter Floral Source)'}
                      </div>

                      <div style={{ margin: '12px 0', borderTop: '1px dashed rgba(0,0,0,0.1)', paddingTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Hive:</span><br />
                          <strong>{formData.hiveId || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Temp / Humidity:</span><br />
                          <strong>{formData.temperature || '--'}°C / {formData.humidity || '--'}%</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Harvest Yield:</span><br />
                          <strong>{formData.yieldQuantityKg ? `${formData.yieldQuantityKg} kg` : '--'}</strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>VOC Gas:</span><br />
                          <strong>{formData.vocPpm ? `${formData.vocPpm} ppm` : '--'}</strong>
                        </div>
                      </div>

                      {imagePreview ? (
                        <div style={{ marginTop: '8px' }}>
                          <img src={imagePreview} alt="Evidence Preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #000' }} />
                          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, marginTop: '2px' }}>✓ Geotagged Evidence Uploaded</div>
                        </div>
                      ) : (
                        <div style={{ background: 'rgba(0,0,0,0.03)', border: '1px dashed #cbd5e1', padding: '12px', borderRadius: '8px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                          📷 Photo Evidence Pending (Required)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* ════════════ MINTED QR CODE SUCCESS CARD (POST-SUBMISSION) ════════════ */}
        {generatedBatch && (
          <div style={{ marginTop: '28px', background: 'rgba(255, 253, 240, 0.95)', border: '2px solid #f5b814', padding: '24px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 12px 40px rgba(245, 184, 20, 0.25)' }}>
            <div style={{ background: '#22c55e', color: '#fff', fontWeight: 900, padding: '6px 16px', borderRadius: '20px', display: 'inline-block', marginBottom: '12px', fontSize: '0.85rem' }}>
              ✓ BATCH REGISTERED & NATIONAL QR CODE MINTED
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '6px 0', color: '#0f172a' }}>
              BATCH ID: {generatedBatch.batchId}
            </h3>
            
            <a href={`/consumer?batchId=${encodeURIComponent(generatedBatch.batchId)}`} target="_blank" rel="noopener noreferrer">
              <img className="qr-img" src={generatedBatch.qrCodeDataUrl} alt="Batch QR Code" style={{ cursor: 'pointer', margin: '14px auto', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', padding: '8px', background: '#fff' }} />
            </a>

            <div style={{ marginTop: '18px' }}>
              <a 
                href={`/consumer?batchId=${encodeURIComponent(generatedBatch.batchId)}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-yellow" 
                style={{ display: 'inline-block', textDecoration: 'none', fontWeight: 800, padding: '12px 24px', fontSize: '0.95rem' }}
              >
                🔗 Open Generated Details Page (New Window)
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ════════════ YOUR REGISTERED HONEY BATCHES GRID WITH LAB TEST FEEDBACK ════════════ */}
      <div className="neo-card" style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h3 className="neo-card-title" style={{ margin: 0 }}>Your Registered Honey Batches & Lab Test Status</h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
              View tester verification feedback and digital NABL lab certificates for your uploaded batches.
            </p>
          </div>

          <div style={{ minWidth: '240px' }}>
            <input 
              type="text" 
              className="neo-input"
              placeholder="Search batches by ID or name..."
              value={batchSearch}
              onChange={e => setBatchSearch(e.target.value)}
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div id="bk-batches-list">
          {filteredBatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '0.9rem' }}>
              No registered honey batches found. Register your first batch above!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredBatches.map(b => {
                const lab = b.labTestResults;
                const isTested = Boolean(lab);

                return (
                  <div 
                    key={b.batchId} 
                    style={{
                      background: 'rgba(255, 255, 255, 0.88)',
                      border: isTested ? '2px solid #bbf7d0' : '1px solid rgba(0, 0, 0, 0.1)',
                      padding: '20px',
                      borderRadius: '20px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                      <a 
                        href={`/consumer?batchId=${encodeURIComponent(b.batchId)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#0f172a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.05rem', fontWeight: 900 }}
                        title="View batch details on public page"
                      >
                        <span>{b.batchId}</span>
                        <span style={{ fontSize: '0.85rem' }}>🔗</span>
                      </a>

                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        background: isTested ? (lab.status === 'PASS' ? '#dcfce7' : '#fee2e2') : '#fef3c7',
                        color: isTested ? (lab.status === 'PASS' ? '#15803d' : '#991b1b') : '#854d0e',
                        border: isTested ? (lab.status === 'PASS' ? '1px solid #86efac' : '1px solid #fca5a5') : '1px solid #fde047'
                      }}>
                        {isTested ? (lab.status === 'PASS' ? '✓ LAB VERIFIED' : '❌ LAB REJECTED') : '⏳ PENDING LAB TEST'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.92rem', marginTop: '10px', fontWeight: 800, color: '#1e293b' }}>
                      {b.cropName || b.cropDetails?.cropName || 'Wild Himalayan Honey'}
                    </div>

                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                      Floral Source: {b.floralSource || b.cropDetails?.floralSource || 'Alpine Flora'}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Harvest Date: {b.harvestStartDate || '2026-04-12'}</span>
                      <strong style={{ color: '#0f172a' }}>{b.yieldQuantityKg} kg</strong>
                    </div>

                    {/* NABL LAB TEST RESULT DETAILS ACKNOWLEDGMENT */}
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                      <strong style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        🧪 NABL Tester Verification Feedback:
                      </strong>

                      {isTested ? (
                        <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '0.82rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: 800, marginBottom: '4px' }}>
                            <span>Purity Score: {lab.purityPercentage}%</span>
                            <span>HMF: {lab.hmfMgKg} mg/kg</span>
                          </div>
                          <div style={{ color: '#15803d', fontStyle: 'italic', margin: '4px 0' }}>
                            "{lab.feedback}"
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>
                            Verified by: {lab.testerName || 'NABL Analyst'}
                          </div>
                        </div>
                      ) : (
                        <div style={{ background: '#fffbeb', padding: '10px 12px', borderRadius: '12px', border: '1px dashed #f59e0b', fontSize: '0.8rem', color: '#92400e' }}>
                          ⏳ Batch submitted to lab queue. Tester verification result will display here automatically once verified.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
