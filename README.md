# 🐝 Smart Hive — AI-IoT Honey Traceability & Provenance Platform

🌐 **Live Deployed Application**: [https://smarthive-onlive.onrender.com](https://smarthive-onlive.onrender.com)

**Smart Hive** is a React-powered AI-IoT Honey Traceability and Quality Assurance Platform built to empower rural beekeepers, national quality testing laboratories, retail distributors, and end consumers. By combining IoT microclimate telemetry, acoustic spectrogram data, comb photo evidence, NABL laboratory certifications, and cryptographic batch verification, Smart Hive delivers tamper-proof **Hive-to-Home Provenance**.

---

## 🌟 Key Features & Role Workspaces

### 1. 🐝 Beekeeper Workspace
* **IoT Sensor Telemetry**: Log real-time hive microclimate metrics (temperature, humidity, weight, VOC gas levels).
* **Acoustic Spectrograms**: Record vibrational frequency spectra to monitor colony hum and detect queenless/mite anomalies.
* **Mandatory Comb Photo Evidence**: Form submission enforces mandatory photographic evidence of sealed honeycomb frames prior to extraction.
* **Harvest Logs & QR Generation**: Register honey batches with floral source and yield details; automatically generate cryptographic SHA-256 batch signatures and QR codes.

### 2. 🧪 Laboratory / Tester Portal
* **Accredited Quality Testing**: Submit moisture %, purity %, HMF freshness (mg/kg), pollen grain signatures, and antibiotic residue detection (0.0 ppm).
* **Beekeeper Quality Feedback**: Issue official quality advice and grade parameters (PASS/FAIL) directly linked to the batch audit trail.
* **Test Records Archive**: Maintain accredited lab test logs.

### 3. 🏪 Retailer Audit & Stock Registry
* **Store Receipt Verification**: Scan batch QR codes to verify cryptographic ledger authenticity upon store arrival.
* **Physical Stock Audit**: Log retail stock quantities and physical verification remarks.

### 4. 👥 End Consumer Public Traceability
* **Instant Purity Check**: Scan container QR codes or search Batch IDs to instantly view tamper-proof purity scores.
* **Complete Origin Transparency**: Inspect beekeeper profiles, IoT telemetry, NABL certificates, and store audit logs.
* **Consumer Reviews & Concerns**: Submit star ratings and report quality inquiries.

---

## 🛠 Tech Stack

* **Frontend**: React 18 / Vite, JSX, Lucide Icons, Vanilla CSS Design System (Neo-brutalist / Modern UI).
* **Backend**: Node.js, Express.js, WebSocket (Real-time updates), Crypto (SHA-256 cryptographic hashes).
* **Database**: MongoDB Atlas / Mongoose (Cloud NoSQL Database with in-memory synchronization fallback).
* **Utilities**: QRCode generator, RESTful APIs.

---

## 🚀 Quick Start Guide

### Prerequisites

* [Node.js](https://nodejs.org/) (v16+ recommended)
* [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance

### Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/RadhaDintyala/Smart-Hive.git
   cd Smart-Hive
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (do not commit this file):
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/smarthive?retryWrites=true&w=majority
   PORT=3000
   ```

4. **Run the Application**:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

5. **Open in Browser**:
   * **Landing Page**: [http://localhost:3000/](http://localhost:3000/)
   * **Login Workspace**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔑 Demo Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Beekeeper** | `beekeeper1` | `pass123` |
| **Laboratory** | `lab1` | `pass123` |
| **Retailer** | `retailer1` | `pass123` |
| **End Consumer** | `consumer1` | `pass123` |

---

## 📄 License

This project is licensed under the MIT License.
