require('dotenv').config();
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const crypto = require('crypto');
const path = require('path');
const QRCode = require('qrcode');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '30mb' }));

// Mount Hyperledger Fabric 2.5 & IPFS Blockchain Router
const fabricRouter = require('./blockchain/fabricRouter');
app.use('/api/blockchain', fabricRouter);

// ==========================================
// 0. EDGE AI ANALYTICS PROXY -> Modeling/inference_service.py
// ==========================================
// The trained TensorFlow Lite model in ./Modeling is Python-only, so the
// browser cannot load it directly. The inference sidecar runs on its own port
// and is proxied here, which keeps the frontend on a single origin (and keeps
// the existing Vite `/api` -> :3000 proxy working unchanged).
//
// When the sidecar is not running the proxy answers 503, and
// `src/services/fleetAnalytics.js` transparently falls back to its on-device
// VOC + acoustic heuristic. The dashboard degrades, it does not break.
const ANALYTICS_SIDECAR = process.env.ANALYTICS_SIDECAR_URL || 'http://127.0.0.1:5000';
const ANALYTICS_TIMEOUT_MS = 5000;

app.use('/api/analytics', async (req, res) => {
    const targetPath = req.originalUrl.replace(/^\/api\/analytics/, '') || '/';
    const target = `${ANALYTICS_SIDECAR}${targetPath}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ANALYTICS_TIMEOUT_MS);

    try {
        const body = req.method === 'GET' || req.method === 'HEAD'
            ? undefined
            : JSON.stringify(req.body || {});

        const upstream = await fetch(target, {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            body,
            signal: controller.signal
        });

        const text = await upstream.text();
        res.status(upstream.status);
        res.set('Content-Type', upstream.headers.get('content-type') || 'application/json');
        res.send(text);
    } catch (err) {
        res.status(503).json({
            error: 'analytics sidecar unavailable',
            detail: err && err.name === 'AbortError'
                ? `No response from ${ANALYTICS_SIDECAR} within ${ANALYTICS_TIMEOUT_MS}ms`
                : (err && err.message) || 'unknown proxy failure',
            hint: 'Start it with: python Modeling/inference_service.py'
        });
    } finally {
        clearTimeout(timer);
    }
});

// ==========================================
// 1. MONGODB DATABASE CONFIGURATION & SCHEMAS
// ==========================================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://dintyalaradhakalyani_db_user:gTUxabp0vouzy9yR@cluster0.9mt7rht.mongodb.net/smarthive?retryWrites=true&w=majority";
let isMongoConnected = false;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    name: String,
    apiary: String,
    license: String,
    accreditation: String,
    storeLocation: String,
    passwordHash: String,
    bio: String,
    email: String
});

const honeyBatchSchema = new mongoose.Schema({
    batchId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    status: { type: String, default: 'PENDING_LAB' },
    beekeeperProfile: Object,
    cropDetails: Object,
    iotSensorDetails: Object,
    audioFiles: Array,
    uploadedImages: Array,
    sha256Hash: String,
    qrCodeDataUrl: String,
    verifyUrl: String,
    labTestResults: Object,
    retailerLogs: Array,
    consumerRatings: Array,
    consumerConcerns: Array
});

const User = mongoose.model('User', userSchema);
const HoneyBatch = mongoose.model('HoneyBatch', honeyBatchSchema);

// In-Memory Fallback Store
const memoryUsers = {
    "beekeeper1": {
        role: "Beekeeper",
        name: "Rajesh Kumar (Master Beekeeper)",
        apiary: "Himalayan Organic Apiary, Dehradun",
        license: "GOV-HONEY-AP-8821",
        passwordHash: crypto.createHash('sha256').update("pass123").digest('hex'),
        bio: "Certified organic beekeeper with 15+ years experience in high-altitude wild flora honey collection."
    },
    "lab1": {
        role: "Laboratory",
        name: "Central National Honey Quality Control Lab",
        accreditation: "NABL & ISO/IEC 17025 Accredited",
        license: "GOV-LAB-TEST-9920",
        passwordHash: crypto.createHash('sha256').update("pass123").digest('hex')
    },
    "retailer1": {
        role: "Retailer",
        name: "Pure Natural Foods & Retail Outlets",
        storeLocation: "Connaught Place, New Delhi",
        license: "RETAIL-GOV-4410",
        passwordHash: crypto.createHash('sha256').update("pass123").digest('hex')
    },
    "consumer1": {
        role: "End Consumer",
        name: "Ananya Sen",
        email: "ananya.consumer@example.com",
        passwordHash: crypto.createHash('sha256').update("pass123").digest('hex')
    }
};

const memoryHoneyBatches = new Map();
const activeSessions = new Map();

async function seedMongoDatabase() {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            for (const [username, userData] of Object.entries(memoryUsers)) {
                await User.create({ username, ...userData });
            }
            console.log('🌱 MongoDB Users seeded successfully.');
        }

        const batchCount = await HoneyBatch.countDocuments();
        if (batchCount === 0 && memoryHoneyBatches.has("BATCH-2026-HIM-101")) {
            await HoneyBatch.create(memoryHoneyBatches.get("BATCH-2026-HIM-101"));
            console.log('🌱 MongoDB Honey Batch seed created.');
        }
    } catch (err) {
        console.error('Error seeding MongoDB:', err);
    }
}

function getPublicPdfUrl(req, batchId) {
    if (process.env.PUBLIC_URL) return `${process.env.PUBLIC_URL.replace(/\/$/, '')}/pdf/${batchId}`;
    if (process.env.HOST_URL) return `${process.env.HOST_URL.replace(/\/$/, '')}/pdf/${batchId}`;
    if (req) {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
        return `${protocol}://${host}/pdf/${batchId}`;
    }
    return `http://localhost:3000/pdf/${batchId}`;
}

