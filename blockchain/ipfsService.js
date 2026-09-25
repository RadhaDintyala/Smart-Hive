const crypto = require('crypto');

/**
 * IPFS & Filecoin Off-Chain Storage Service
 * Implements decentralized content-addressed storage (Pinata / Infura / Local IPFS Node)
 */
class IPFSService {
    constructor() {
        this.pinataApiKey = process.env.PINATA_API_KEY || "mock_pinata_key";
        this.pinataSecretApiKey = process.env.PINATA_SECRET_KEY || "mock_pinata_secret";
        this.gatewayUrl = process.env.IPFS_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs";
        
        // Mock IPFS local cache for fast development & simulation
        this.mockIPFSRepository = new Map();
    }

    /**
     * Uploads off-chain batch payload (IoT telemetry, Audio data, Images) to IPFS
     * @param {Object} payload Batch data object
     * @returns {Promise<{ cid: string, sha256Hash: string, ipfsUrl: string }>}
     */
    async uploadToIPFS(payload) {
        const jsonString = JSON.stringify(payload, Object.keys(payload).sort());
        
        // Compute SHA-256 digest
        const sha256Hash = crypto.createHash('sha256').update(jsonString).digest('hex');

        // Derive deterministic IPFS v0 / v1 style CID hash
        const cidPrefix = "Qm";
        const cidHashPart = crypto.createHash('sha256').update(sha256Hash + "IPFS_SALT_2026").digest('hex').substring(0, 44);
        const cid = `${cidPrefix}${cidHashPart}`;

        // Store in mock storage for offline/standalone execution
        this.mockIPFSRepository.set(cid, {
            payload,
            jsonString,
            sha256Hash,
            createdAt: new Date().toISOString()
        });

        // Real Pinata / Infura API Call (if credentials supplied)
        if (process.env.PINATA_API_KEY && process.env.PINATA_API_KEY !== "mock_pinata_key") {
            try {
                const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "pinata_api_key": this.pinataApiKey,
                        "pinata_secret_api_key": this.pinataSecretApiKey
                    },
                    body: JSON.stringify({
                        pinataContent: payload,
                        pinataMetadata: { name: `smart_hive_${payload.batchId || 'batch'}.json` }
                    })
                });
                const data = await response.json();
                if (data.IpfsHash) {
                    return {
                        cid: data.IpfsHash,
                        sha256Hash,
                        ipfsUrl: `${this.gatewayUrl}/${data.IpfsHash}`
                    };
                }
            } catch (err) {
                console.warn("⚠️ Pinata API unavailable, using local content-addressed IPFS store fallback:", err.message);
            }
        }

        return {
            cid,
            sha256Hash,
            ipfsUrl: `${this.gatewayUrl}/${cid}`
        };
    }

    /**
     * Fetches off-chain payload from IPFS content-addressed hash
     * @param {string} cid 
     */
    async fetchFromIPFS(cid) {
        if (this.mockIPFSRepository.has(cid)) {
            return this.mockIPFSRepository.get(cid);
        }

        try {
            const res = await fetch(`${this.gatewayUrl}/${cid}`);
            if (res.ok) {
                const payload = await res.json();
                const jsonString = JSON.stringify(payload, Object.keys(payload).sort());
                const sha256Hash = crypto.createHash('sha256').update(jsonString).digest('hex');
                return { payload, jsonString, sha256Hash };
            }
        } catch (err) {
            console.warn(`Could not reach IPFS gateway for CID ${cid}:`, err.message);
        }

        return null;
    }
}

module.exports = new IPFSService();
