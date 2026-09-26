import React, { useState, useEffect, useMemo } from 'react';
import { getStoredBatches, addRetailerLog, findBatchById, getStoreIdentity, LedgerConflictError } from '../services/batchStore';
import TransitPipeline from '../components/TransitPipeline';
import BatchDetailsModal from '../components/BatchDetailsModal';
import { formatMeasure, jarsToVolume, formatMeasureOrFallback } from '../services/units';

export default function RetailerView({ authToken }) {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [modalBatch, setModalBatch] = useState(null);
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

  /**
   * A batch is "sealed" once THIS store has filed a receipt for it. A store
   * receipt is an immutable ledger fact - one per store per batch - so the form
   * is disabled for an already-sealed batch and the existing receipt is shown
   * read-only instead of appending a duplicate.
   */
  const existingReceipt = useMemo(() => {
    if (!selectedBatch) return null;
    const { storeId, storeName } = getStoreIdentity();
    return (selectedBatch.retailerLogs || []).find(
      (l) => (l.storeId || l.storeName) === storeId || l.storeName === storeName
    ) || null;
  }, [selectedBatch]);

  const isSealed = Boolean(existingReceipt);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch || isSealed) return;

    setLoading(true);
    setMsg('');

    const { storeName } = getStoreIdentity();

    const logEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      temp: '18.4°C',
      stockQuantity: stockQty,
      storeRemarks: remarks,
      // Structured units + transit state so the logistics board never has to
      // guess a bare number or a status.
      measure: jarsToVolume(stockQty),
      transitStatus: 'delivered',
      destination: storeName,
      farmOriginLabel: `${selectedBatch.beekeeperName || selectedBatch.floralSource} • ${selectedBatch.geoCoords || 'geotag unrecorded'}`
    };

    setTimeout(() => {
      try {
        const { list: updatedList } = addRetailerLog(selectedBatch.batchId, logEntry);
        setBatches(updatedList);
        const updatedBatch = updatedList.find(b => b.batchId === selectedBatch.batchId);
        if (updatedBatch) setSelectedBatch(updatedBatch);
        setMsg('✓ Store Receipt Audit Logged & Sealed to Ledger Successfully!');
      } catch (err) {
        // The store refused a duplicate receipt (e.g. another machine filed it
        // first). Surface the original receipt instead of writing a second one.
        if (err instanceof LedgerConflictError) {
          const fresh = findBatchById(selectedBatch.batchId);
          if (fresh) {
            setBatches(getStoredBatches());
            setSelectedBatch(fresh);
          }
          setMsg(`🔒 ${err.message}`);
        } else {
          setMsg('Could not seal the receipt. Please retry.');
        }
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const allLogs = batches.flatMap(b => (b.retailerLogs || []).map(log => ({ ...log, batchId: b.batchId })));

  /**
   * Derive the logistics board from the ledger. A batch with no store receipt
   * is still a shipment - it is in transit. Once a receipt exists, the receipt's
   * recorded transit status wins; older receipts fall back to `delivered` since
   * a logged receipt means the goods physically arrived.
   *
   * @type {import('../services/types').Shipment[]}
   */
  const shipments = useMemo(() => batches.map((batch) => {
    const latestLog = (batch.retailerLogs || [])[0];
    // Pre-receipt batches are bulk shipments measured in mass; once a store
    // receipt exists the jar count converts to a volume.
    const measure = latestLog
      ? (latestLog.measure || jarsToVolume(latestLog.stockQuantity))
      : { value: Number(batch.yieldQuantityKg) || 0, unit: 'kg' };

    return {
      batchId: batch.batchId,
      farmOriginLabel: (latestLog && latestLog.farmOriginLabel) || batch.beekeeperName || batch.floralSource,
      measure,
      status: (latestLog && latestLog.transitStatus) || (latestLog ? 'delivered' : 'in_transit'),
      destination: (latestLog && latestLog.destination) || 'Organic Hive Superstore (Vasant Kunj)',
      eta: (latestLog && latestLog.eta) || (latestLog ? undefined : 'Awaiting store intake'),
      note: latestLog ? latestLog.storeRemarks : `${batch.cropName} dispatched from ${batch.hiveId || 'apiary'}`,
    };
  }), [batches]);

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
              onClick={() => setActiveTab('pipeline')}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === 'pipeline' ? 'linear-gradient(135deg, #f5b814 0%, #e0a70f 100%)' : 'transparent',
                fontWeight: activeTab === 'pipeline' ? 800 : 600,
                fontSize: '0.85rem',
                color: activeTab === 'pipeline' ? '#0f172a' : '#475569',
                boxShadow: activeTab === 'pipeline' ? '0 4px 14px rgba(245, 184, 20, 0.3)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              🚚 Transit Pipeline
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
                  onClick={() => { setSelectedBatch(batch); setModalBatch(batch); }}
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

                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '4px' }}>
                      Origin: {batch.floralSource} • Geotag: {batch.geoCoords}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '12px' }}>
                      Lineage: harvest {formatMeasure(batch.yieldQuantityKg, 'kg')}
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
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Click card to view details modal</div>
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
                    onClick={(e) => { e.stopPropagation(); setSelectedBatch(batch); setActiveTab('audit_form'); }}
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

      {/* TAB: TRANSIT PIPELINE (3 FIXED COLUMNS) */}
      {activeTab === 'pipeline' && (
        <div className="glass-card" style={{ padding: '28px', borderRadius: '24px', background: 'rgba(255, 255, 255, 0.88)', backdropFilter: 'blur(20px)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0' }}>
            🚚 Shipment Transit Pipeline
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0 0 20px 0' }}>
            Every batch on the ledger appears in exactly one column. Quantities always carry an explicit unit.
          </p>
          <TransitPipeline shipments={shipments} />
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
            Each batch accepts exactly one receipt from this outlet - sealed receipts are immutable.
          </p>

          {isSealed && (
            <div style={{ padding: '14px', borderRadius: '14px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '0.85rem', fontWeight: 700, marginBottom: '18px' }}>
              🔒 A store receipt for <strong>{selectedBatch?.batchId}</strong> is already sealed by {existingReceipt.storeName}
              {' '}on {existingReceipt.timestamp}. Ledger receipts cannot be edited or duplicated.
            </div>
          )}

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
                {batches.map(b => {
                  const { storeId, storeName } = getStoreIdentity();
                  const sealed = (b.retailerLogs || []).some(
                    (l) => (l.storeId || l.storeName) === storeId || l.storeName === storeName
                  );
                  return (
                    <option key={b.batchId} value={b.batchId}>
                      {b.batchId} - {b.cropName} ({sealed ? '🔒 Receipt Sealed' : b.labTestResults ? '✓ NABL Passed' : 'Pending Lab'})
                    </option>
                  );
                })}
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
                  disabled={isSealed}
                  required
                />
                <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '4px', fontWeight: 700 }}>
                  = {formatMeasure(jarsToVolume(stockQty).value, 'ml')} total (nominal 750 ml per jar)
                </span>
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
                disabled={isSealed}
                required
              />
            </div>

            {isSealed && (
              <div style={{ padding: '14px', textAlign: 'center', borderRadius: '12px', background: '#f1f5f9', border: '1px dashed #cbd5e1', color: '#475569', fontSize: '0.85rem', fontWeight: 800 }}>
                ✓ Receipt Sealed — {formatMeasureOrFallback(existingReceipt.measure, `${existingReceipt.stockQuantity} jars`)} recorded
              </div>
            )}

            {msg && (
              <div style={{ padding: '12px', borderRadius: '12px', background: msg.includes('✓') ? '#dcfce7' : '#fee2e2', color: msg.includes('✓') ? '#166534' : '#991b1b', fontSize: '0.88rem', fontWeight: 700 }}>
                {msg}
              </div>
            )}

            {!isSealed && (
              <button
                type="submit"
                disabled={loading}
                className="btn-yellow"
                style={{ padding: '16px', fontSize: '1rem', fontWeight: 800, marginTop: '8px' }}
              >
                <span>{loading ? 'Logging Audit Receipt...' : '⚡ Register Store Audit to Blockchain Ledger'}</span>
              </button>
            )}
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
                      Receipt Date: {log.timestamp} • Stock Qty:{' '}
                      <strong style={{ color: '#0f172a' }}>
                        {formatMeasureOrFallback(
                          log.measure || jarsToVolume(log.stockQuantity),
                          `${log.stockQuantity} jars`
                        )}
                      </strong>
                      {log.measure ? '' : ` (${formatMeasure(log.stockQuantity)} jars)`}
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

      {/* Floating Batch Details Modal Dialog */}
      <BatchDetailsModal
        batch={modalBatch}
        onClose={() => setModalBatch(null)}
        onAction={(b) => { setSelectedBatch(b); setActiveTab('audit_form'); }}
        actionLabel="Log Audit Receipt"
      />
    </main>
  );
}
