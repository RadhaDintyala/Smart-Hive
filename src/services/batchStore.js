// Unified Local & Server Batch Store for Smart Hive AI-IoT Blockchain
const STORAGE_KEY = 'sh_batches_v2';

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
    qrCodeDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BATCH-2026-HIM-101',
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
    qrCodeDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BATCH-2026-HIM-102',
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

export const getStoredBatches = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BATCHES));
      return INITIAL_BATCHES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BATCHES;
  } catch (err) {
    console.error('Error reading stored batches:', err);
    return INITIAL_BATCHES;
  }
};

export const saveBatch = (newBatch) => {
  const current = getStoredBatches();
  if (!newBatch.qrCodeDataUrl) {
    newBatch.qrCodeDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(newBatch.batchId)}`;
  }
  const index = current.findIndex(b => b.batchId === newBatch.batchId);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...newBatch };
  } else {
    updated = [newBatch, ...current];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sh_batches_updated'));
  } catch (err) {
    console.error('Error saving batch to storage:', err);
  }
  return updated;
};

export const updateLabResults = (batchId, labResults) => {
  const current = getStoredBatches();
  const updated = current.map(b => {
    if (b.batchId === batchId) {
      return {
        ...b,
        labTestResults: {
          ...labResults,
          testedTimestamp: new Date().toISOString()
        }
      };
    }
    return b;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sh_batches_updated'));
  } catch (err) {
    console.error('Error updating lab results:', err);
  }
  return updated;
};

export const addRetailerLog = (batchId, logEntry) => {
  const current = getStoredBatches();
  const updated = current.map(b => {
    if (b.batchId === batchId) {
      const logs = b.retailerLogs || [];
      return {
        ...b,
        retailerLogs: [logEntry, ...logs]
      };
    }
    return b;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('sh_batches_updated'));
  } catch (err) {
    console.error('Error adding retailer log:', err);
  }
  return updated;
};

export const findBatchById = (batchId) => {
  const current = getStoredBatches();
  return current.find(b => b.batchId === batchId || b.batchIdCustom === batchId) || null;
};
