const express = require('express');
const router = express.Router();
const fabricGateway = require('./fabricGateway');
const ipfsService = require('./ipfsService');
const verificationService = require('./blockchainVerificationService');

/**
 * Hyperledger Fabric 2.5 + IPFS REST API Endpoints
 */

// 1. Verify Batch on Blockchain (Hyperledger Fabric Ledger + IPFS Hash Audit)
router.get('/verify/:batchId', async (req, res) => {
    try {
        const { batchId } = req.params;
        const result = await verificationService.verifyBatchOnBlockchain(batchId);
        return res.json({ success: true, data: result });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Register New Honey Batch to IPFS & Hyperledger Fabric Ledger
router.post('/batch/register', async (req, res) => {
    try {
        const { batchId, produceData, beekeeper } = req.body;
        if (!batchId) return res.status(400).json({ success: false, error: "batchId is required" });

        // Step A: Store telemetry & payload off-chain on IPFS
        const ipfsResult = await ipfsService.uploadToIPFS({
            batchId,
            beekeeper: beekeeper ? beekeeper.name : "Registered Beekeeper",
            produceData: produceData || {},
            timestamp: new Date().toISOString()
        });

        // Step B: Submit transaction to Hyperledger Fabric Smart Contract (Go Chaincode)
        const fabricResult = await fabricGateway.submitTransaction(
            "CreateBatch",
            batchId,
            new Date().toISOString(),
            beekeeper?.name || "Rajesh Kumar",
            beekeeper?.apiary || "Himalayan Organic Apiary",
            beekeeper?.license || "GOV-HONEY-AP-8821",
            ipfsResult.cid,
            ipfsResult.sha256Hash
        );

        return res.json({
            success: true,
            message: `Batch ${batchId} successfully minted on Hyperledger Fabric 2.5+ Ledger and pinned to IPFS.`,
            data: {
                batchId,
                transactionId: fabricResult.txId,
                blockNumber: fabricResult.blockNumber,
                ipfsCID: ipfsResult.cid,
                ipfsUrl: ipfsResult.ipfsUrl,
                sha256Hash: ipfsResult.sha256Hash
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 3. Record Laboratory Verification Result on Fabric Ledger
router.post('/batch/lab-test', async (req, res) => {
    try {
        const { batchId, labName, purity, moisture, hmf, pollen, antibiotics, status } = req.body;
        
        const fabricResult = await fabricGateway.submitTransaction(
            "RecordLabResult",
            batchId,
            labName || "Central National Honey Quality Control Lab",
            new Date().toISOString(),
            purity || 99.4,
            moisture || 16.8,
            hmf || 12.4,
            pollen || "Dense Alpine Acacia Pollen Grains",
            antibiotics || "ND (Not Detected)",
            status || "PASS"
        );

        return res.json({
            success: true,
            message: `Lab verification written to Hyperledger Fabric channel for batch ${batchId}`,
            data: fabricResult
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 4. Get Fabric Network Topology & Gateway Status
router.get('/network-status', async (req, res) => {
    return res.json({
        success: true,
        network: "Hyperledger Fabric v2.5+",
        consensus: "Raft (EtcdRaft Orderer Cluster)",
        organizations: [
            { mspId: "Org1MSP", name: "Beekeepers & Apiaries Organization", peers: 2 },
            { mspId: "Org2MSP", name: "Laboratories & Quality Control Organization", peers: 2 },
            { mspId: "Org3MSP", name: "Retail Outlets & Supply Chain Organization", peers: 2 }
        ],
        channel: fabricGateway.channelName,
        smartContract: fabricGateway.chaincodeName,
        offChainStorage: "IPFS (Pinata / Infura) + Filecoin Network",
        apiGateway: "Kong / AWS API Gateway (Configured)",
        frontend: "React.js + Next.js SSR"
    });
});

module.exports = router;
