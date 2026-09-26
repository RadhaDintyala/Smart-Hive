import React from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, QrCode, MapPin, Calendar, Scale, Thermometer, Droplets, Activity, FileText, Store, Award } from 'lucide-react';

export default function BatchDetailsModal({ batch, onClose, onAction, actionLabel }) {
  if (!batch) return null;

  const lab = batch.labTestResults;
  const isLabVerified = Boolean(lab);
  const labPassed = lab?.status === 'PASS';
  const retailerLogs = batch.retailerLogs || [];

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="modal-dialog-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '24px 28px',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          position: 'relative'
        }}>
          <button 
            type="button"
            onClick={onClose}
            className="btn-modal-close"
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              color: '#ffffff',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '4px 10px',
              borderRadius: '12px',
              background: isLabVerified ? (labPassed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)') : 'rgba(245, 184, 20, 0.2)',
              color: isLabVerified ? (labPassed ? '#4ade80' : '#f87171') : '#fbbf24',
              border: `1px solid ${isLabVerified ? (labPassed ? '#22c55e' : '#ef4444') : '#f5b814'}`
            }}>
              {isLabVerified ? (labPassed ? '✓ NABL Certified Pure' : '❌ Lab Test Rejected') : '⏳ Pending Lab Test'}
            </span>
          </div>

          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.01em' }}>
            {batch.batchId}
          </h2>
          <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '4px', fontWeight: 600 }}>
            {batch.cropName || 'Wild Himalayan Organic Honey'}
          </div>
        </div>

        {/* Modal Body Content */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick QR Code & Origin Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '16px'
          }}>
            <img 
              src={batch.qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(batch.batchId)}`}
              alt="Batch QR Code"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '12px',
                background: '#ffffff',
                padding: '6px',
                border: '1px solid #cbd5e1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#d97706" /> {batch.geoCoords || 'Dehradun, Uttarakhand'}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a' }}>
                👨‍🌾 {batch.beekeeperName || 'Himalayan Apiary Beekeeper'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                🌸 Floral: <strong>{batch.floralSource || 'Wild Flora'}</strong>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                📅 Harvest: {batch.harvestStartDate || '2026-04-12'} • Yield: {batch.yieldQuantityKg || '450'} kg
              </div>
            </div>
          </div>

          {/* NABL Lab Certificate Section */}
          <div style={{
            background: isLabVerified ? (labPassed ? '#f0fdf4' : '#fef2f2') : '#fffbeb',
            border: `1px solid ${isLabVerified ? (labPassed ? '#bbf7d0' : '#fecaca') : '#fde68a'}`,
            borderRadius: '16px',
            padding: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.95rem', color: isLabVerified ? (labPassed ? '#166534' : '#991b1b') : '#92400e' }}>
                <Award size={18} />
                <span>NABL Laboratory Purity Verification</span>
              </div>
              {isLabVerified && (
                <span style={{ fontSize: '1.2rem', fontWeight: 900, color: labPassed ? '#15803d' : '#dc2626' }}>
                  {lab.purityPercentage}% Purity
                </span>
              )}
            </div>

            {isLabVerified ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>HMF Content</span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{lab.hmfMgKg} mg/kg</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Moisture</span>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{lab.moisturePercentage}%</strong>
                  </div>
                  <div style={{ background: '#ffffff', padding: '10px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Antibiotics</span>
                    <strong style={{ fontSize: '0.82rem', color: '#166534' }}>{lab.antibioticResidues || 'ND (Passed)'}</strong>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#334155', fontStyle: 'italic', background: 'rgba(255,255,255,0.7)', padding: '10px 12px', borderRadius: '10px' }}>
                  "{lab.feedback || 'Sample passes all NABL quality parameters.'}"
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#854d0e' }}>
                ⏳ This batch is queued for chemical analysis at the NABL lab. Results will update automatically.
              </div>
            )}
          </div>

          {/* IoT Smart Hive Telemetry */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#ffffff' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={16} color="#3b82f6" />
              <span>Smart-Hive IoT Telemetry &amp; Microclimate</span>
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Temp</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{batch.temperature || '34.2'}°C</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Humidity</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{batch.humidity || '62'}%</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Hive Wt</span>
                <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{batch.weight || '48.5'} kg</strong>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>VOC Sensor</span>
                <strong style={{ fontSize: '0.9rem', color: '#166534' }}>{batch.vocPpm || '12'} ppm</strong>
              </div>
            </div>
          </div>

          {/* Retailer Log History */}
          {retailerLogs.length > 0 && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '18px', background: '#ffffff' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={16} color="#10b981" />
                <span>Retail Outlet Intake Audit Receipts ({retailerLogs.length})</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {retailerLogs.map((log, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{log.storeName}</div>
                    <div style={{ color: '#64748b', marginTop: '2px' }}>
                      Intake Date: {log.timestamp} • Temp: {log.temp} • Quantity: {log.stockQuantity} jars
                    </div>
                    <div style={{ color: '#334155', fontStyle: 'italic', marginTop: '4px' }}>
                      "{log.storeRemarks}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          borderBottomLeftRadius: '24px',
          borderBottomRightRadius: '24px',
          display: 'flex',
          justify: 'flex-end',
          gap: '12px'
        }}>
          {onAction && (
            <button
              type="button"
              className="btn-yellow"
              onClick={() => {
                onAction(batch);
                onClose();
              }}
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
                fontWeight: 800,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {actionLabel || 'Action'} ➔
            </button>
          )}

          <button
            type="button"
            className="btn-white"
            onClick={() => window.open(`/pdf/${encodeURIComponent(batch.batchId)}`, '_blank')}
            style={{
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 800,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📄 View PDF Report
          </button>

          <button
            type="button"
            className="btn-white"
            onClick={onClose}
            style={{
              padding: '10px 22px',
              fontSize: '0.88rem',
              fontWeight: 800,
              borderRadius: '12px'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
