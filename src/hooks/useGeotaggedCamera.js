import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @typedef {import('../services/types').GeoStamp} GeoStamp
 * @typedef {import('../services/types').EvidencePayload} EvidencePayload
 */

/**
 * Resolve the browser GPS fix as a plain, serialisable stamp.
 * Never rejects: a denied or unavailable sensor yields a stamp whose
 * `source` explains the gap so the ledger can still record the capture.
 *
 * @returns {Promise<GeoStamp>}
 */
function readGeoStamp() {
  return new Promise((resolve) => {
    const capturedAtUtc = new Date().toISOString();

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ latitude: null, longitude: null, accuracy: null, capturedAtUtc, source: 'unavailable' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAtUtc,
          source: 'gps',
        }),
      () =>
        resolve({ latitude: null, longitude: null, accuracy: null, capturedAtUtc, source: 'denied' }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  });
}

/**
 * Native camera capture engine for the beekeeper traceability flow.
 *
 * Replaces the gallery `<input type="file" accept="image/*">` path: it opens a
 * live `getUserMedia` stream, and on shutter writes the pixels plus the GPS fix
 * and UTC instant into a single `EvidencePayload`. The stream is always torn
 * down on unmount or close so the camera indicator light never stays on.
 *
 * The stream lifecycle is tracked in a ref rather than state because assigning
 * to state inside the cleanup path would re-enter the effect and leak tracks.
 *
 * @returns {{
 *   isSupported: boolean,
 *   isActive: boolean,
 *   isCapturing: boolean,
 *   error: string,
 *   preview: string,
 *   evidence: EvidencePayload|null,
 *   videoRef: import('react').RefObject<HTMLVideoElement>,
 *   start: () => Promise<void>,
 *   capture: () => Promise<EvidencePayload|null>,
 *   stop: () => void,
 *   reset: () => void,
 * }}
 */
export default function useGeotaggedCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState('');
  const [evidence, setEvidence] = useState(null);
  const [error, setError] = useState('');

  const isSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  /** Tear down the active media tracks. Safe to call when already stopped. */
  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  useEffect(() => stop, [stop]);

  /** Request the rear-facing camera and bind it to the preview element. */
  const start = useCallback(async () => {
    setError('');
    if (!isSupported) {
      setError('Camera capture is unavailable in this browser. Enable a secure (https) origin and camera permission.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsActive(true);

      // The <video> node may not be mounted yet on the first paint.
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      setIsActive(false);
      setError(
        err && err.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access to capture traceable comb evidence.'
          : 'Could not start the camera stream on this device.'
      );
    }
  }, [isSupported]);

  /**
   * Draw the current frame to a canvas and bind the GPS/UTC stamp onto the
   * resulting image payload. Returns null if the stream is not live.
   *
   * @returns {Promise<EvidencePayload|null>}
   */
  const capture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !streamRef.current) return null;

    setIsCapturing(true);
    try {
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 960;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2D canvas context unavailable');
      ctx.drawImage(video, 0, 0, width, height);

      const geo = await readGeoStamp();
      /** @type {EvidencePayload} */
      const payload = {
        dataUrl: canvas.toDataURL('image/jpeg', 0.85),
        caption: '',
        geo,
        capturedVia: 'camera',
      };

      setPreview(payload.dataUrl);
      setEvidence(payload);
      stop();
      return payload;
    } catch {
      setError('Frame capture failed. Please retry the photograph.');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [stop]);

  /** Discard the captured frame and return to a clean state. */
  const reset = useCallback(() => {
    setPreview('');
    setEvidence(null);
    setError('');
  }, []);

  return { isSupported, isActive, isCapturing, preview, evidence, error, videoRef, start, capture, stop, reset };
}
