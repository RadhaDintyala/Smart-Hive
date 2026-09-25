import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Database, Server, Link as LinkIcon, CheckCircle2, RefreshCw, FileText, ArrowRight } from 'lucide-react';

export default function BlockchainVerifier({ batchId = "BATCH-2026-HIM-101" }) {
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const fetchVerification = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/blockchain/verify/${batchId}`);
      const json = await res.json();
      if (json.success) {
        setVerificationData(json.data);
      } else {
        setError(json.error || "Failed to verify on Hyperledger Fabric");
      }
    } catch (err) {
      setError("Network error connecting to Hyperledger Fabric Gateway: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchId) {
      fetchVerification();
    }
  }, [batchId]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      marginTop: '20px',
      marginBottom: '20px'
    }}>
      {/* Header Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(217, 119, 6, 0.2)',
            border: '1px solid #d97706',
            borderRadius: '12px',
            padding: '10px'
          }}>
            <Cpu size={28} color="#f59e0b" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              Hyperledger Fabric 2.5+ Verification Node
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
              Permissioned Enterprise Blockchain & IPFS Off-Chain Storage Audit
            </p>
          </div>
        </div>

        <button
          onClick={fetchVerification}
          disabled={loading}
          style={{
            background: 'linear-gradient(90deg, #d97706, #b45309)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Verifying Ledger..." : "Re-Verify Ledger"}
        </button>
      </div>

      {/* Architecture Stack Chips */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Blockchain Engine</div>
          <div style={{ fontWeight: 600, color: '#38bdf8', marginTop: '4px', fontSize: '0.9rem' }}>Hyperledger Fabric 2.5+</div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Smart Contract</div>
          <div style={{ fontWeight: 600, color: '#34d399', marginTop: '4px', fontSize: '0.9rem' }}>Go / Node.js Chaincode</div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Off-Chain Storage</div>
          <div style={{ fontWeight: 600, color: '#f472b6', marginTop: '4px', fontSize: '0.9rem' }}>IPFS (Pinata) + Filecoin</div>
        </div>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>API Gateway</div>
          <div style={{ fontWeight: 600, color: '#fbbf24', marginTop: '4px', fontSize: '0.9rem' }}>Kong / Node Fabric SDK</div>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', padding: '14px', borderRadius: '10px', color: '#fca5a5', marginBottom: '16px' }}>
          <ShieldAlert size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
          {error}
        </div>
      )}

      {verificationData && (
        <div>
          {/* Status Verdict Banner */}
          <div style={{
            background: verificationData.verified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${verificationData.verified ? '#10b981' : '#ef4444'}`,
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {verificationData.verified ? (
                <ShieldCheck size={36} color="#10b981" />
              ) : (
                <ShieldAlert size={36} color="#ef4444" />
              )}
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: verificationData.verified ? '#34d399' : '#fca5a5' }}>
                  {verificationData.verified ? "CRYPTOGRAPHIC PROOF VERIFIED: 100% AUTHENTIC" : "DATA TAMPER ALERT"}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '2px' }}>
                  On-chain Fabric state hash matches off-chain IPFS payload content byte-for-byte.
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                background: verificationData.verified ? '#065f46' : '#991b1b',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                {verificationData.status}
              </span>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                Latency: {verificationData.verificationSummary.latencyMs}ms
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
            {['summary', 'fabric', 'ipfs', 'history'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #f59e0b' : '2px solid transparent',
                  color: activeTab === tab ? '#f59e0b' : '#94a3b8',
                  padding: '8px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {tab === 'summary' && 'Proof Summary'}
                {tab === 'fabric' && 'Hyperledger Fabric'}
                {tab === 'ipfs' && 'IPFS Off-Chain'}
                {tab === 'history' && 'Ledger Audit History'}
              </button>
            ))}
          </div>

          {/* Tab 1: Summary */}
          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>IMMUTABLE LEDGER SHA-256 HASH</div>
                <div style={{ color: '#34d399', wordBreak: 'break-all' }}>{verificationData.blockchainDetails.ledgerSHA256Hash}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>COMPUTED OFF-CHAIN IPFS SHA-256 HASH</div>
                <div style={{ color: '#38bdf8', wordBreak: 'break-all' }}>{verificationData.blockchainDetails.computedSHA256Hash}</div>
              </div>
            </div>
          )}

          {/* Tab 2: Fabric Details */}
          {activeTab === 'fabric' && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', fontSize: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div><span style={{ color: '#94a3b8' }}>Network:</span> <strong>{verificationData.blockchainDetails.network}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Channel:</span> <strong>{verificationData.blockchainDetails.channel}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Chaincode:</span> <strong>{verificationData.blockchainDetails.chaincode}</strong></div>
                <div><span style={{ color: '#94a3b8' }}>Block Height:</span> <strong>#{verificationData.blockchainDetails.blockNumber}</strong></div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ color: '#94a3b8', marginBottom: '4px' }}>Peer Endorsements:</div>
                {verificationData.blockchainDetails.peerEndorsements.map((peer, idx) => (
                  <div key={idx} style={{ color: '#34d399', fontSize: '0.8rem', margin: '2px 0' }}>
                    <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    {peer}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: IPFS Details */}
          {activeTab === 'ipfs' && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px', fontSize: '0.85rem' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ color: '#94a3b8' }}>Content Identifier (IPFS CID):</span>
                <div style={{ color: '#f472b6', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', marginTop: '4px' }}>
                  {verificationData.offChainStorage.ipfsCID}
                </div>
              </div>
              <div>
                <a
                  href={verificationData.offChainStorage.ipfsGatewayUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <LinkIcon size={14} /> Open Decentralized IPFS Gateway Payload
                </a>
              </div>
            </div>
          )}

          {/* Tab 4: History Timeline */}
          {activeTab === 'history' && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '10px' }}>
              {verificationData.provenanceHistory?.map((item, idx) => (
                <div key={idx} style={{ borderLeft: '2px solid #d97706', paddingLeft: '14px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>Tx: {item.txId}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.timestamp).toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '4px' }}>Action: {item.action} | Status: {item.record.status}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