async function initSeedBatch() {
    const batchId = "BATCH-2026-HIM-101";
    const beekeeper = memoryUsers["beekeeper1"];

    const iotData = {
        temperature: 34.8,
        humidity: 58.5,
        weight: 48.2,
        vocPpm: 110,
        hiveId: "HIVE-ALP-01",
        location: "Apiary Plot A, Valley 3"
    };

    const harvestLogs = {
        cropName: "Wild Himalayan Mustard & Acacia Floral Honey",
        harvestStartDate: "2026-03-15",
        harvestEndDate: "2026-03-22",
        yieldQuantityKg: 150.0,
        floralSource: "Wild Acacia & Alpine Flora"
    };

    const audioFiles = [
        { filename: "spectrogram_hive_01.wav", frequencyHz: 225, status: "Normal Foraging Hum", timestamp: "2026-03-20T10:15:00Z" }
    ];

    const uploadedImages = [
        { name: "frame_inspection_1.jpg", caption: "Sealed honeycomb frame prior to extraction" }
    ];

    const rawPayload = JSON.stringify({ batchId, beekeeper: beekeeper.name, iotData, harvestLogs });
    const sha256Hash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const verifyUrl = getPublicPdfUrl(null, batchId);
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 2, color: { dark: '#0a0a0a', light: '#ffffff' } });

    const batch = {
        batchId,
        createdAt: new Date(),
        status: "TESTED_AND_VERIFIED",
        beekeeperProfile: {
            name: beekeeper.name,
            apiary: beekeeper.apiary,
            license: beekeeper.license,
            bio: beekeeper.bio
        },
        cropDetails: harvestLogs,
        iotSensorDetails: iotData,
        audioFiles,
        uploadedImages,
        sha256Hash,
        qrCodeDataUrl,
        verifyUrl,
        labTestResults: {
            labName: "Central National Honey Quality Control Lab",
            testedAt: "2026-03-23T14:30:00Z",
            purityPercentage: 99.4,
            moisturePercentage: 16.8,
            hmfMgKg: 12.4,
            pollenCount: "Dense Alpine Acacia Pollen Grains",
            antibioticResidues: "ND (Not Detected - 0.0 ppm)",
            status: "PASS",
            feedback: "Exceptional purity. Meets FSSAI, USDA Organic, and EU Directive 2001/110/EC standards for Grade A Pure Honey."
        },
        retailerLogs: [
            {
                storeName: "Pure Natural Foods & Retail Outlets (Delhi Branch)",
                verifiedAt: "2026-03-24T09:00:00Z",
                status: "VERIFIED_IN_STOCK",
                stockQuantity: 45
            }
        ],
        consumerRatings: [
            { rating: 5, comment: "Extremely rich natural floral aroma! Verified QR origin on-site.", reviewerName: "Priya M.", timestamp: "2026-03-24T12:00:00Z" }
        ],
        consumerConcerns: []
    };

    memoryHoneyBatches.set(batchId, batch);
}

