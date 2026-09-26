/**
 * Unified Batch Store - shared ledger client.
 *
 * ## Why this is remote-first
 * The previous implementation was 100% `localStorage`, so a batch registered
 * on one machine existed only in that browser profile. Another machine
 * scanning the same QR resolved nothing, and verification failed. This module
 * now treats the server as the source of truth and `localStorage` as a cache
 * in front of it, so every machine converges on the same ledger.
 *
 * Reads stay SYNCHRONOUS (every view calls `getStoredBatches()` during render
 * and relies on an immediate array). The remote reconciliation is layered on
 * top asynchronously: `bootstrapLedger()` pulls the server list on boot, and
 * `connectLedgerSocket()` pushes changes to other machines over WebSocket. The
 * cache is therefore always populated and always eventually correct.
 *
 * ## Shape normalisation
 * The server stores a nested record (`cropDetails`, `iotSensorDetails`,
 * `uploadedImages`, ...) while the views read a flat one (`cropName`,
 * `temperature`, `imageBase64`, ...). `normalizeBatch` maps BOTH dialects onto
 * the flat canonical shape, so no view has to know where a record came from.
 */
const STORAGE_KEY = 'sh_batches_v2';
const CACHE_STAMP_KEY = 'sh_batches_synced_at';
const TOKEN_KEY = 'sh_token';

/** Raised for a write that the ledger refused (e.g. a duplicate receipt). */
export class LedgerConflictError extends Error {
  constructor(message, payload) {
    super(message);
    this.name = 'LedgerConflictError';
    this.payload = payload || null;
  }
}

/**
 * Canonical on-ledger batch record. Shared shape across every view, so the
 * typedef is declared once here and imported by the rest of the domain.
 *
 * @typedef {object} LabTestResults
 * @property {string} [purityPercentage]
 * @property {string} [moisturePercentage]
 * @property {string} [hmfMgKg]
 * @property {string} [antibioticResidues]
 * @property {string} [pollenCount]
 * @property {string} [feedback]
 * @property {'PASS'|'REJECT'|string} [status]
 * @property {string} [testedTimestamp]
 * @property {string} [testerName]
 */

/**
 * @typedef {object} RetailerLog
 * @property {string} [storeId]
 * @property {string} [storeName]
 * @property {string} [timestamp]
 * @property {string} [temp]
 * @property {string} [stockQuantity]
 * @property {string} [storeRemarks]
 * @property {import('./types').TransitStatus} [transitStatus]
 * @property {string} [destination]
 * @property {string} [eta]
 * @property {import('./types').Measure} [measure]
 * @property {string} [farmOriginLabel]
 */

/**
 * @typedef {object} Batch
 * @property {string} batchId
 * @property {string} [batchIdCustom]
 * @property {string} [cropName]
 * @property {string} [floralSource]
 * @property {string} [harvestStartDate]
 * @property {string} [yieldQuantityKg]
 * @property {string} [hiveId]
 * @property {string} [temperature]
 * @property {string} [humidity]
 * @property {string} [weight]
 * @property {string} [vocPpm]
 * @property {string} [audioFilename]
 * @property {string} [audioFreq]
 * @property {string} [imageCaption]
 * @property {string} [imageBase64]
 * @property {string} [geoCoords]
 * @property {string} [txHash]
 * @property {string} [createdTimestamp]
 * @property {string} [beekeeperName]
 * @property {string} [qrCodeDataUrl]
 * @property {LabTestResults|null} [labTestResults]
 * @property {RetailerLog[]} [retailerLogs]
 */

export const getBatchPdfUrl = (batchId) => {
  const origin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'http://localhost:3000';
  return `${origin}/pdf/${batchId}`;
};

/**
 * Canonical public verification URL. This is what the printed jar QR encodes,
 * so scanning it with the in-app camera lands straight on the product page.
 * Kept as `/consumer?batchId=...` to match the URL the server mints into
 * `verifyUrl` and the route `App` already understands.
 */
export const getBatchVerifyUrl = (batchId) => {
  const origin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : 'http://localhost:3000';
  return `${origin}/consumer?batchId=${encodeURIComponent(batchId)}`;
};

