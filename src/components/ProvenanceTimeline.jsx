import React from 'react';

/**
 * Provenance timeline for a single batch.
 *
 * Scope contract: `steps` is built by `buildProvenanceTimeline(verifiedBatch)`
 * and therefore only ever contains records for the batch currently under
 * inspection. No cross-batch or global historic rows reach this component.
 *
 * @param {object} props
 * @param {import('../services/types').ProvenanceStep[]} props.steps
 * @param {string} props.batchId
 */
export default function ProvenanceTimeline({ steps, batchId }) {
  if (!steps || steps.length === 0) {
    return (
      <div
        style={{
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '16px',
          border: '1px dashed #cbd5e1',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '1.6rem' }}>🧾</span>
        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
          No provenance checkpoints are recorded for {batchId}.
        </p>
      </div>
    );
  }

  const ACTOR_ACCENT = {
    Beekeeper: { chip: '#fef3c7', ink: '#854d0e', icon: '🐝' },
    Laboratory: { chip: '#dcfce7', ink: '#166534', icon: '🧪' },
    Retailer: { chip: '#dbeafe', ink: '#1e40af', icon: '🏪' },
  };

  return (
    <div className="provenance-timeline" style={{ display: 'grid', gap: '14px' }}>
      {steps.map((step, idx) => {
        const accent = ACTOR_ACCENT[step.actor] || ACTOR_ACCENT.Beekeeper;
        const isLast = idx === steps.length - 1;

        return (
          <div key={step.key} style={{ display: 'grid', gridTemplateColumns: '32px 1fr', gap: '12px' }}>
            {/* Rail */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: accent.chip,
                  color: accent.ink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  border: `1px solid ${accent.ink}22`,
                }}
              >
                {accent.icon}
              </span>
              {!isLast && (
                <span
                  style={{
                    flex: 1,
                    width: '2px',
                    minHeight: '18px',
                    background: 'linear-gradient(to bottom, rgba(245,184,20,0.45), rgba(226,232,240,0.9))',
                    marginTop: '4px',
                  }}
                />
              )}
            </div>

            {/* Body */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px 16px',
                marginBottom: isLast ? 0 : '2px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: accent.chip,
                      color: accent.ink,
                      padding: '3px 9px',
                      borderRadius: '8px',
                    }}
                  >
                    {step.actor}
                  </span>
                  <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>{step.title}</strong>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                  {step.occurredAt}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px 16px', marginTop: '10px', fontSize: '0.82rem' }}>
                {step.facts.map((fact) => (
                  <div key={fact.label} style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>{fact.label}:</span>
                    <span style={{ color: '#0f172a' }}>{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