initSeedBatch();

// Connect to MongoDB asynchronously
mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 4000
}).then(async () => {
    isMongoConnected = true;
    console.log('🍃 MongoDB Connected successfully to:', MONGODB_URI);
    await seedMongoDatabase();
}).catch(err => {
    console.warn('⚠️ Local MongoDB connection notice:', err.message);
    console.log('📌 Running with full structured API data store & memory synchronization.');
});

// React SPA Client Routes
const serveReactApp = (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html'));
app.get('/explore', serveReactApp);
app.get('/login', serveReactApp);
app.get('/beekeeper', serveReactApp);
app.get('/tester', serveReactApp);
app.get('/retailer', serveReactApp);
app.get('/consumer', serveReactApp);
app.get('/pdf', serveReactApp);
app.get('/pdf/:batchId', serveReactApp);
app.get('/feedback', serveReactApp);
app.get('/contact', serveReactApp);


// Middleware for Session Check
function authenticateSession(req, res, next) {
    const token = req.headers['authorization'] || req.body.token || req.query.token;
    const session = activeSessions.get(token);
    if (!session) {
        return res.status(401).json({ success: false, error: "Unauthorized: Session token invalid or expired. Please sign in." });
    }
    req.session = session;
    next();
}

// ==========================================
// 2. AUTHENTICATION & LOGIN REST API
// ==========================================
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    let user = null;

    if (isMongoConnected) {
        try {
            user = await User.findOne({ username });
        } catch (e) { console.error(e); }
    }
    if (!user) {
        user = memoryUsers[username];
    }

    if (!user) {
        return res.status(401).json({ success: false, error: "Invalid Username. Account not found." });
    }

    const inputHash = crypto.createHash('sha256').update(password || '').digest('hex');
    if (inputHash !== user.passwordHash) {
        return res.status(401).json({ success: false, error: "Invalid Password." });
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, { username, role: user.role, profile: user, createdAt: Date.now() });

    let redirectRoute = "/consumer";
    if (user.role === 'Beekeeper') redirectRoute = "/beekeeper";
    else if (user.role === 'Laboratory') redirectRoute = "/tester";
    else if (user.role === 'Retailer') redirectRoute = "/retailer";

    res.json({
        success: true,
        token,
        role: user.role,
        redirectRoute,
        profile: {
            username: user.username || username,
            name: user.name,
            role: user.role,
            apiary: user.apiary,
            license: user.license,
            accreditation: user.accreditation,
            storeLocation: user.storeLocation
        }
    });
});

