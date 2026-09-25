
# Hyperledger Fabric 2.5+ & IPFS Blockchain Verification System

This document describes the enterprise-grade **Blockchain Verification Architecture** implemented according to the full-stack specification.

---

## 1. System Architecture & Tech Stack Overview

| Layer | Technology | Rationale & Function |
| :--- | :--- | :--- |
| **Blockchain** | **Hyperledger Fabric 2.5+** | Permissioned consortium blockchain; zero gas fees; high throughput (>3,500 TPS); private channel isolation across Beekeepers, Labs, and Retailers. |
| **Smart Contracts** | **Go / Node.js Chaincode** | Fabric-native contract implementation (`HoneyBatchContract`) compiled in Go for maximum execution performance and type safety. |
| **Off-chain Storage** | **IPFS (Pinata / Infura) + Filecoin** | Decentralized, content-addressed storage for large IoT sensor telemetry, acoustic audio spectrums, and lab PDFs; stores immutable IPFS CID on Fabric state. |
| **Backend API** | **Node.js (Express) + Fabric SDK** | High-concurrency Gateway API layer connecting directly to Fabric Peers via gRPC/TLS and `@hyperledger/fabric-gateway`. |
| **API Gateway** | **Kong / AWS API Gateway** | Enterprise rate limiting, OAuth2/JWT authentication, and request routing to backend microservices. |
| **Frontend — Web** | **React.js + Next.js (SSR)** | Server-side rendered (SSR) consumer verification pages optimized for instant loading, SEO indexing, and real-time audit trail rendering. |

---

## 2. Directory Structure & Code Modules

```
Smart Hive/
├── chaincode/
│   └── honey_contract.go              # Hyperledger Fabric 2.5 Go Smart Contract (Chaincode)
├── blockchain/
│   ├── ipfsService.js                 # Off-chain IPFS / Pinata / Filecoin storage engine & CID hasher
│   ├── fabricGateway.js               # Hyperledger Fabric Gateway Client SDK & Peer connection wrapper
│   ├── blockchainVerificationService.js # Multi-layer Cryptographic Verification Engine
│   └── fabricRouter.js                # Express REST API endpoints (/api/blockchain/verify/:batchId)
├── src/
│   └── components/
│       └── BlockchainVerifier.jsx     # Next.js / React Web Verification UI Component
└── server.js                          # Mounted /api/blockchain router
```

---

## 3. Cryptographic Verification Pipeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        VERIFICATION WORKFLOW                           │
│                                                                        │
│ 1. Client Query  ──►  GET /api/blockchain/verify/:batchId              │
│                                                                        │
│ 2. Fabric Query  ──►  Hyperledger Fabric 2.5 State (World State DB)    │
│                        Returns: { dataHashSHA256, payloadIpfsCID, TxID }│
│                                                                        │
│ 3. IPFS Fetch    ──►  IPFS Decentralized Storage Gateway               │
│                        Fetches Content-Addressed JSON Payload (CID)    │
│                                                                        │
│ 4. Re-Hash Audit ──►  SHA256(IPFS Raw Payload) === Fabric Ledger SHA256│
│                                                                        │
│ 5. Verdict       ──►  ✓ 100% AUTHENTIC VERIFIED / ❌ TAMPER ALERT      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. API Specification

### `GET /api/blockchain/verify/:batchId`
* **Description:** Runs multi-layer cryptographic verification against Hyperledger Fabric 2.5+ world state and off-chain IPFS storage.
* **Sample Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "batchId": "BATCH-2026-HIM-101",
    "status": "VERIFIED_ORGANIC_GRADE_A",
    "blockchainDetails": {
      "network": "Hyperledger Fabric v2.5.4",
      "channel": "smarthive-channel",
      "chaincode": "honey_contract",
      "blockNumber": 1042,
      "transactionId": "0x7f8a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
      "ledgerSHA256Hash": "a3f7...",
      "computedSHA256Hash": "a3f7..."
    },
    "offChainStorage": {
      "storageType": "IPFS + Filecoin (Content Addressed)",
      "ipfsCID": "QmX9aBc82FkL19mPzQ0029310A11883901923847",
      "ipfsGatewayUrl": "https://gateway.pinata.cloud/ipfs/QmX9aBc82FkL19mPzQ0029310A11883901923847"
    }
  }
}
```

---

## 5. Deployment Instructions

### A. Deploy Hyperledger Fabric Chaincode (Go)
1. Package the Go chaincode:
   ```bash
   peer lifecycle chaincode package honey_contract.tar.gz --path ./chaincode --lang golang --label honey_contract_1.0
   ```
2. Install chaincode on org peers (`Org1MSP`, `Org2MSP`, `Org3MSP`):
   ```bash
   peer lifecycle chaincode install honey_contract.tar.gz
   ```
3. Approve & commit chaincode definition to channel `smarthive-channel`.

### B. Configure IPFS & Pinata Credentials
In your `.env` file:
```env
PINATA_API_KEY="your_pinata_api_key"
PINATA_SECRET_KEY="your_pinata_secret_key"
IPFS_GATEWAY_URL="https://gateway.pinata.cloud/ipfs"
FABRIC_CHANNEL="smarthive-channel"
FABRIC_CHAINCODE="honey_contract"
```

### C. Launch Node Server & Web Interface
```bash
npm run server
```
Navigating to `http://localhost:3000/consumer` will display the live Hyperledger Fabric & IPFS Verification Node component.
