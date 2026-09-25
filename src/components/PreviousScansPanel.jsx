import React, { useState } from 'react';
import { getScanHistory, clearScanHistory } from '../services/scanHistory';

/**
 * "Explore Previous Scans" tab.
 *
 * Deliberately mounted through `React.lazy` in ConsumerView so the global
 * historic scan log is only fetched and rendered once the consumer actually
 * opens the tab. This is what keeps global rows off the active verification
 * viewport while still leaving them one click away.
 *
 * Reads from the `scanHistory` store rather than from the live batch list, so
 * the two concerns cannot drift.
 *
 * @param {object} props
 * @param {() => void} props.onSelectBatch  Jump back to a historic scan.
 */
export default function PreviousScansPanel({ onSelectBatch }) {
  const [entries, setEntries] = useState(() => getScanHistory());

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
        <span style={{ fontSize: '2.4rem' }}>🗂️</span>
        <h3 style={{ margin: '10px 0 4px 0', fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>
          No previous scans on this device
        </h3>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>
          Scanned batches are recorded locally so you can revisit their provenance timeline at any time.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 700 }}>
          {entries.length} historic scan{entries.length === 1 ? '' : 's'} stored on this device
        </span>
        <button
          type="button"
          className="btn-white"
          onClick={() => setEntries(clearScanHistory())}
          style={{ padding: '8px 14px', fontSize: '0.78rem' }}
        >
          Clear History
        </button>
      </div>

      {entries.map((entry) => (
        <button
          key={entry.batchId}
          type="button"
          onClick={() => onSelectBatch(entry.batchId)}
          style={{
            textAlign: 'left',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            background: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <span
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: entry.verified ? '#dcfce7' : '#fee2e2',
              fontSize: '0.95rem',
            }}
          >
            {entry.verified ? '✓' : '⚠️'}
          </span>

          <span style={{ display: 'grid', gap: '2px', minWidth: 0 }}>
            <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{entry.batchId}</strong>
            <span style={{ fontSize: '0.78rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.puritySummary || (entry.cropName ? entry.cropName : 'Unverified batch')}
            </span>
          </span>

          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
            {new Date(entry.scannedAtUtc).toLocaleDateString()}
          </span>
        </button>
      ))}
    </div>
  );
}
