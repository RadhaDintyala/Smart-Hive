import React, { useCallback, useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

/**
 * Live QR code scanner.
 *
 * Opens the rear-facing camera with `getUserMedia`, samples frames into an
 * offscreen canvas and decodes them with `jsQR`. The previous "Camera QR
 * Scanner" button was a placeholder that never touched the camera - it
 * immediately re-resolved whatever was already in the Batch ID field, which is
 * why clicking it appeared to "open the previous report".
 *
 * Decoding runs on a rAF loop but is throttled to ~10 fps: full-rate decoding
 * pins the CPU and drains the battery on phones without meaningfully improving
 * the hit rate.
 *
 * The stream is always torn down on unmount, on success and on error, so the
 * camera indicator light can never be left on.
 *
 * @param {object} props
 * @param {(payload: string) => void} props.onScan  Called once with the decoded text.
 * @param {() => void} [props.onClose]
 */
export default function QrScanner({ onScan, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const lastScanAtRef = useRef(0);
  const doneRef = useRef(false);

  const [status, setStatus] = useState('starting'); // starting | live | error
  const [error, setError] = useState('');

  const isSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  const stopStream = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  /** Grab one frame, decode it, and report a hit exactly once. */
  const tick = useCallback(async () => {
    rafRef.current = requestAnimationFrame(tick);

    const now = Date.now();
    if (now - lastScanAtRef.current < 100) return; // throttle to ~10fps
    lastScanAtRef.current = now;

    const video = videoRef.current;
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA || doneRef.current) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const imageData = ctx.getImageData(0, 0, w, h);

    let code = null;
    try {
      code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
    } catch {
      return; // a bad frame must not kill the loop
    }

    if (code && code.data && code.data.trim()) {
      doneRef.current = true;
      stopStream();
      onScan(code.data.trim());
    }
  }, [onScan, stopStream]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!isSupported) {
        // getUserMedia is undefined on insecure origins (plain http on a LAN IP)
        // as well as in genuinely unsupported browsers.
        const secure = typeof window !== 'undefined' && window.isSecureContext;
        setStatus('error');
        setError(
          secure
            ? 'This browser cannot provide a camera stream.'
            : 'Camera access requires a secure (https) origin. Open the app over https, or on localhost, to use the scanner.'
        );
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus('live');
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(
          err && err.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access in your browser to scan the jar QR.'
            : err && err.name === 'NotFoundError'
            ? 'No camera was found on this device.'
            : 'Could not start the camera. Close any other app using it and retry.'
        );
      }
    };

    start();

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isSupported, tick, stopStream]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(2, 6, 23, 0.94)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="QR code scanner"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#0f172a',
          border: '1.5px solid #f5b814',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span style={{ fontWeight: 900, color: '#f8fafc', fontSize: '0.95rem' }}>
            📷 Scan Honey Jar QR Code
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-white"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            ✕ Close
          </button>
        </div>

        {/* Viewport: 4:3 on phones, 16:9 on wide screens, never taller than 60vh. */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '4 / 3',
            maxHeight: '60vh',
            background: '#000',
          }}
        >
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />

          {/* Reticle */}
          {status === 'live' && (
            <div
              style={{
                position: 'absolute',
                inset: '18%',
                border: '3px solid #f5b814',
                borderRadius: '16px',
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.28)',
                pointerEvents: 'none',
              }}
            />
          )}

          {status === 'starting' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: '2rem' }}>⏳</span>
              Starting camera…
            </div>
          )}

          {status === 'error' && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '20px',
                textAlign: 'center',
                color: '#fecaca',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: '#1e1b1b',
              }}
            >
              <span style={{ fontSize: '2.2rem' }}>🚫</span>
              {error}
              <span style={{ color: '#94a3b8', fontWeight: 500, fontSize: '0.8rem' }}>
                You can still verify by typing the Batch ID above.
              </span>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 18px', color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center' }}>
          {status === 'live'
            ? 'Hold the jar label steady inside the frame.'
            : 'Point the camera at the QR code on the product label.'}
        </div>
      </div>
    </div>
  );
}