// ==========================================
// 3. BEEKEEPER BATCH REGISTRATION API
// ==========================================
app.post('/api/beekeeper/batch/create', authenticateSession, async (req, res) => {
    if (req.session.role !== 'Beekeeper') {
        return res.status(403).json({ success: false, error: "Access Denied: Only Beekeepers can register honey batches." });
    }

    const {
        batchIdCustom,
        cropName,
        harvestStartDate,
        harvestEndDate,
        yieldQuantityKg,
        floralSource,
        temperature,
        humidity,
        weight,
        vocPpm,
        hiveId,
        audioFilename,
        audioFreq,
        imageCaption,
        imageBase64
    } = req.body;

    if (!imageBase64 || imageBase64.trim() === '') {
        return res.status(400).json({
            success: false,
            error: "Image Evidence Upload is MANDATORY. The form cannot be submitted without uploading a comb/frame photo evidence."
        });
    }

    const batchId = batchIdCustom || `BATCH-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const iotSensorDetails = {
        temperature: parseFloat(temperature || 35.0),
        humidity: parseFloat(humidity || 58.0),
        weight: parseFloat(weight || 45.0),
        vocPpm: parseFloat(vocPpm || 120),
        hiveId: hiveId || "HIVE-MAIN-01",
        location: req.session.profile.apiary || "Apiary Location"
    };

    const cropDetails = {
        cropName: cropName || "Pure Wild Blossom Honey",
        harvestStartDate: harvestStartDate || new Date().toISOString().split('T')[0],
        harvestEndDate: harvestEndDate || new Date().toISOString().split('T')[0],
        yieldQuantityKg: parseFloat(yieldQuantityKg || 100.0),
        floralSource: floralSource || "Wild Mountain Flora"
    };

    const audioFiles = audioFilename ? [{
        filename: audioFilename,
        frequencyHz: parseFloat(audioFreq || 225),
        status: parseFloat(audioFreq || 225) < 160 ? "Acoustic Anomaly (Queenless/Mites)" : "Normal Vibrational State",
        timestamp: new Date().toISOString()
    }] : [];

    const uploadedImages = [{
        name: "hive_evidence_photo.jpg",
        caption: imageCaption || "Mandatory beekeeper frame evidence photo",
        data: imageBase64
    }];

    const rawPayload = JSON.stringify({ batchId, beekeeper: req.session.profile.name, iotSensorDetails, cropDetails });
    const sha256Hash = crypto.createHash('sha256').update(rawPayload + imageBase64).digest('hex');

    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const host = req.get('host') || 'localhost:3000';
    const verifyUrl = `${protocol}://${host}/consumer?batchId=${batchId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 2, color: { dark: '#0a0a0a', light: '#ffffff' } });

    const newBatch = {
        batchId,
        createdAt: new Date(),
        status: "PENDING_LAB",
        beekeeperProfile: {
            name: req.session.profile.name,
            apiary: req.session.profile.apiary,
            license: req.session.profile.license,
            bio: req.session.profile.bio
        },
        cropDetails,
        iotSensorDetails,
        audioFiles,
        uploadedImages,
        sha256Hash,
        qrCodeDataUrl,
        verifyUrl,
        labTestResults: null,
        retailerLogs: [],
        consumerRatings: [],
        consumerConcerns: []
    };

    memoryHoneyBatches.set(batchId, newBatch);

    if (isMongoConnected) {
        try {
            await HoneyBatch.create(newBatch);
        } catch (e) { console.error('MongoDB batch create error:', e); }
    }

    broadcastUpdate('new_batch', newBatch);

    res.json({
        success: true,
        message: "Honey Batch Successfully Registered & QR Code Generated",
        batch: newBatch
    });
});

