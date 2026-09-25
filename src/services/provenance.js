/**
 * Builds a single-batch provenance timeline.
 *
 * Scope rule: the consumer verification viewport renders ONLY the timeline for
 * the batch that was just scanned. Historic scans live in the separate
 * `scanHistory` store and are shown in a lazily-mounted tab, so cross-batch
 * rows can never leak into the active result.
 *
 * @module services/provenance
 */

/**
 * @typedef {object} TimelineInput
 * @property {ReturnType<import('./batchStore').getStoredBatches>[number]} [batch]
 */

/**
 * Flatten a batch's three stakeholder checkpoints into an ordered timeline.
 * Returns an empty array for a missing batch rather than throwing, so the
 * viewport can render an explicit "no provenance" state.
 *
 * @param {import('./batchStore').Batch|null|undefined} batch
 * @returns {import('./types').ProvenanceStep[]}
 */
export function buildProvenanceTimeline(batch) {
  if (!batch) return [];

  /** @type {import('./types').ProvenanceStep[]} */
  const steps = [];

  steps.push({
    key: `${batch.batchId}-beekeeper`,
    actor: 'Beekeeper',
    title: 'Harvest registered on ledger',
    occurredAt: batch.createdTimestamp || batch.harvestStartDate || '—',
    facts: [
      { label: 'Apiary / Beekeeper', value: batch.beekeeperName || 'Apiary Beekeeper' },
      { label: 'Floral origin', value: `${batch.cropName || '—'} (${batch.floralSource || '—'})` },
      { label: 'Harvest yield', value: batch.yieldQuantityKg ? `${batch.yieldQuantityKg} kg` : '—' },
      { label: 'Geotag', value: batch.geoCoords || '—' },
      { label: 'Hive telemetry', value: `${batch.temperature || '—'}°C · ${batch.humidity || '—'}% RH` },
      { label: 'Acoustic signature', value: `${batch.audioFreq || '—'} Hz` },
    ],
  });

  const lab = batch.labTestResults;
  if (lab) {
    steps.push({
      key: `${batch.batchId}-lab`,
      actor: 'Laboratory',
      title: lab.status === 'PASS' ? 'NABL certificate issued' : `NABL decision: ${lab.status || 'pending'}`,
      occurredAt: lab.testedTimestamp || '—',
      facts: [
        { label: 'Analyst', value: lab.testerName || 'NABL Analyst' },
        { label: 'Purity', value: lab.purityPercentage ? `${lab.purityPercentage}%` : '—' },
        { label: 'Moisture', value: lab.moisturePercentage ? `${lab.moisturePercentage}%` : '—' },
        { label: 'HMF', value: lab.hmfMgKg ? `${lab.hmfMgKg} mg/kg` : '—' },
        { label: 'Antibiotic residue', value: lab.antibioticResidues || '—' },
      ],
    });
  }

  const logs = Array.isArray(batch.retailerLogs) ? batch.retailerLogs : [];
  logs.forEach((log, idx) => {
    steps.push({
      key: `${batch.batchId}-retailer-${idx}`,
      actor: 'Retailer',
      title: 'Cold-chain receipt logged',
      occurredAt: log.timestamp || '—',
      facts: [
        { label: 'Outlet', value: log.storeName || log.storeId || 'Retail outlet' },
        { label: 'Cold chain', value: log.temp || '—' },
        { label: 'Stock verified', value: log.stockQuantity ? `${log.stockQuantity} units` : '—' },
        { label: 'Audit remarks', value: log.storeRemarks || '—' },
      ],
    });
  });

  return steps;
}

/**
 * One-line summary reused by the scan history list and the PDF header.
 *
 * @param {import('./batchStore').Batch|null|undefined} batch
 * @returns {string}
 */
export function summariseBatch(batch) {
  if (!batch) return 'Unverified batch';
  const lab = batch.labTestResults;
  const purity = lab && lab.purityPercentage ? `${lab.purityPercentage}% purity` : 'lab pending';
  const origin = batch.beekeeperName || 'unknown apiary';
  return `${origin} · ${purity}`;
}
