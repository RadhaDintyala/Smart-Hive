/**
 * Per-device consumer scan history.
 *
 * The consumer verification viewport must show exactly one batch at a time,
 * so every confirmed scan is parked here and surfaced through a separate
 * lazily-mounted "Explore Previous Scans" tab instead of being rendered
 * inline alongside the active batch.
 *
 * @module services/scanHistory
 */

/** @typedef {import('./types').ProvenanceStep} ProvenanceStep */

const STORAGE_KEY = 'sh_scan_history_v1';
const MAX_ENTRIES = 25;

/**
 * @typedef {object} ScanEntry
 * @property {string} batchId
 * @property {string} scannedAtUtc
 * @property {boolean} verified
 * @property {string} [cropName]
 * @property {string} [beekeeperName]
 * @property {string} [puritySummary]
 * @property {ProvenanceStep[]} [steps]
 */

/** Guarded localStorage write - private-mode browsers must not throw. */
function write(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.warn('Scan history could not be persisted:', err);
  }
}

/**
 * Read the scan history, newest first. Corrupt payloads degrade to an empty
 * list rather than breaking the verification viewport.
 *
 * @returns {ScanEntry[]}
 */
export function getScanHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Record (or refresh) the history entry for a batch. Re-scanning the same
 * batch updates in place and moves it to the top instead of duplicating.
 *
 * @param {ScanEntry} entry
 * @returns {ScanEntry[]}
 */
export function recordScan(entry) {
  if (!entry || !entry.batchId) return getScanHistory();

  const existing = getScanHistory();
  const deduped = existing.filter((e) => e.batchId !== entry.batchId);
  const next = [entry, ...deduped].slice(0, MAX_ENTRIES);
  write(next);
  return next;
}

/**
 * Clear the entire consumer scan history.
 *
 * @returns {ScanEntry[]}
 */
export function clearScanHistory() {
  write([]);
  return [];
}
