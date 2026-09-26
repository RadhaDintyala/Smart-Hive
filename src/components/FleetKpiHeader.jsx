import React from 'react';

/**
 * Fleet KPI summary header.
 *
 * Renders the three high-level operational counters above the beekeeper
 * workspace. Counts are derived from live batch state rather than hard-coded,
 * so the header stays truthful as the fleet changes.
 *
 * @param {object} props
 * @param {number} props.totalHives
 * @param {number} props.possibleInfected
 * @param {number} props.inProduction
 * @param {string} [props.sector]
 * @param {string} [props.infectedDetail]
 * @param {boolean} [props.isDegraded] True when AI verdicts fell back to heuristics.
 */
export default function FleetKpiHeader({
  totalHives,
  possibleInfected,
  inProduction,
  sector = 'Himalayan Apiary Sector 4',
  infectedDetail = 'Awaiting acoustic analysis',
  isDegraded = false,
}) {
  const CARDS = [
    {
      label: 'Total Hives:',
      value: totalHives,
      unit: 'Hives',
      icon: '🍯',
      tint: 'rgba(254, 240, 138, 0.45)',
      border: 'rgba(245, 184, 20, 0.4)',
      ink: '#0f172a',
      foot: sector,
    },
    {
      label: 'Possible Infected:',
      value: possibleInfected,
      unit: 'Hives',
      icon: '⚠️',
      tint: 'rgba(254, 226, 226, 0.45)',
      border: 'rgba(239, 68, 68, 0.3)',
      ink: '#dc2626',
      foot: infectedDetail,
    },
    {
      label: 'In Production:',
      value: inProduction,
      unit: 'Hives',
      icon: '✨',
      tint: 'rgba(220, 252, 231, 0.45)',
      border: 'rgba(34, 197, 94, 0.3)',
      ink: '#15803d',
      foot: 'Healthy comb status & high yield',
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginTop: '22px' }}>
      {CARDS.map((card) => (
        <div key={card.label} className="neo-card" style={{ padding: '20px', background: card.tint, border: `1px solid ${card.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#854d0e', letterSpacing: '0.05em' }}>
              {card.label}
            </span>
            <span style={{ fontSize: '1.2rem' }}>{card.icon}</span>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: card.ink, marginTop: '4px' }}>
            {card.value} <span style={{ fontSize: '1rem', fontWeight: 700 }}>{card.unit}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: card.ink === '#0f172a' ? '#713f12' : card.ink, marginTop: '4px', fontWeight: 600 }}>
            {card.foot}
          </div>
        </div>
      ))}

      {isDegraded && (
        <div style={{ gridColumn: '1 / -1', fontSize: '0.75rem', color: '#92400e', fontWeight: 700 }}>
          ⚠️ Edge model sidecar offline - infected count derived from the on-device VOC/acoustic heuristic.
        </div>
      )}
    </div>
  );
}
