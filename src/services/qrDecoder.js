import jsQR from 'jsqr';
import { getStoredBatches } from './batchStore';

/**
 * Robustly extract a Batch ID from any decoded QR string or payload.
 *
 * Handles:
 * - Bare batch IDs: "BATCH-2026-HIM-101"
 * - Full verification URLs: "http://localhost:3000/consumer?batchId=BATCH-2026-HIM-101"
 * - PDF deep links: "http://host/pdf/BATCH-2026-HIM-101"
 * - QR server links: "https://api.qrserver.com/...data=..."
 * - JSON strings: '{"batchId": "BATCH-2026-HIM-101"}'
 * - Query strings: "?batchId=BATCH-2026-HIM-101" or "?id=BATCH-2026-HIM-101"
 * - Known batch ID regex patterns or direct matches against local/remote ledger
 *
 * @param {string} raw
 * @returns {string} Upper-cased Batch ID or trimmed string
 */
export function extractBatchId(raw) {
  if (!raw) return '';
  let text = String(raw).trim();
  if (!text) return '';

  // 1. Try URL decoding if double encoded (e.g. qrserver data param)
  if (text.includes('data=')) {
    try {
      const dataParam = text.split('data=')[1].split('&')[0];
      const decodedParam = decodeURIComponent(dataParam);
      if (decodedParam && decodedParam !== text) {
        const nested = extractBatchId(decodedParam);
        if (nested) return nested;
      }
    } catch {
      /* non-fatal */
    }
  }

  // 2. Try JSON parsing
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      const obj = JSON.parse(text);
      const candidates = [obj.batchId, obj.batchIdCustom, obj.id, obj.batch];
      for (const cand of candidates) {
        if (cand && typeof cand === 'string') return cand.trim().toUpperCase();
      }
    } catch {
      /* non-fatal */
    }
  }

  // 3. Try URL query parameter extraction (batchId, batch, id, code, b)
  if (text.includes('?')) {
    try {
      const queryString = text.split('?')[1].split('#')[0];
      const params = new URLSearchParams(queryString);
      for (const key of ['batchId', 'batch', 'id', 'batch_id', 'code', 'b']) {
        if (params.has(key)) {
          const val = params.get(key).trim();
          if (val) return val.toUpperCase();
        }
      }
    } catch {
      /* non-fatal */
    }
  }

  // 4. Try path extraction (/pdf/..., /consumer/..., /verify/...)
  if (text.includes('/pdf/')) {
    const part = text.split('/pdf/').pop().split(/[/?#]/)[0].trim();
    if (part) return part.toUpperCase();
  }
  if (text.includes('/consumer/')) {
    const part = text.split('/consumer/').pop().split(/[/?#]/)[0].trim();
    if (part) return part.toUpperCase();
  }
  if (text.includes('/verify/')) {
    const part = text.split('/verify/').pop().split(/[/?#]/)[0].trim();
    if (part) return part.toUpperCase();
  }

  // 5. Try regex matching for standard batch ID formats (e.g., BATCH-2026-HIM-101)
  const batchRegex = /\b(BATCH-[A-Z0-9-]+)\b/i;
  const match = text.match(batchRegex);
  if (match && match[1]) {
    return match[1].toUpperCase();
  }

  // 6. Check if text matches any registered batch ID or custom ID in the stored ledger
  try {
    const stored = getStoredBatches();
    const upperText = text.toUpperCase();
    const found = stored.find(
      (b) =>
        b.batchId.toUpperCase() === upperText ||
        (b.batchIdCustom && b.batchIdCustom.toUpperCase() === upperText)
    );
    if (found) return found.batchId;

    // Check substring match against known batch IDs
    const matchedStored = stored.find(
      (b) =>
        upperText.includes(b.batchId.toUpperCase()) ||
        (b.batchIdCustom && upperText.includes(b.batchIdCustom.toUpperCase()))
    );
    if (matchedStored) return matchedStored.batchId;
  } catch {
    /* non-fatal */
  }

  // 7. If it's a generic URL that failed all above parsers, try the last path segment
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const last = segments[segments.length - 1].trim();
        if (last && last.length > 2) return last.toUpperCase();
      }
    } catch {
      /* non-fatal */
    }
    return '';
  }

  return text.toUpperCase();
}

/**
 * Decodes QR code from an HTMLImageElement, File, or ImageBitmap using
 * native BarcodeDetector API (if available) with a fallback multi-resolution
 * canvas processing pipeline using jsQR.
 *
 * @param {HTMLImageElement} img
 * @returns {Promise<string>} Decoded QR code string
 */
export async function decodeQrFromImage(img) {
  // Method 1: Native BarcodeDetector (Supported in Chrome, Edge, Android, Safari with BarcodeDetector)
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await barcodeDetector.detect(img);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        const raw = barcodes[0].rawValue.trim();
        if (raw) return raw;
      }
    } catch (err) {
      console.warn('Native BarcodeDetector pass returned no result, proceeding to canvas pipeline:', err);
    }
  }

  // Method 2: Multi-resolution canvas sampling with jsQR
  const origW = img.naturalWidth || img.width;
  const origH = img.naturalHeight || img.height;

  if (!origW || !origH) {
    throw new Error('Invalid image dimensions.');
  }

  // Resolutions to try (Max Edge sizes).
  // High res phone photos (e.g. 4000px) often fail jsQR because finder patterns are too wide.
  // Downscaling to 1200, 800, 500, or 350 makes jsQR succeed on screenshots and photos.
  const targetSizes = [
    { w: origW, h: origH }, // Original
    ...[1200, 800, 500, 350]
      .filter((maxEdge) => Math.max(origW, origH) > maxEdge)
      .map((maxEdge) => {
        const scale = maxEdge / Math.max(origW, origH);
        return { w: Math.round(origW * scale), h: Math.round(origH * scale) };
      }),
  ];

  for (const size of targetSizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) continue;

    ctx.drawImage(img, 0, 0, size.w, size.h);
    const imageData = ctx.getImageData(0, 0, size.w, size.h);

    // Pass A: Normal jsQR with attemptBoth for inversion
    let code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (code && code.data && code.data.trim()) {
      return code.data.trim();
    }

    // Pass B: Contrast & Grayscale Enhancement (helps photos with poor lighting/shadows)
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const v = avg > 128 ? 255 : 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
    ctx.putImageData(imageData, 0, 0);
    const imageDataB = ctx.getImageData(0, 0, size.w, size.h);

    code = jsQR(imageDataB.data, imageDataB.width, imageDataB.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (code && code.data && code.data.trim()) {
      return code.data.trim();
    }
  }

  // Method 3: Center Crop Pass (70% region) in case the QR code is in the middle of a large background
  if (origW > 300 && origH > 300) {
    const cropW = Math.round(origW * 0.7);
    const cropH = Math.round(origH * 0.7);
    const cropX = Math.round((origW - cropW) / 2);
    const cropY = Math.round((origH - cropH) / 2);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = 600;
    cropCanvas.height = 600;
    const cropCtx = cropCanvas.getContext('2d', { willReadFrequently: true });
    if (cropCtx) {
      cropCtx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, 600, 600);
      const cropData = cropCtx.getImageData(0, 0, 600, 600);
      const code = jsQR(cropData.data, cropData.width, cropData.height, {
        inversionAttempts: 'attemptBoth',
      });
      if (code && code.data && code.data.trim()) {
        return code.data.trim();
      }
    }
  }

  throw new Error(
    'No QR code detected in the uploaded image. Please ensure the QR code is clear, well-lit, and visible in the screenshot or photo, or type the Batch ID manually.'
  );
}
