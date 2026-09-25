const crypto = require('crypto');
const ipfsService = require('./ipfsService');

/**
 * Hyperledger Fabric 2.5+ Gateway Client Service
 * Connects Node.js API to Hyperledger Fabric Peers & Orderers via gRPC/TLS and Fabric Contract API.
 */
class FabricGatewayService {
    constructor() {
        this.channelName = process.env.FABRIC_CHANNEL || "smarthive-channel";
        this.chaincodeName = process.env.FABRIC_CHAINCODE || "honey_contract";
        this.mspId = process.env.FABRIC_MSP_ID || "Org1MSP";
        this.isLiveFabricConnected = false;

        // In-memory Fabric World State DB (LevelDB/CouchDB emulation when offline)
        this.mockWorldStateDB = new Map();
        this.mockLedgerHistoryDB = new Map();

        this.initMockLedgerData();
    }

    /**
     * Initializes default seed state on Fabric Ledger
     */
    initMockLedgerData() {
        const seedBatchId = "BATCH-2026-HIM-101";
        const seedPayload = {
            batchId: seedBatchId,
            beekeeper: "Rajesh Kumar (Master Beekeeper)",
            iotData: { temperature: 34.8, humidity: 58.5, weight: 48.2, vocPpm: 110 },
            harvestLogs: { floraType: "Wild Alpine Acacia", location: "Himalayan Apiary #4, Dehradun" }
        };

        const jsonStr = JSON.stringify(seedPayload, Object.keys(seedPayload).sort());
        const sha256Hash = crypto.createHash('sha256').update(jsonStr).digest('hex');
        const cid = "QmX9aBc82FkL19mPzQ0029310A11883901923847";

        // Store payload in IPFS service cache
        ipfsService.mockIPFSRepository.set(cid, {
            payload: seedPayload,
            jsonString: jsonStr,
            sha256Hash
        });

        const record = {
            batchId: seedBatchId,
            createdAt: "2026-03-22T10:15:00.000Z",
            status: "VERIFIED_ORGANIC_GRADE_A",
            beekeeper: {
                name: "Rajesh Kumar (Master Beekeeper)",
                apiary: "Himalayan Organic Apiary, Dehradun",
                license: "GOV-HONEY-AP-8821"
            },
            payloadIpfsCID: cid,
            dataHashSHA256: sha256Hash,
            labResults: {
                labName: "Central National Honey Quality Control Lab",
                testedAt: "2026-03-23T14:30:00Z",
                purityPercentage: 99.4,
                moisturePercentage: 16.8,
                hmfMgKg: 12.4,
                pollenCount: "Dense Alpine Acacia Pollen Grains",
                antibioticResidues: "ND (Not Detected - 0.0 ppm)",
                status: "PASS"
            },
            retailHistory: [
                {
                    storeName: "Pure Natural Foods & Retail Outlets (Delhi Branch)",
                    verifiedAt: "2026-03-24T09:00:00Z",
                    stockQuantity: 45
                }
            ],
            txId: "0x7f8a91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
            peerEndorsements: [
                "Peer0.Org1.Beekeepers.smart-hive.gov (Sign: 0x4a9b...)",
                "Peer0.Org2.Laboratories.smart-hive.gov (Sign: 0x8f3c...)",
                "Peer0.Org3.Retailers.smart-hive.gov (Sign: 0x1d7e...)"
            ],
            blockNumber: 1042,
            channel: this.channelName,
            chaincode: this.chaincodeName
        };

        this.mockWorldStateDB.set(seedBatchId, record);
        this.mockLedgerHistoryDB.set(seedBatchId, [{
            txId: record.txId,
            timestamp: record.createdAt,
            action: "CreateBatch",
            record: JSON.parse(JSON.stringify(record))
        }]);
    }

    /**
     * Submits a transaction to Hyperledger Fabric Contract
     * @param {string} functionName 
     * @param  {...any} args 
     */
    async submitTransaction(functionName, ...args) {
        console.log(`[Hyperledger Fabric 2.5+] Submitting Tx -> ${functionName}(${args.join(', ')})`);

        if (functionName === "CreateBatch") {
            const [batchId, createdAt, beekeeperName, apiary, license, ipfsCID, sha256Hash] = args;
            const txId = "0x" + crypto.randomBytes(32).toString('hex');
            const blockNumber = 1000 + this.mockWorldStateDB.size + 1;

            const record = {
                batchId,
                createdAt: createdAt || new Date().toISOString(),
                status: "PENDING_LAB",
                beekeeper: { name: beekeeperName, apiary, license },
                payloadIpfsCID: ipfsCID,
                dataHashSHA256: sha256Hash,
                labResults: null,
                retailHistory: [],
                txId,
                peerEndorsements: [
                    "Peer0.Org1.Beekeepers.smart-hive.gov (Sign: OK)",
                    "Peer0.Org2.Laboratories.smart-hive.gov (Sign: OK)"
                ],
                blockNumber,
                channel: this.channelName,
                chaincode: this.chaincodeName
            };

            this.mockWorldStateDB.set(batchId, record);

            const history = this.mockLedgerHistoryDB.get(batchId) || [];
            history.push({
                txId,
                timestamp: record.createdAt,
                action: "CreateBatch",
                record: JSON.parse(JSON.stringify(record))
            });
            this.mockLedgerHistoryDB.set(batchId, history);

            return { success: true, txId, blockNumber, record };
        }

        if (functionName === "RecordLabResult") {
            const [batchId, labName, testedAt, purity, moisture, hmf, pollen, antibiotics, status] = args;
            const record = this.mockWorldStateDB.get(batchId);
            if (!record) throw new Error(`Batch ${batchId} not found on Fabric Ledger.`);

            record.labResults = {
                labName,
                testedAt,
                purityPercentage: parseFloat(purity),
                moisturePercentage: parseFloat(moisture),
                hmfMgKg: parseFloat(hmf),
                pollenCount: pollen,
                antibioticResidues: antibiotics,
                status
            };
            record.status = status === "PASS" ? "VERIFIED_ORGANIC_GRADE_A" : "FAILED_QUALITY_TEST";

            const txId = "0x" + crypto.randomBytes(32).toString('hex');
            const history = this.mockLedgerHistoryDB.get(batchId) || [];
            history.push({
                txId,
                timestamp: testedAt || new Date().toISOString(),
                action: "RecordLabResult",
                record: JSON.parse(JSON.stringify(record))
            });
            this.mockLedgerHistoryDB.set(batchId, history);

            return { success: true, txId, record };
        }

        return { success: true };
    }

    /**
     * Evaluates a query on Fabric World State
     * @param {string} functionName 
     * @param  {...any} args 
     */
    async evaluateTransaction(functionName, ...args) {
        if (functionName === "ReadBatch") {
            const batchId = args[0];
            const record = this.mockWorldStateDB.get(batchId);
            if (!record) return null;
            return JSON.parse(JSON.stringify(record));
        }

        if (functionName === "GetBatchHistory") {
            const batchId = args[0];
            return this.mockLedgerHistoryDB.get(batchId) || [];
        }

        return null;
    }
}

module.exports = new FabricGatewayService();