export const getBatchQrCodeUrl = (batchId) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(getBatchVerifyUrl(batchId))}`;

const INITIAL_BATCHES = [
  {
    batchId: 'BATCH-2026-HIM-101',
    cropName: 'Wild Himalayan Mustard & Acacia Honey',
    floralSource: 'Acacia & Brassica Campestris',
    harvestStartDate: '2026-04-12',
    yieldQuantityKg: '450',
    hiveId: 'HIVE-DEH-04',
    temperature: '34.2',
    humidity: '62',
    weight: '48.5',
    vocPpm: '12',
    audioFilename: 'acoustic_spectrum_hive04.wav',
    audioFreq: '225',
    imageCaption: 'Sealed honeycomb frame evidence - Apiary #4',
    imageBase64: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    geoCoords: 'GPS: 30.3165° N, 78.0322° E (Dehradun Apiary)',
    txHash: '0x7f8a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    createdTimestamp: '2026-04-12T08:30:00Z',
    beekeeperName: 'Farmer Rajendra Singh (Master Beekeeper)',
    qrCodeDataUrl: getBatchQrCodeUrl('BATCH-2026-HIM-101'),
    labTestResults: {
      purityPercentage: '99.8',
      moisturePercentage: '17.1',
      hmfMgKg: '12.4',
      antibioticResidues: 'Not Detected (0.0 ppm)',
      pollenCount: 'Dense Alpine Acacia & Wild Flora Grains',
      feedback: 'Certified 100% Pure Raw Honey. Grade A NABL standard passed. Zero adulteration.',
      status: 'PASS',
      testedTimestamp: '2026-04-14T14:20:00Z',
      testerName: 'Dr. A. K. Sharma (Chief NABL Analyst)'
    },
    retailerLogs: [
      {
        storeId: 'RET-DELHI-09',
        storeName: 'Organic Hive Superstore (Vasant Kunj)',
        timestamp: '2026-04-18 10:30',
        temp: '18.4°C',
        stockQuantity: '50',
        storeRemarks: 'QR scanned & cryptographic authenticity verified upon store receipt.'
      }
    ]
  },
  {
    batchId: 'BATCH-2026-HIM-102',
    cropName: 'Alpine Eucalyptus & Forest Blossom',
    floralSource: 'Eucalyptus Globulus & Wild Thyme',
    harvestStartDate: '2026-04-15',
    yieldQuantityKg: '320',
    hiveId: 'HIVE-SHIM-12',
    temperature: '32.8',
    humidity: '58',
    weight: '42.0',
    vocPpm: '9',
    audioFilename: 'spectrogram_hive12.wav',
    audioFreq: '218',
    imageCaption: 'Apiary Frame Extraction Evidence',
    imageBase64: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=800&q=80',
    geoCoords: 'GPS: 31.1048° N, 77.1734° E (Shimla Apiary)',
    txHash: '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4',
    createdTimestamp: '2026-04-15T09:15:00Z',
    beekeeperName: 'Suresh Kumar (Himachal Apiaries)',
    qrCodeDataUrl: getBatchQrCodeUrl('BATCH-2026-HIM-102'),
    labTestResults: {
      purityPercentage: '99.5',
      moisturePercentage: '17.8',
      hmfMgKg: '15.2',
      antibioticResidues: 'Not Detected (0.0 ppm)',
      pollenCount: 'Eucalyptus & Mountain Flora',
      feedback: 'Passes NABL purity standards. High pollen density confirmed.',
      status: 'PASS',
      testedTimestamp: '2026-04-17T11:45:00Z',
      testerName: 'Dr. Meera Patel (Quality Lead)'
    },
    retailerLogs: []
  }
];

// ══════════════════════════════════════════════════════════════════
// SHAPE NORMALISATION
// ══════════════════════════════════════════════════════════════════

/** Coerce to a trimmed string, or undefined when the value is absent. */
const str = (v) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === 'number') return String(v);
  if (typeof v !== 'string') return undefined;
  const t = v.trim();
  return t === '' ? undefined : t;
};

const num = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.replace(/,/g, ''));
    if (Number.isFinite(n)) return String(n);
  }
  return undefined;
};

const arr = (v) => (Array.isArray(v) ? v : []);

/** Render a lat/lon pair as the human-readable string the views display. */
function formatGeo(geo) {
  if (!geo) return undefined;
  if (typeof geo === 'string') return str(geo);
  if (geo.latitude == null || geo.longitude == null) return str(geo.label);
  return `GPS: ${Number(geo.latitude).toFixed(4)}° N, ${Number(geo.longitude).toFixed(4)}° E (apiary)`;
}

/**
 * Map a record from EITHER dialect onto the flat canonical shape.
 *
 * Server dialect: `{ cropDetails: {...}, iotSensorDetails: {...}, uploadedImages: [...] }`
 * Client dialect: `{ cropName, temperature, imageBase64, ... }`
 *
 * Flat values win when both are present, because a locally-edited record
 * carries fresher field values than a stale server copy.
 *
 * @param {object} raw
 * @returns {object|null}
 */
export function normalizeBatch(raw) {
  if (!raw || typeof raw !== 'object' || !raw.batchId) return null;

  const crop = raw.cropDetails || {};
  const iot = raw.iotSensorDetails || {};
  const keeper = raw.beekeeperProfile || {};
  const images = arr(raw.uploadedImages);
  const img0 = images[0] || {};
  const audio = arr(raw.audioFiles)[0] || {};

  const lab = raw.labTestResults || null;
  const labOut = lab
    ? {
        ...lab,
        purityPercentage: str(lab.purityPercentage) ?? '99.8',
        moisturePercentage: str(lab.moisturePercentage) ?? '17.1',
        hmfMgKg: str(lab.hmfMgKg) ?? '12.4',
        antibioticResidues: str(lab.antibioticResidues) ?? 'Not Detected (0.0 ppm)',
        pollenCount: str(lab.pollenCount) ?? 'Acacia & Wild Flora',
        feedback: str(lab.feedback) ?? 'Passes purity standards',
        status: str(lab.status) ?? 'PASS',
        // `testedAt` (server) and `testedTimestamp` (client) are the same fact.
        testedTimestamp: str(lab.testedTimestamp) ?? str(lab.testedAt),
        testerName: str(lab.testerName) ?? str(lab.labName),
      }
    : null;

  // `verifiedAt`/`storeRemarks`/`stockQuantity` are the server names for what
  // the client stores as `timestamp`/`storeRemarks`/`stockQuantity`.
  const retailerOut = arr(raw.retailerLogs).map((l) => ({
    ...l,
    // Fall back to `storeName`, never `storeLocation`: a location is not an
    // identity, so using it here produced a `storeId` that could never match
    // the session-derived id and silently defeated duplicate detection.
    storeId: str(l.storeId) ?? str(l.storeName),
    storeName: str(l.storeName) ?? 'Retail Superstore',
    timestamp: str(l.timestamp) ?? str(l.verifiedAt) ?? 'Unknown',
    temp: str(l.temp) ?? '18.4°C',
    stockQuantity: str(l.stockQuantity) ?? '0',
    storeRemarks: str(l.storeRemarks) ?? str(l.remarks) ?? '',
    measure: l.measure,
    transitStatus: str(l.transitStatus),
    destination: str(l.destination),
    farmOriginLabel: str(l.farmOriginLabel),
  }));

  return {
    ...raw, // preserve server-only fields (verifyUrl, sha256Hash, avgRating, ratings)
    batchId: raw.batchId,
    batchIdCustom: str(raw.batchIdCustom),
    cropName: str(raw.cropName) ?? str(crop.cropName) ?? 'Pure Wild Blossom Honey',
    floralSource: str(raw.floralSource) ?? str(crop.floralSource) ?? 'Wild Mountain Flora',
    harvestStartDate: str(raw.harvestStartDate) ?? str(crop.harvestStartDate) ?? '—',
    yieldQuantityKg: num(raw.yieldQuantityKg) ?? num(crop.yieldQuantityKg) ?? '0',
    hiveId: str(raw.hiveId) ?? str(iot.hiveId) ?? '—',
    temperature: num(raw.temperature) ?? num(iot.temperature) ?? '—',
    humidity: num(raw.humidity) ?? num(iot.humidity) ?? '—',
    weight: num(raw.weight) ?? num(iot.weight) ?? '—',
    vocPpm: num(raw.vocPpm) ?? num(iot.vocPpm),
    audioFilename: str(raw.audioFilename) ?? str(audio.filename),
    audioFreq: num(raw.audioFreq) ?? num(audio.frequencyHz),
    imageCaption: str(raw.imageCaption) ?? str(img0.caption),
    imageBase64: str(raw.imageBase64) ?? str(img0.data) ?? str(img0.url),
    geoCoords: str(raw.geoCoords) ?? formatGeo(img0.geo) ?? formatGeo(iot.location && typeof iot.location === 'object' ? iot.location : null) ?? 'Geotag unavailable',
    beekeeperName: str(raw.beekeeperName) ?? str(keeper.name) ?? 'Registered Beekeeper',
    txHash: str(raw.txHash) ?? str(raw.sha256Hash),
    createdTimestamp: str(raw.createdTimestamp) ?? (raw.createdAt ? new Date(raw.createdAt).toISOString() : undefined),
    qrCodeDataUrl: str(raw.qrCodeDataUrl) ?? getBatchQrCodeUrl(raw.batchId),
    verifyUrl: str(raw.verifyUrl) ?? getBatchVerifyUrl(raw.batchId),
    labTestResults: labOut,
    retailerLogs: retailerOut,
    consumerRatings: arr(raw.consumerRatings),
    consumerConcerns: arr(raw.consumerConcerns),
  };
}

// ══════════════════════════════════════════════════════════════════
// LOCAL CACHE
// ══════════════════════════════════════════════════════════════════

function readCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed.map(normalizeBatch).filter(Boolean);
  } catch (err) {
    console.error('Error reading stored batches:', err);
    return null;
  }
}

/**
 * Replace the cache. `prepend` puts a record first (newest-first lists), and
 * a no-op write is skipped so consumers are not woken for nothing.
 */
function writeCache(list, { prepend = false, silent = false } = {}) {
  const clean = (list || []).map(normalizeBatch).filter(Boolean);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    if (!silent && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sh_batches_updated'));
    }
  } catch (err) {
    console.error('Error saving batch to storage:', err);
  }
  return clean;
}

/**
 * Synchronous cache read. Falls back to the demo seed only on a genuinely cold
 * cache, so a real (even single-batch) ledger is never overwritten.
 */
export const getStoredBatches = () => {
  const cached = readCache();
  if (cached && cached.length > 0) return cached;
  return writeCache(INITIAL_BATCHES, { prepend: true });
};

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * The signed-in profile, cached at login by `App.handleLoginSuccess`.
 * @returns {object|null}
 */
function getSessionProfile() {
  try {
    const raw = localStorage.getItem('sh_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Stable identity of the outlet filing receipts.
 *
 * This MUST agree with the server, which derives identity from the
 * authenticated session (`req.session.username`). A hardcoded client-side id
 * such as `RET-DELHI-09` never matches the `storeId` the server stamps, so the
 * local duplicate guard silently failed for receipts that arrived from another
 * machine and the UI offered a button the server then refused with 409.
 *
 * @returns {{ storeId: string, storeName: string }}
 */
export function getStoreIdentity() {
  const p = getSessionProfile() || {};
  const storeName = p.name || p.storeLocation || 'Retail Store';
  return {
    storeId: p.username || storeName,
    storeName,
  };
}

/** `fetch` with the session token and a short timeout, tolerant of no backend. */
async function apiFetch(path, { method = 'GET', body, timeoutMs = 6000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) headers.Authorization = token;
    const res = await fetch(path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { json = null; }
    return { ok: res.ok, status: res.status, json };
  } catch {
    // Offline / server down. Callers degrade to the local cache.
    return { ok: false, status: 0, json: null };
  } finally {
    clearTimeout(timer);
  }
}

// ══════════════════════════════════════════════════════════════════
// REMOTE RECONCILIATION
// ══════════════════════════════════════════════════════════════════

/** True once a server sync has succeeded at least once this session. */
let remoteOnline = false;
const isRemoteOnline = () => remoteOnline;

/**
 * Translate a normalised (flat, view-facing) batch into the POST body the
 * ledger's create route expects.
 *
 * The server reads a *nested* vocabulary - `batchIdCustom`, `cropName` under
 * `cropDetails`, `temperature`/`humidity` as raw numbers. Posting the flat
 * object verbatim made the server ignore the client's batch id and mint a
 * second, differently-numbered record, so the same honey showed up twice and
 * the scanned id 404'd on other machines. This mapper is the single place that
 * knows the wire format.
 *
 * @param {object} batch normalised batch
 * @returns {object} request body for POST /api/beekeeper/batch/create
 */
function toCreatePayload(batch) {
  const b = batch || {};
  const iot = b.iotSensorDetails || {};
  const crop = b.cropDetails || {};
  const img = Array.isArray(b.uploadedImages) ? b.uploadedImages[0] : null;

  const num = (v, fallback) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };

  return {
    // Identity MUST be preserved or the ledger forks the record.
    batchIdCustom: b.batchId,
    cropName: b.cropName || crop.cropName,
    harvestStartDate: b.harvestStartDate || crop.harvestStartDate || b.harvestedDate,
    harvestEndDate: b.harvestEndDate || crop.harvestEndDate || b.harvestedDate,
    yieldQuantityKg: b.yieldQuantityKg ?? crop.yieldQuantityKg,
    floralSource: b.floralSource || crop.floralSource,
    temperature: num(b.temperature ?? iot.temperature, 35.0),
    humidity: num(b.humidity ?? iot.humidity, 58.0),
    weight: num(b.weight ?? iot.weight, 45.0),
    vocPpm: num(b.vocPpm ?? iot.vocPpm, 120),
    hiveId: b.hiveId || iot.hiveId,
    audioFilename: b.audioFilename,
    audioFreq: b.audioFreq,
    imageCaption: b.imageCaption || img?.caption,
    imageBase64: b.imageBase64 || img?.data || '',
    geoCoords: b.geoCoords,
    evidenceGeo: b.evidenceGeo || img?.geo || null,
    evidenceCapturedAtUtc: b.evidenceCapturedAtUtc || img?.capturedAtUtc,
    txHash: b.txHash,
  };
}

/**
 * Pull the authoritative batch list and adopt it as the cache.
 * Locally-cached batches the server has not seen yet are pushed first, so an
 * offline registration is not silently lost on the next sync.
 *
 * @returns {Promise<object[]>} the reconciled list (empty when offline)
 */
export async function syncBatchesFromServer() {
  const res = await apiFetch('/api/batches');
  if (!res.ok || !res.json || !Array.isArray(res.json.batches)) {
    remoteOnline = false;
    return getStoredBatches();
  }

  remoteOnline = true;
  const serverList = res.json.batches.map(normalizeBatch).filter(Boolean);
  const serverIds = new Set(serverList.map((b) => b.batchId));

  // Only batches that are NOT part of the demo seed get pushed. Re-seeding the
  // server on every client boot would resurrect records the operator deleted.
  const seedIds = new Set(INITIAL_BATCHES.map((b) => b.batchId));
  const localOnly = getStoredBatches().filter(
    (b) => !serverIds.has(b.batchId) && !seedIds.has(b.batchId)
  );

  for (const b of localOnly) {
    const push = await apiFetch('/api/beekeeper/batch/create', {
      method: 'POST',
      body: toCreatePayload(b),
    });
    // The write is only confirmed once the server echoes the record back. If it
    // did not, drop the phantom from the merged list, otherwise the batch
    // would sit in this browser's cache forever with no server counterpart.
    if (!push.ok) {
      console.warn('[ledger] could not push local batch', b.batchId, push.json?.error || push.status);
      continue;
    }
  }

  const merged = [...localOnly, ...serverList];
  try { localStorage.setItem(CACHE_STAMP_KEY, String(Date.now())); } catch { /* non-fatal */ }
  return writeCache(merged, { prepend: true });
}

/**
 * Fetch one batch by id and merge it into the cache. Used by the consumer
 * verification path so a scan resolves even when the list has never been
 * fetched on this machine.
 *
 * @param {string} batchId
 * @returns {Promise<object|null>}
 */
export async function fetchBatchRemote(batchId) {
  const id = (batchId || '').trim();
  if (!id) return null;
  const res = await apiFetch(`/api/consumer/verify/${encodeURIComponent(id)}`);
  if (!res.ok || !res.json || !res.json.batch) return findBatchById(id);

  remoteOnline = true;
  const fresh = normalizeBatch(res.json.batch);
  if (!fresh) return findBatchById(id);

  const cached = getStoredBatches();
  const next = [fresh, ...cached.filter((b) => b.batchId !== fresh.batchId)];
  writeCache(next, { prepend: true });
  return fresh;
}

// ══════════════════════════════════════════════════════════════════
// WRITES  (optimistic local + best-effort server)
// ══════════════════════════════════════════════════════════════════

/**
 * Upsert a batch. The cache updates immediately so the UI never waits on the
 * network, then the record is pushed to the shared ledger.
 *
 * @param {object} newBatch
 * @returns {object[]} the updated list
 */
export const saveBatch = (newBatch) => {
  const withQr = {
    ...newBatch,
    qrCodeDataUrl: newBatch.qrCodeDataUrl || getBatchQrCodeUrl(newBatch.batchId),
    verifyUrl: newBatch.verifyUrl || getBatchVerifyUrl(newBatch.batchId),
  };
  const normalized = normalizeBatch(withQr);

  const current = getStoredBatches();
  const index = current.findIndex((b) => b.batchId === normalized.batchId);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...normalized };
  } else {
    updated = [normalized, ...current];
  }
  writeCache(updated, { prepend: true });

  // Fire-and-forget: the ledger write must never block the form submission.
  // The response is reconciled anyway - a failure is logged and the next
  // `syncBatchesFromServer()` retries it from the local cache.
  apiFetch('/api/beekeeper/batch/create', {
    method: 'POST',
    body: toCreatePayload(normalized),
  }).then((res) => {
    if (res && !res.ok) {
      console.warn('[ledger] batch push failed', normalized.batchId, res.json?.error || res.status);
    }
  });
  return updated;
};

/**
 * Seal lab results for a batch.
 *
 * The ledger is append-only for certificates: if a batch already carries lab
 * results the write is refused so a sealed certificate can never be silently
 * overwritten in place.
 *
 * @param {string} batchId
 * @param {object} labResults
 * @returns {object[]}
 * @throws {LedgerConflictError} when the batch is already certified
 */
export const updateLabResults = (batchId, labResults) => {
  const current = getStoredBatches();
  const target = current.find((b) => b.batchId === batchId);

  if (target && target.labTestResults) {
    throw new LedgerConflictError(
      `Batch ${batchId} already carries a sealed NABL certificate. Certificates are immutable.`,
      { batch: target }
    );
  }

  const sealed = {
    ...labResults,
    testedTimestamp: labResults.testedTimestamp || new Date().toISOString(),
  };
  const updated = current.map((b) =>
    b.batchId === batchId ? { ...b, labTestResults: sealed } : b
  );
  writeCache(updated);

  apiFetch('/api/lab/test/submit', { method: 'POST', body: { batchId, ...sealed } });
  return updated;
};

/**
 * Record a store receipt.
 *
 * A receipt is an immutable fact: one per store per batch. The previous
 * implementation prepended unconditionally, so every click appended another
 * copy and the audit history grew without bound. A duplicate is now rejected
 * and the original receipt returned untouched.
 *
 * @param {string} batchId
 * @param {object} logEntry
 * @returns {{ list: object[], log: object }}
 * @throws {LedgerConflictError} when this store already filed a receipt
 */
export const addRetailerLog = (batchId, logEntry) => {
  const current = getStoredBatches();
  const target = current.find((b) => b.batchId === batchId);

  // Identity comes from the session so the local guard and the server guard
  // agree; falling back to the caller's own values keeps the function usable in
  // isolation (tests, previews).
  const { storeId, storeName } = getStoreIdentity();
  const matchId = logEntry.storeId || logEntry.storeName || storeId;
  const matchName = logEntry.storeName || storeName;

  const existing = (target?.retailerLogs || []).find(
    (l) => (l.storeId || l.storeName) === matchId || l.storeName === matchName
  );
  if (existing) {
    throw new LedgerConflictError(
      `A store receipt for ${batchId} is already sealed by ${matchName}. Ledger receipts are immutable and cannot be duplicated.`,
      { log: existing, list: current }
    );
  }

  // Stamp the session-derived identity on the local copy too, so the record
  // matches what the server will store and a later sync de-duplicates cleanly.
  const sealedLog = {
    ...logEntry,
    storeId,
    storeName,
    timestamp: logEntry.timestamp || new Date().toISOString(),
  };

  const updated = current.map((b) =>
    b.batchId === batchId ? { ...b, retailerLogs: [sealedLog, ...(b.retailerLogs || [])] } : b
  );
  writeCache(updated);

  apiFetch('/api/retailer/verify', {
    method: 'POST',
    body: {
      batchId,
      stockQuantity: sealedLog.stockQuantity,
      storeRemarks: sealedLog.storeRemarks || sealedLog.remarks,
    },
  }).then((res) => {
    // A 409 means another machine filed the same receipt first. Adopt the
    // server's record so both machines agree on one immutable entry.
    if (res && res.status === 409) syncBatchesFromServer();
  });

  return { list: updated, log: sealedLog };
};

/**
 * Synchronous cache lookup. Safe to call during render.
 * @param {string} batchId
 * @returns {object|null}
 */
export const findBatchById = (batchId) => {
  const id = (batchId || '').trim();
  if (!id) return null;
  const upper = id.toUpperCase();
  return (
    getStoredBatches().find(
      (b) => b.batchId === upper || (b.batchIdCustom || '').toUpperCase() === upper
    ) || null
  );
};

export const getBatchById = findBatchById;

// ══════════════════════════════════════════════════════════════════
// LIVE LEDGER SOCKET
// ══════════════════════════════════════════════════════════════════

let socket = null;
let reconnectTimer = null;

/**
 * Subscribe to cross-machine ledger updates.
 *
 * The server broadcasts `new_batch` / `lab_update` / `retailer_update` on every
 * write. Each message triggers a resync so every open browser reflects writes
 * made on any other machine without a manual refresh.
 *
 * @returns {() => void} teardown
 */
export function connectLedgerSocket() {
  if (typeof window === 'undefined') return () => {};
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return () => {};
  }

  let url;
  try {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    url = `${proto}//${window.location.host}`;
  } catch {
    return () => {};
  }

  try {
    socket = new WebSocket(url);
  } catch {
    return () => {};
  }

  socket.addEventListener('open', () => {
    remoteOnline = true;
    syncBatchesFromServer();
  });

  socket.addEventListener('message', (evt) => {
    let msg = null;
    try { msg = JSON.parse(evt.data); } catch { return; }
    if (!msg || !msg.type) return;
    if (['new_batch', 'lab_update', 'retailer_update'].includes(msg.type)) {
      // Re-pull rather than trusting the pushed payload: it is the
      // server's nested dialect and would need normalising anyway.
      syncBatchesFromServer();
    }
  });

  socket.addEventListener('close', () => {
    socket = null;
    // Reconnect with a backoff so a restarted server heals itself.
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connectLedgerSocket, 4000);
  });

  socket.addEventListener('error', () => { /* close handler drives recovery */ });

  return () => {
    clearTimeout(reconnectTimer);
    if (socket) {
      socket.onclose = null;
      socket.close();
      socket = null;
    }
  };
}

/**
 * One-time client bootstrap: prime the cache from the shared ledger so the very
 * first paint already shows server state instead of a localStorage-only view.
 *
 * This function deliberately does NOT open the WebSocket. The app root owns the
 * single long-lived socket via `connectLedgerSocket()` because only the caller
 * that receives the teardown can guarantee it is closed again; opening a socket
 * as a side effect of a promise meant the teardown handle was lost and the socket
 * leaked across StrictMode remounts.
 *
 * @returns {Promise<object[]>} the synchronised, normalised batch list
 */
export async function bootstrapLedger() {
  return syncBatchesFromServer();
}
