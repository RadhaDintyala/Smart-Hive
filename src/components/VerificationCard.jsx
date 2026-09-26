import React, { useState, useRef } from 'react';
import QrScanner from './QrScanner';
import { decodeQrFromImage, extractBatchId } from '../services/qrDecoder';

/**
 * Unified verification box.
 *
 * Groups the three consumer entry points - Honey Verification, Batch ID Input,
 * live Camera QR Scanner, and Upload QR Image Scanner - inside a single bordered card.
 */
export default function VerificationCard({
  title,
  subtitle,
  value,
  onChange,
  onSubmit,
  placeholder = 'Enter Batch ID or paste QR payload (e.g. BATCH-2026-HIM-101)...',
  error = '',
  compact = false,
  footer = null,
}) {
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const triggerScan = () => {
    setShowScanner(true);
    setScanning(true);
  };

  const closeScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  /** A decoded QR payload is parsed to extract the Batch ID then submitted. */
  const handleDecoded = (payload) => {
    closeScanner();
    setIsAnalyzing(false);
    setUploadError('');
    const extracted = extractBatchId(payload) || payload;
    onChange(extracted);
    onSubmit(extracted);
  };

  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setUploadError('');
    setIsAnalyzing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const rawCode = await decodeQrFromImage(img);
          if (rawCode) {
            handleDecoded(rawCode);
          } else {
            setIsAnalyzing(false);
            setUploadError('No QR code detected in the uploaded image. Please ensure the QR code photo or screenshot is clear.');
          }
        } catch (err) {
          setIsAnalyzing(false);
          setUploadError(err.message || 'Could not detect QR code in the uploaded image.');
        }
      };
      img.onerror = () => {
        setIsAnalyzing(false);
        setUploadError('Could not load the selected image file. Please try a valid image file.');
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setIsAnalyzing(false);
      setUploadError('Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <section
      className="verification-card"
      style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid #f5b814',
        boxShadow: '0 12px 36px rgba(245, 184, 20, 0.18)',
        borderRadius: '20px',
        padding: compact ? '18px 20px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.6rem' }}>📱</span>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>{title}</h3>
          {subtitle && (
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {subtitle}
            </span>
          )}
        </div>
      </header>

      {/* Batch ID Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value && value.trim()) {
            const extracted = extractBatchId(value.trim()) || value.trim();
            onSubmit(extracted);
          }
        }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          type="text"
          className="neo-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ flex: 1, padding: compact ? '10px 14px' : '12px 16px', fontSize: '0.9rem' }}
        />
        <button
          type="submit"
          className="btn-yellow"
          style={{ padding: compact ? '10px 16px' : '12px 18px', fontSize: '0.9rem', fontWeight: 800, whiteSpace: 'nowrap' }}
        >
          Verify Batch ➔
        </button>
      </form>

      {/* Hidden File Input for Image QR Scanner */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* QR Scanner Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <button
          type="button"
          className="btn-yellow"
          onClick={triggerScan}
          disabled={isAnalyzing}
          style={{ padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>📷 Camera QR Scanner</span>
        </button>
        <button
          type="button"
          className="btn-white"
          onClick={triggerFileUpload}
          disabled={isAnalyzing}
          style={{ padding: '14px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>{isAnalyzing ? '⏳ Analyzing Photo…' : '📁 Upload QR Scanner'}</span>
        </button>
      </div>

      {isAnalyzing && (
        <div
          style={{
            padding: '12px',
            borderRadius: '12px',
            background: '#fefce8',
            border: '1px solid #fef08a',
            color: '#854d0e',
            fontSize: '0.88rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🔎</span> Scanning photo/screenshot for embedded QR code & verifying on blockchain ledger…
        </div>
      )}

      {showScanner && (
        <QrScanner onScan={handleDecoded} onClose={closeScanner} />
      )}

      {scanning && !showScanner && (
        <div
          style={{
            background: '#000000',
            borderRadius: '16px',
            height: '220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📱</div>
          <div style={{ fontWeight: 800, color: '#f5b814', fontSize: '0.95rem' }}>Starting camera…</div>
        </div>
      )}

      {(error || uploadError) && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            color: '#991b1b',
            fontSize: '0.85rem',
            fontWeight: 700,
          }}
        >
          🚨 {error || uploadError}
        </div>
      )}

      {footer}
    </section>
  );
}