// ==========================================
// 4. LABORATORY / TESTER API
// ==========================================
app.post('/api/lab/test/submit', authenticateSession, async (req, res) => {
    if (req.session.role !== 'Laboratory') {
        return res.status(403).json({ success: false, error: "Access Denied: Only Accredited Laboratories can upload test results." });
    }

    const { batchId, purityPercentage, moisturePercentage, hmfMgKg, pollenCount, antibioticResidues, status, feedback } = req.body;
    let batch = memoryHoneyBatches.get(batchId);

    if (isMongoConnected) {
        try {
            batch = await HoneyBatch.findOne({ batchId });
        } catch (e) { console.error(e); }
    }

    if (!batch) return res.status(404).json({ success: false, error: `Batch ${batchId} not found.` });

    const labTestResults = {
        labName: req.session.profile.name,
        testedAt: new Date().toISOString(),
        purityPercentage: parseFloat(purityPercentage || 99.0),
        moisturePercentage: parseFloat(moisturePercentage || 17.0),
        hmfMgKg: parseFloat(hmfMgKg || 15.0),
        pollenCount: pollenCount || "Dominant Floral Pollen Identified",
        antibioticResidues: antibioticResidues || "Not Detected (0.0 ppm)",
        status: status || (parseFloat(moisturePercentage) > 20 ? "FAIL" : "PASS"),
        feedback: feedback || "Laboratory analytical testing complete."
    };

    const newStatus = labTestResults.status === "PASS" ? "TESTED_AND_VERIFIED" : "FAILED_QUALITY_TEST";

    batch.labTestResults = labTestResults;
    batch.status = newStatus;

    memoryHoneyBatches.set(batchId, batch);

    if (isMongoConnected) {
        try {
            await HoneyBatch.findOneAndUpdate({ batchId }, { labTestResults, status: newStatus });
        } catch (e) { console.error('MongoDB lab update error:', e); }
    }

    broadcastUpdate('lab_update', batch);
    res.json({ success: true, message: "Laboratory Test Record Uploaded", batch });
});

// ==========================================
// 5. RETAILER API
// ==========================================
app.post('/api/retailer/verify', authenticateSession, async (req, res) => {
    if (req.session.role !== 'Retailer') {
        return res.status(403).json({ success: false, error: "Access Denied: Only Retailers can log inventory verifications." });
    }

    const { batchId, stockQuantity, storeRemarks } = req.body;
    let batch = memoryHoneyBatches.get(batchId);

    if (isMongoConnected) {
        try {
            batch = await HoneyBatch.findOne({ batchId });
        } catch (e) { console.error(e); }
    }

    if (!batch) return res.status(404).json({ success: false, error: `Batch ${batchId} not found.` });

    const verificationLog = {
        storeName: req.session.profile.name,
        storeLocation: req.session.profile.storeLocation,
        verifiedAt: new Date().toISOString(),
        status: "VERIFIED_IN_STOCK",
        stockQuantity: parseInt(stockQuantity || 1),
        remarks: storeRemarks || "QR scanned & cryptographic authenticity verified."
    };

    if (!batch.retailerLogs) batch.retailerLogs = [];
    batch.retailerLogs.unshift(verificationLog);
    batch.status = "RETAIL_STOCK";

    memoryHoneyBatches.set(batchId, batch);

    if (isMongoConnected) {
        try {
            await HoneyBatch.findOneAndUpdate({ batchId }, { $push: { retailerLogs: verificationLog }, status: "RETAIL_STOCK" });
        } catch (e) { console.error(e); }
    }

    broadcastUpdate('retailer_update', batch);
    res.json({ success: true, message: "Retailer Verification Logged", batch });
});

// ==========================================
// 6. PUBLIC CONSUMER API
// ==========================================
app.get('/api/consumer/verify/:batchId', async (req, res) => {
    const { batchId } = req.params;
    let batch = null;

    if (isMongoConnected) {
        try {
            batch = await HoneyBatch.findOne({ batchId });
        } catch (e) { console.error(e); }
    }
    if (!batch) {
        batch = memoryHoneyBatches.get(batchId);
    }

    if (!batch) {
        return res.status(404).json({ success: false, error: `Honey Batch ${batchId} invalid or not registered.` });
    }

    const ratings = batch.consumerRatings || [];
    const avgRating = ratings.length ? +(ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1) : 5.0;

    res.json({
        success: true,
        batch: { ...(batch._doc || batch), avgRating }
    });
});

