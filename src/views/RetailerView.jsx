import React, { useState, useEffect } from 'react';
import { getStoredBatches, addRetailerLog } from '../services/batchStore';

export default function RetailerView({ authToken }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'audit_form', 'logs'
  const [stockQty, setStockQty] = useState('50');
  const [remarks, setRemarks] = useState('QR scanned & cryptographic authenticity verified upon store receipt.');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    fetchBatches();
    const handleUpdate = () => fetchBatches();
    window.addEventListener('sh_batches_updated', handleUpdate);
    return () => window.removeEventListener('sh_batches_updated', handleUpdate);
  }, []);

  const handleVerifyQrInput = (e) => {
    e.preventDefault();
    const target = (scanInput || '').trim();
    if (!target) return;
    const found = batches.find(b => b.batchId === target || b.batchIdCustom === target);
    if (found) {
      setSelectedBatch(found);
      setScanResult({ success: true, batch: found });
    } else {
      setScanResult({ success: false, error: `Batch "${target}" NOT found on Blockchain Ledger. Fake or untrusted QR code!` });
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setLoading(true);
    setMsg('');

    const logEntry = {
      storeId: 'RET-DELHI-09',
      storeName: 'Organic Hive Superstore (Vasant Kunj)',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      temp: '18.4°C',
      stockQuantity: stockQty,
      storeRemarks: remarks
    };

    setTimeout(() => {
      const updatedList = addRetailerLog(selectedBatch.batchId, logEntry);
      setBatches(updatedList);
      const updatedBatch = updatedList.find(b => b.batchId === selectedBatch.batchId);
      if (updatedBatch) setSelectedBatch(updatedBatch);

      setLoading(false);
      setMsg('✓ Store Receipt Audit Logged & Sealed to Ledger Successfully!');
    }, 600);
  };

  const allLogs = batches.flatMap(b => (b.retailerLogs || []).map(log => ({ ...log, batchId: b.batchId })));

  return (
    <main className="app-container" style={{ paddingBottom: '50px' }}>
      {/* 🏪 RETAILER PORTAL HEADER & STATS */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏪</span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Retailer Supply Chain Portal
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.95rem', margin: '4px 0 0 0', fontWeight: 500 }}>
              Track farm origin shipments, monitor live transit status, and log cryptographic store audit receipts.
            </p>
          </div>

          {/* TABBED NAVIGATION SEGMENT CONTROL */}
          <div style={{ background: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(16px)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('inventory')}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'inventory' ? 'linear-gradient(135deg, #f5b814 0%, #e0a70f 100%)' : 'transparent',
                fontWeight: activeTab === 'inventory' ? 800 : 600,
                fontSize: '0.85rem',
                color: activeTab === 'inventory' ? '#0f172a' : '#475569',
                boxShadow: activeTab === 'inventory' ? '0 4px 14px rgba(245, 184, 20, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📦 Verified Batches ({batches.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit_form')}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'audit_form' ? 'linear-gradient(135deg, #f5b814 0%, #e0a70f 100%)' : 'transparent',
                fontWeight: activeTab === 'audit_form' ? 800 : 600,
                fontSize: '0.85rem',
                color: activeTab === 'audit_form' ? '#0f172a' : '#475569',
                boxShadow: activeTab === 'audit_form' ? '0 4px 14px rgba(245, 184, 20, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📋 Log Store Audit
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'logs' ? 'linear-gradient(135deg, #f5b814 0%, #e0a70f 100%)' : 'transparent',
                fontWeight: activeTab === 'logs' ? 800 : 600,
                fontSize: '0.85rem',
                color: activeTab === 'logs' ? '#0f172a' : '#475569',
                boxShadow: activeTab === 'logs' ? '0 4px 14px rgba(245, 184, 20, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              📊 Audit History ({allLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: INVENTORY & SHIPMENT TRACKING */}
      {activeTab === 'inventory' && (
        <div>
          {/* RETAILER QR VERIFICATION SEARCH BAR */}
          <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '20px', marginBottom: '24px', background: 'rgba(255, 255, 255, 0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.4rem' }}>📱</span>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
                Retailer QR Code & Inventory Verification Scanner
              </h3>
            </div>
            <form onSubmit={handleVerifyQrInput} style={{ display: 'flex', gap: '10px', maxWidth: '600px' }}>
              <input
                type="text"
                className="neo-input"
                placeholder="Scan or enter delivery Batch ID (e.g. BATCH-2026-HIM-101)..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                style={{ flex: 1, padding: '12px 16px', fontSize: '0.9rem' }}
              />
              <button type="submit" className="btn-yellow" style={{ padding: '12px 20px', fontSize: '0.9rem', fontWeight: 800 }}>
                Verify Batch ➔
              </button>
            </form>

            {scanResult && (
              <div style={{ marginTop: '14px' }}>
                {scanResult.success ? (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: '14px', color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>
                    ✅ QR Code Verified & Matched! Batch <strong>{scanResult.batch.batchId}</strong> ({scanResult.batch.cropName}) is authentic and registered on the Blockchain.
                  </div>
                ) : (
                  <div style={{ background: '#fef2f2', border: '2px solid #ef4444', padding: '12px 16px', borderRadius: '14px', color: '#991b1b', fontWeight: 800, fontSize: '0.9rem' }}>
                    🚨 UNTRUSTWORTHY RETAIL SHIPMENT! {scanResult.error} Reject delivery.
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {batches.map((batch) => {
              const isSelected = selectedBatch?.batchId === batch.batchId;
              const lab = batch.labTestResults;
              const isTested = Boolean(lab);

              return (
                <div
                  key={batch.batchId}
                  onClick={() => setSelectedBatch(batch)}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: isSelected ? '2px solid #f5b814' : '1px solid rgba(255, 255, 255, 0.9)',
                    boxShadow: isSelected ? '0 10px 30px rgba(245, 184, 20, 0.2)' : '0 6px 20px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{batch.batchId}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '10px',
                      background: isTested ? '#dcfce7' : '#fef3c7',
                      color: isTested ? '#15803d' : '#92400e'
                    }}>
                      {isTested ? '✓ NABL CERTIFIED' : '⏳ PENDING LAB'}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                    {batch.cropName}
                  </div>

                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
                    Origin: {batch.floralSource} • Geotag: {batch.geoCoords}
                  </div>

                  {/* 📌 RETAILER MATCHING BATCH QR CODE TAG */}
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <img
                      src={batch.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(batch.batchId)}`}
                      alt="Retailer QR Tag"
                      style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#fff', border: '1px solid #cbd5e1', padding: '4px' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0f172a' }}>Verified QR Tag</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Scanned at store intake</div>
                    </div>
                  </div>

                  {isTested && (
                    <div style={{ background: '#f0fdf4', padding: '10px 12px', borderRadius: '12px', border: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#166534', marginBottom: '12px' }}>
                      <strong>Purity: {lab.purityPercentage}%</strong> • HMF: {lab.hmfMgKg} mg/kg • Fresh Grade A
                    </div>
                  )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Store Receipts: {batch.retailerLogs ? batch.retailerLogs.length : 0} Logged</span>
                  <button
                    type="button"
                    onClick={() => { setSelectedBatch(batch); setActiveTab('audit_form'); }}
                    className="btn-yellow"
                    style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                  >
                    Log Audit Receipt ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}

      {/* TAB 2: LOG STORE AUDIT FORM */}
      {activeTab === 'audit_form' && (
        <div className="glass-card" style={{ maxWidth: '680px', margin: '0 auto', padding: '32px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 8px 0' }}>
            📋 Log Retail Store Audit Receipt
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 24px 0' }}>
            Verify honey batch QR code upon delivery and register store stock inventory on the blockchain.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Select Received Batch *
              </label>
              <select
                className="neo-input"
                value={selectedBatch?.batchId || ''}
                onChange={e => {
                  const b = batches.find(item => item.batchId === e.target.value);
                  if (b) setSelectedBatch(b);
                }}
              >
                {batches.map(b => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchId} - {b.cropName} ({b.labTestResults ? '✓ NABL Passed' : 'Pending Lab'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Stock Quantity Received (Jars) *
                </label>
                <input
                  type="number"
                  className="neo-input"
                  value={stockQty}
                  onChange={e => setStockQty(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Cold Chain Temp (°C)
                </label>
                <input
                  type="text"
                  className="neo-input"
                  value="18.4°C (Optimal)"
                  disabled
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Retailer Audit Remarks & Condition Notes *
              </label>
              <textarea
                className="neo-input"
                rows={3}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                required
              />
            </div>

            {msg && (
              <div style={{ padding: '12px', borderRadius: '12px', background: msg.includes('✓') ? '#dcfce7' : '#fee2e2', color: msg.includes('✓') ? '#166534' : '#991b1b', fontSize: '0.88rem', fontWeight: 700 }}>
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-yellow"
              style={{ padding: '16px', fontSize: '1rem', fontWeight: 800, marginTop: '8px' }}
            >
              <span>{loading ? 'Logging Audit Receipt...' : '⚡ Register Store Audit to Blockchain Ledger'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: AUDIT HISTORY LOGS */}
      {activeTab === 'logs' && (
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 16px 0' }}>
            📊 Store Inventory Audit Logs
          </h2>

          {allLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No retailer store audit receipts logged yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {allLogs.map((log, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      Batch {log.batchId} • {log.storeName}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                      Receipt Date: {log.timestamp} • Stock Qty: {log.stockQuantity} Jars
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#334155', fontStyle: 'italic', marginTop: '4px' }}>
                      "{log.storeRemarks}"
                    </div>
                  </div>
                  <span style={{ fontSize: '0.78rem', background: '#dcfce7', color: '#166534', fontWeight: 800, padding: '4px 10px', borderRadius: '10px' }}>
                    ✓ LEDGER SEALED
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
