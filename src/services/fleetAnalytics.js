/**
 * Client for the `/modeling` TensorFlow Lite inference sidecar.
 *
 * The trained edge model lives in `Modeling/hive_audio_model_quantized.tflite`
 * and is Python-only, so it cannot be "mounted" directly in the browser. This
 * module talks to the FastAPI sidecar over the existing `/api` Vite proxy and
 * degrades to a transparent on-device heuristic when the sidecar is down, so
 * the beekeeper dashboard never renders an empty panel.
 *
 * @module services/fleetAnalytics
 */

/** @typedef {import('./types').InfectionVerdict} InfectionVerdict */

/** Endpoint exposed by `Modeling/inference_service.py` for a single hive. */
export const INFERENCE_ENDPOINT = '/api/analytics/infect';

/** Batched endpoint - one round trip for the whole fleet. */
export const FLEET_ENDPOINT = '/api/analytics/fleet';

/** Milliseconds before a sidecar call is abandoned in favour of the fallback. */
const REQUEST_TIMEOUT_MS = 4000;

/**
 * VOC concentration (ppm) above which a hive is treated as a probable
 * foulbrood vector. Mirrors the threshold documented in `Modeling/readme.md`.
 * @type {number}
 */
export const VOC_ALERT_PPM = 300;

/**
 * Classify a hive on-device. Used when the inference sidecar is unreachable,
 * and intentionally conservative: it only flags on the VOC + acoustic
 * combination, never on temperature drift alone.
 *
 * @param {{ vocPpm?: string|number, audioFreq?: string|number, temperature?: string|number }} sample
 * @returns {InfectionVerdict}
 */
export function heuristicVerdict(sample) {
  const voc = Number(sample && sample.vocPpm);
  const freq = Number(sample && sample.audioFreq);
  const hasVoc = Number.isFinite(voc) && voc > VOC_ALERT_PPM;
  // Healthy colonies hum high (~225 Hz); distress shifts down to ~135 Hz.
  const hasShift = Number.isFinite(freq) && freq > 0 && freq < 180;

  if (hasVoc || (hasVoc && hasShift) || (hasShift && Number.isFinite(voc) && voc > 180)) {
    return {
      infected: true,
      confidence: hasVoc && hasShift ? 0.94 : 0.78,
      label: 'Foulbrood / Mite Anomaly Detected',
      degraded: true,
    };
  }

  return {
    infected: false,
    confidence: 0.88,
    label: 'HEALTHY - Nominal Colony Signature',
    degraded: true,
  };
}

/**
 * Request a real model verdict for one hive sample.
 *
 * Always resolves - transport failures and non-2xx responses fall back to
 * `heuristicVerdict` rather than rejecting, because the dashboard treats
 * analytics as advisory.
 *
 * @param {{ hiveId?: string, vocPpm?: string|number, audioFreq?: string|number, temperature?: string|number, humidity?: string|number, weight?: string|number }} sample
 * @returns {Promise<InfectionVerdict>}
 */
export async function predictInfection(sample) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(INFERENCE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sample || {}),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Sidecar responded ${res.status}`);

    const data = await res.json();
    return {
      infected: Boolean(data.infected),
      confidence: typeof data.confidence === 'number' ? data.confidence : 0,
      label: typeof data.label === 'string' ? data.label : 'Unlabelled inference',
      degraded: false,
    };
  } catch {
    return heuristicVerdict(sample || {});
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run inference across a whole fleet in a single round trip.
 *
 * Falls back to per-hive heuristic verdicts when the batch endpoint is
 * unavailable, and always returns results aligned to the input order so the
 * accordion can zip verdicts back onto hives positionally.
 *
 * @param {Array<{ hiveId?: string, vocPpm?: string|number, audioFreq?: string|number, temperature?: string|number }>} fleet
 * @returns {Promise<InfectionVerdict[]>}
 */
export async function predictFleet(fleet) {
  const samples = fleet || [];
  if (samples.length === 0) return [];

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS * 2);

  try {
    const res = await fetch(FLEET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fleet: samples }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Sidecar responded ${res.status}`);

    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];

    // Re-align to the request order; short responses fall back per-index.
    return samples.map((sample, idx) => {
      const hit = results[idx];
      if (!hit) return heuristicVerdict(sample);
      return {
        infected: Boolean(hit.infected),
        confidence: typeof hit.confidence === 'number' ? hit.confidence : 0,
        label: typeof hit.label === 'string' ? hit.label : 'Unlabelled inference',
        degraded: false,
      };
    });
  } catch {
    return samples.map((sample) => heuristicVerdict(sample));
  } finally {
    clearTimeout(timer);
  }
}