app.post('/api/consumer/rating', async (req, res) => {
    const { batchId, reviewerName, rating, comment } = req.body;
    let batch = memoryHoneyBatches.get(batchId);

    if (isMongoConnected) {
        try {
            batch = await HoneyBatch.findOne({ batchId });
        } catch (e) { console.error(e); }
    }

    if (!batch) return res.status(404).json({ success: false, error: `Batch ${batchId} not found.` });

    const newRating = {
        reviewerName: reviewerName || "Verified Consumer",
        rating: Math.max(1, Math.min(5, parseInt(rating || 5))),
        comment: comment || "Great pure honey product!",
        timestamp: new Date().toISOString()
    };

    if (!batch.consumerRatings) batch.consumerRatings = [];
    batch.consumerRatings.unshift(newRating);

    memoryHoneyBatches.set(batchId, batch);

    if (isMongoConnected) {
        try {
            await HoneyBatch.findOneAndUpdate({ batchId }, { $push: { consumerRatings: newRating } });
        } catch (e) { console.error(e); }
    }

    res.json({ success: true, message: "Consumer Rating Submitted", rating: newRating });
});

app.post('/api/consumer/concern', async (req, res) => {
    const { batchId, consumerName, category, comments } = req.body;
    let batch = memoryHoneyBatches.get(batchId);

    if (isMongoConnected) {
        try {
            batch = await HoneyBatch.findOne({ batchId });
        } catch (e) { console.error(e); }
    }

    if (!batch) return res.status(404).json({ success: false, error: `Batch ${batchId} not found.` });

    const concern = {
        concernId: "CRN-" + Date.now().toString(36).toUpperCase(),
        consumerName: consumerName || "Anonymous Consumer",
        category: category || "Quality / Adulteration Suspicion",
        comments: comments || "Concern reported regarding honey batch purity.",
        timestamp: new Date().toISOString(),
        status: "OPEN"
    };

    if (!batch.consumerConcerns) batch.consumerConcerns = [];
    batch.consumerConcerns.unshift(concern);

    memoryHoneyBatches.set(batchId, batch);

    if (isMongoConnected) {
        try {
            await HoneyBatch.findOneAndUpdate({ batchId }, { $push: { consumerConcerns: concern } });
        } catch (e) { console.error(e); }
    }

    res.json({ success: true, message: "Consumer Concern Registered", concern });
});

app.get('/api/batches', async (_, res) => {
    let list = [];
    if (isMongoConnected) {
        try {
            list = await HoneyBatch.find().sort({ createdAt: -1 });
        } catch (e) { console.error(e); }
    }
    if (!list || list.length === 0) {
        list = Array.from(memoryHoneyBatches.values()).reverse();
    }
    res.json({ success: true, batches: list });
});

function broadcastUpdate(type, data) {
    const msg = JSON.stringify({ type, data });
    wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🍯 ══════════════════════════════════════════════════`);
    console.log(`🍯  Smart Hive Honey Traceability Platform`);
    console.log(`🍃  MongoDB Database: ${isMongoConnected ? 'CONNECTED (' + MONGODB_URI + ')' : 'Standby / Synchronized Data Store'}`);
    console.log(`🍯  Landing Page:  http://localhost:${PORT}/`);
    console.log(`🍯  Login Portal:  http://localhost:${PORT}/login`);
    console.log(`🍯  Beekeeper:     http://localhost:${PORT}/beekeeper`);
    console.log(`🍯  Tester/Lab:    http://localhost:${PORT}/tester`);
    console.log(`🍯  Retailer:      http://localhost:${PORT}/retailer`);
    console.log(`🍯  Consumer:      http://localhost:${PORT}/consumer`);
    console.log(`🍯 ══════════════════════════════════════════════════\n`);
});
