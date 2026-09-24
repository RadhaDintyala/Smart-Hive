import React, { useState, useEffect } from 'react';

export default function RetailerView({ authToken }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [stockQty, setStockQty] = useState('50');
  const [remarks, setRemarks] = useState('QR scanned & cryptographic authenticity verified upon store receipt.');
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
      const res = await fetch('/api/retailer/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authToken
        },
        body: JSON.stringify({
          batchId: selectedBatch.batchId,
          stockQuantity: stockQty,
          storeRemarks: remarks
        })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setMsg('✓ Retail Store Audit Logged Successfully!');
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
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900 }}>🏪 Retailer Batch Audit & Inventory Registry</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Select an incoming batch from the visual card grid below to log store receipt and verify cryptographic authenticity.
        </p>
      </div>

      <div className="neo-card" style={{ marginBottom: '24px' }} id="retailer-batch-cards-container">
        <h3 className="neo-card-title">📦 Step 1: Select Batch Received at Store</h3>
        <p className="neo-card-subtitle" style={{ marginBottom: '14px' }}>Click any batch card below to select it for store audit verification:</p>
        
        <div className="batch-cards-grid">
          {batches.map(b => (
            <div 
              key={b.batchId} 
              className={`batch-card ${selectedBatch?.batchId === b.batchId ? 'selected' : ''}`}
              onClick={() => setSelectedBatch(b)}
            >
              <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '4px' }}>{b.batchId}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>{b.cropDetails?.cropName}</div>
              <div style={{ fontSize: '0.78rem', color: '#666' }}>Status: {b.status}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2col">
        <div className="neo-card">
          <h3 className="neo-card-title">🏪 Step 2: Log Store Audit & Inventory</h3>
          <p style={{ fontSize: '0.85rem', color: '#555', marginBottom: '16px' }}>
            Target Batch Selected: <strong style={{ color: '#d97706', fontSize: '1.05rem' }}>{selectedBatch ? selectedBatch.batchId : 'None Selected'}</strong>
          </p>

          <form id="form-retailer-verify" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Store Stock Received (Units/Jars) *</label>
              <input 
                type="number" 
                className="neo-input" 
                value={stockQty} 
                onChange={e => setStockQty(e.target.value)} 
                required 
              />
            </div>

            <div className="form-group">
              <label>Retail Inventory Remarks *</label>
              <input 
                type="text" 
                className="neo-input" 
                value={remarks} 
                onChange={e => setRemarks(e.target.value)} 
                required 
              />
            </div>

            {msg && (
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: '14px', color: msg.startsWith('✓') ? 'var(--green-accent)' : 'var(--red-accent)' }}>
                {msg}
              </div>
            )}

            <button type="submit" className="btn-yellow" style={{ width: '100%', fontSize: '1.05rem' }} disabled={loading || !selectedBatch}>
              {loading ? 'Verifying...' : 'Verify Batch & Add to Store Logs'}
            </button>
          </form>
        </div>

        <div className="neo-card" id="retailer-logs-list">
          <h3 className="neo-card-title">📜 Store Verified Inventory Audit Logs</h3>
          <div>
            {batches.flatMap(b => (b.retailerLogs || []).map((log, idx) => (
              <div key={`${b.batchId}-${idx}`} style={{ background: '#fdfbf7', border: '2px solid #000', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                <strong style={{ display: 'block', fontSize: '0.9rem' }}>[{b.batchId}] {log.storeName}</strong>
                <span style={{ fontSize: '0.82rem', color: '#444' }}>Stock Quantity: {log.stockQuantity} Jars</span>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>"{log.remarks}"</p>
              </div>
            )))}
          </div>
        </div>
      </div>
    </main>
  );
}
