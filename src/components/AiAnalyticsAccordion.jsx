import React, { useCallback, useEffect, useState } from 'react';
import { predictFleet } from '../services/fleetAnalytics';

/**
 * Collapsible AI analytics subsection.
 *
 * Mounts the algorithms that live in `Modeling/` (a TensorFlow Lite 1D CNN,
 * served by the Python sidecar) and surfaces one verdict per hive. Sits as an
 * accordion directly beneath the fleet KPI header so the headline counters stay
 * dominant and the model detail is opt-in.
 *
 * Inference is only requested when the panel is first expanded - a closed
 * accordion performs no network calls.
 *
 * @param {object} props
 * @param {Array<{ hiveId?: string, vocPpm?: string|number, audioFreq?: string|number, temperature?: string|number, humidity?: string|number, weight?: string|number }>} props.fleet
 * @param {boolean} [props.isDegraded] Forwarded from the KPI header note.
 */
export default function AiAnalyticsAccordion({ fleet, isDegraded = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [verdicts, setVerdicts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runInference = useCallback(async () => {
    if (!fleet || fleet.length === 0) {
      setVerdicts([]);
      return;
    }
    setIsLoading(true);
    const results = await predictFleet(fleet);
    setVerdicts(results);
    setIsLoading(false);
  }, [fleet]);

  // Lazy: the sidecar is only contacted the first time the panel is opened.
  useEffect(() => {
    if (isOpen && verdicts === null) runInference();
  }, [isOpen, verdicts, runInference]);

  const degraded = isDegraded || (verdicts ? verdicts.some((v) => v.degraded) : false);

  return (
    <div
      className="neo-card"
      style={{ marginBottom: '32px', background: 'rgba(248, 250, 252, 0.75)', border: '1px solid rgba(15, 23, 42, 0.08)' }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div>
          <h3 className="neo-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <span>🤖</span> AI-Enabled Hive Intelligence
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Edge CNN acoustic inference over {fleet ? fleet.length : 0} hive telemetry packet(s)
          </p>
        </div>

        <span style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <span
            style={{
              background: 'rgba(37, 99, 235, 0.12)',
              color: '#2563eb',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: '1px solid rgba(37, 99, 235, 0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            {degraded ? '⚡ Edge AI (Fallback)' : '⚡ Edge AI Active'}
          </span>
          <span style={{ fontSize: '1.1rem', color: '#64748b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            ▾
          </span>
        </span>
      </button>

      {isOpen && (
        <div style={{ marginTop: '18px', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
          {isLoading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem', fontWeight: 700 }}>
              Running edge inference on hive spectrograms...
            </div>
          )}

          {!isLoading && verdicts && verdicts.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              No hive telemetry recorded yet. Register a batch to populate the fleet model.
            </div>
          )}

          {!isLoading && verdicts && verdicts.length > 0 && (
            <>
              {/* Fleet-level rollup, derived from live telemetry rather than
                  a static figure. Replaces the previously hard-coded forecast. */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  marginBottom: '18px',
                  padding: '14px 16px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '14px',
                }}
              >
                {(() => {
                  const weights = fleet.map((h) => Number(h.weight)).filter((w) => Number.isFinite(w) && w > 0);
                  const total = weights.reduce((a, b) => a + b, 0);
                  const healthyShare = fleet.length ? Math.round(((fleet.length - verdicts.filter((v) => v.infected).length) / fleet.length) * 100) : 0;
                  return (
                    <>
                      <div style={{ fontSize: '0.78rem' }}>
                        <span style={{ color: '#475569' }}>Projected Season Yield:</span>{' '}
                        <strong style={{ color: '#1d4ed8' }}>{total.toFixed(1)} kg</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem' }}>
                        <span style={{ color: '#475569' }}>Hives in Production:</span>{' '}
                        <strong style={{ color: '#15803d' }}>{fleet.length - verdicts.filter((v) => v.infected).length} / {fleet.length}</strong>
                      </div>
                      <div style={{ fontSize: '0.78rem' }}>
                        <span style={{ color: '#475569' }}>Colony Health Index:</span>{' '}
                        <strong style={{ color: healthyShare > 80 ? '#15803d' : '#b45309' }}>{healthyShare}%</strong>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {fleet.map((hive, idx) => {
                const verdict = verdicts[idx];
                if (!verdict) return null;
                const critical = verdict.infected;

                return (
                  <div
                    key={hive.hiveId || idx}
                    style={{
                      background: critical ? 'rgba(254, 242, 242, 0.9)' : 'rgba(240, 253, 244, 0.9)',
                      border: `1px solid ${critical ? '#fecaca' : '#bbf7d0'}`,
                      padding: '18px',
                      borderRadius: '16px',
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                      <span>{critical ? '⚠️' : '✅'}</span>
                      {hive.hiveId || `Hive ${idx + 1}`}
                    </div>

                    <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px', color: '#475569' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <span>Model verdict:</span>
                        <span style={{ color: critical ? '#b91c1c' : '#15803d', fontWeight: 800, textAlign: 'right' }}>
                          {verdict.label}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Confidence:</span>
                        <span style={{ color: '#0f172a', fontWeight: 800 }}>
                          {(verdict.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>VOC / Acoustic:</span>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>
                          {hive.vocPpm ?? '—'} ppm · {hive.audioFreq ?? '—'} Hz
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </>
          )}

          {degraded && (
            <div style={{ marginTop: '14px', fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>
              ⚠️ The <code>/modeling</code> inference sidecar is not responding. Verdict shown is the
              on-device VOC + acoustic heuristic fallback, not the trained CNN.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
