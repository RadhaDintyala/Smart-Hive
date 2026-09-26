import React from 'react';
import { formatMeasure } from '../services/units';

/**
 * Retailer transit pipeline.
 *
 * Three explicit columns - In Transit, Delivered, Failed to Deliver. Every
 * column is always rendered, including empty ones, so the board reads as a
 * fixed pipeline rather than a list that reflows as statuses change.
 *
 * @typedef {import('../services/types').Shipment} Shipment
 */

/**
 * Column definition, kept as data so status -> column mapping has exactly one
 * definition and adding a status cannot drift out of sync with the header.
 * @type {Array<{ status: import('../services/types').TransitStatus, title: string, icon: string, tint: string, border: string, ink: string }>}
 */
export const PIPELINE_COLUMNS = [
  {
    status: 'in_transit',
    title: 'In Transit',
    icon: '🚚',
    tint: 'rgba(254, 243, 199, 0.75)',
    border: '#fde68a',
    ink: '#92400e',
  },
  {
    status: 'delivered',
    title: 'Delivered',
    icon: '✅',
    tint: 'rgba(220, 252, 231, 0.75)',
    border: '#bbf7d0',
    ink: '#166534',
  },
  {
    status: 'failed',
    title: 'Failed to Deliver',
    icon: '❌',
    tint: 'rgba(254, 226, 226, 0.75)',
    border: '#fecaca',
    ink: '#991b1b',
  },
];

/**
 * @param {object} props
 * @param {Shipment[]} props.shipments
 */
export default function TransitPipeline({ shipments }) {
  const list = shipments || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '18px', alignItems: 'start' }}>
      {PIPELINE_COLUMNS.map((col) => {
        const items = list.filter((s) => s.status === col.status);

        return (
          <section
            key={col.status}
            style={{
              background: col.tint,
              border: `1px solid ${col.border}`,
              borderRadius: '18px',
              padding: '16px',
              minWidth: 0,
            }}
          >
            <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '14px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 900, color: col.ink, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <span>{col.icon}</span>
                {col.title}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: col.ink, background: 'rgba(255,255,255,0.85)', padding: '2px 9px', borderRadius: '10px', border: `1px solid ${col.border}` }}>
                {items.length}
              </span>
            </header>

            {items.length === 0 ? (
              <div style={{ padding: '22px 10px', textAlign: 'center', fontSize: '0.78rem', color: col.ink, opacity: 0.7, border: `1px dashed ${col.border}`, borderRadius: '12px' }}>
                No shipments
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {items.map((item) => (
                  <article
                    key={item.batchId}
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid rgba(15, 23, 42, 0.07)',
                      borderRadius: '14px',
                      padding: '14px',
                      display: 'grid',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>{item.batchId}</strong>
                      <span style={{ fontSize: '0.82rem', fontWeight: 900, color: col.ink, whiteSpace: 'nowrap' }}>
                        {formatMeasure(item.measure && item.measure.value, item.measure && item.measure.unit)}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#475569', fontWeight: 700, overflowWrap: 'anywhere' }}>
                      🏡 {item.farmOriginLabel || 'Origin unrecorded'}
                    </div>

                    {item.destination && (
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        → {item.destination}
                      </div>
                    )}

                    {(item.eta || item.note) && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                        {item.eta && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: '8px' }}>
                            ETA {item.eta}
                          </span>
                        )}
                        {item.note && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>{item.note}</span>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
