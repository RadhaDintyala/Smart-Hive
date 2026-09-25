/**
 * Canonical unit formatting for volume and mass.
 *
 * The lineage registry previously printed raw store strings such as
 * "50" and "450", which made 750 ml indistinguishable from 750 kg. Every
 * quantity now passes through `formatMeasure` so a unit always ships
 * alongside the number. Single source of truth for the whole app (DRY).
 *
 * @module services/units
 */

/** @typedef {import('./types').Measure} Measure */

/** @type {Record<Measure['unit'], string>} */
const SYMBOLS = {
  ml: 'ml',
  l: 'L',
  g: 'g',
  kg: 'kg',
};

/** @type {Record<Measure['unit'], number>} */
const MASS_UNITS = { g: 1, kg: 1 };

/**
 * Coerce loosely-typed stored values ("1,250", 1250, "1250.0") to a finite
 * number. Returns null rather than NaN so callers can branch cleanly.
 *
 * @param {unknown} raw
 * @returns {number|null}
 */
export function toFiniteNumber(raw) {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== 'string') return null;
  const cleaned = raw.replace(/,/g, '').trim();
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Format a number for display: trims trailing zeros so 750 never renders as
 * "750.0", and caps at 2 decimals to keep pipeline columns scannable.
 *
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
}

/**
 * Build a display string with an explicit unit, e.g. "750 ml", "25 kg".
 * When the unit is omitted the value is returned bare - callers in the
 * retailer pipeline always pass an explicit unit.
 *
 * @param {number|string|null|undefined} value
 * @param {Measure['unit']} [unit]
 * @returns {string}
 */
export function formatMeasure(value, unit) {
  const n = toFiniteNumber(value);
  if (n === null) return '—';
  if (!unit) return formatNumber(n);
  return `${formatNumber(n)} ${SYMBOLS[unit] || unit}`;
}

/**
 * Bulk-jar stock reads as a volume, not a mass. Retailers receive jars, so a
 * nominal 750 ml per jar is used unless the caller supplies an explicit
 * override (bulk shipments arrive as 25 kg).
 *
 * @param {number|string|null|undefined} jarCount
 * @param {number} [mlPerJar]
 * @returns {Measure}
 */
export function jarsToVolume(jarCount, mlPerJar = 750) {
  const n = toFiniteNumber(jarCount);
  if (n === null) return { value: 0, unit: 'ml' };
  return { value: n * mlPerJar, unit: 'ml' };
}

/**
 * Render a stored volume string such as "18.4°C" style values aside: given a
 * measure plus an optional legacy raw string, prefer the structured measure.
 *
 * @param {Measure|null} measure
 * @param {string} [fallback]
 * @returns {string}
 */
export function formatMeasureOrFallback(measure, fallback) {
  if (measure && toFiniteNumber(measure.value) !== null) {
    return formatMeasure(measure.value, measure.unit);
  }
  if (fallback && fallback.trim() !== '') return fallback;
  return '—';
}

export { MASS_UNITS, SYMBOLS };
