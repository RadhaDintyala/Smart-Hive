import React, { useState } from 'react';

/**
 * Unified verification box.
 *
 * Groups the three consumer entry points - Honey Verification, Batch ID Input
 * and the QR Scanner - inside a single bordered card so the landing page and
 * the post-scan viewport present one consistent surface. Previously these three
 * controls were separate bordered blocks at different visual weights.
 *
 * Styling intentionally reuses the locked theme tokens (the `#f5b814` accent,
 * `neo-input`, `btn-yellow`, `btn-white`) rather than introducing new CSS.
 *
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {string} props.value             Current Batch ID input.
 * @param {(v: string) => void} props.onChange
 * @param {() => void} props.onSubmit      Invoked with the trimmed value.
 * @param {() => void} props.onScan        Opens the native QR scanner.
 * @param {string} [props.placeholder]
 * @param {string} [props.error]           Inline validation / lookup error.
 * @param {boolean} [props.compact]        Tightens padding for the result viewport.
 * @param {React.ReactNode} [props.footer] Extra actions (e.g. report controls).
 */
export default function VerificationCard({
  title,
  subtitle,
  value,
  onChange,
  onSubmit,
  onScan,
  placeholder = 'Enter Batch ID or paste QR payload (e.g. BATCH-2026-HIM-101)...',
  error = '',
  compact = false,
  footer = null,
}) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);

  const triggerScan = () => {
    setShowScanner(true);
    setScanning(true);
    onScan();
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  return (
    <section
      className="verification-card"
      style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid #f5b814',
        boxShadow: '0 12px 36px rgba(245, 184, 20, 0.18)',
        borderRadius: '20px',
        padding: compact ? '18px 20px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.6rem' }}>📱</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{title}</h3>
          {subtitle && (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {subtitle}
            </span>
          )}
        </div>
      </header>

      {/* Batch ID Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value && value.trim()) onSubmit(value.trim());
        }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          type="text"
          className="neo-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: compact ? '10px 14px' : '12px 16px', fontSize: '0.9rem' }}
        />
        <button
          type="submit"
          className="btn-yellow"
          style={{ padding: compact ? '10px 16px' : '12px 18px', fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap' }}
        >
          Verify Batch ➔
        </button>
      </form>

      {/* QR Scanner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <button
          type="button"
          className="btn-yellow"
          onClick={triggerScan}
          style={{ padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>📷 Camera QR Scanner</span>
        </button>
        <button
          type="button"
          className="btn-white"
          onClick={closeScanner}
          style={{ padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>{showScanner ? '✕ Close Scanner' : '⌨ Type Batch ID Above'}</span>
        </button>
      </div>

      {showScanner && (
        <div
          style={{
            background: '#000000',
            borderRadius: '16px',
            height: '220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {scanning ? (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }} className="animate-bounce">📱</div>
              <div style={{ fontWeight: 800, color: '#f5b814', fontSize: '0.95rem' }}>Scanning Honey Jar QR Code...</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Matching Ledger Hash...</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📷</div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Align QR Code within camera viewport</div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          {error}
        </div>
      )}

      {footer}
    </section>
  );
}
