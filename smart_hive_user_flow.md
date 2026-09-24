# 🐝 Smart Hive AI-IoT — User Flow & Technical Operations

## 1. User Flow Diagram

```mermaid
flowchart TD
    A["🏠 Landing Page"] --> B{"User Action"}
    B --> C["📊 Dashboard Overview"]
    B --> D["🐝 Add New Hive"]
    B --> E["⚙️ System Settings"]
    
    C --> F["Select a Hive"]
    F --> G["📈 Live Telemetry Panel"]
    F --> H["🔊 Audio Health Analysis"]
    F --> I["⚖️ Weight & Yield Forecast"]
    F --> J["🛡️ Authenticity Chain"]
    
    G --> K["Temperature / Humidity / VOC Gauges"]
    G --> L["Real-time Trend Charts"]
    G --> M{"Anomaly Detected?"}
    M -->|Yes| N["🚨 Alert Notification"]
    M -->|No| O["✅ Normal Status"]
    
    
    H --> P["Frequency Spectrum Visualization"]
    H --> Q["CNN Classification Result"]
    Q --> R{"Anomaly?"}
    R -->|Yes| S["⚠️ Queenless / Mite Alert"]
    R -->|No| T["✅ Normal Vibrational State"]
    
    I --> U["Historical Weight Chart"]
    I --> V["30-Day LSTM Yield Prediction"]
    I --> W["Seasonal Baseline Overlay"]
    
    J --> X["SHA-256 Signed Records"]
    J --> Y["Tamper-Proof Audit Log"]
    J --> Z["Export Certification PDF"]
    
    D --> AA["Enter Hive ID & Location"]
    AA --> AB["Configure Sensor Mode"]
    AB --> AC{"Mock or Live IoT?"}
    AC -->|Mock| AD["Start Simulation Engine"]
    AC -->|Live| AE["Configure MQTT Broker"]
    AE --> AF["Pair ESP32 Hardware"]
    
    E --> AG["Notification Preferences"]
    E --> AH["Alert Thresholds"]
    E --> AI["Data Export Settings"]
    E --> AJ["MQTT Broker Configuration"]
```

---

## 2. Complete Technical Operations Flow

```mermaid
sequenceDiagram
    participant Sensor as 📡 Data Input Layer
    participant Gateway as 🔧 Ingestion Gateway
    participant EdgeAI as 🧠 Edge AI Engine
    participant Cloud as ☁️ Cloud Layer
    participant Auth as 🔒 Authenticity Chain
    participant API as 🌐 API Gateway
    participant UI as 🖥️ Dashboard

    Note over Sensor: Mock Simulator OR Physical IoT Array
    
    Sensor->>Gateway: Raw telemetry packet (temp, humidity, VOC, weight, audio)
    
    Note over Gateway: Audio Pipeline: MFCC windowing at 44.1kHz<br/>Telemetry: MinMax / StandardScaler normalization
    
    Gateway->>EdgeAI: Normalized feature vectors
    
    Note over EdgeAI: Audio CNN (TFLite/ONNX): Mel-spectrogram → classification<br/>Anomaly Detection: Statistical deviation / Autoencoder
    
    EdgeAI->>Cloud: Classification results + normalized metrics
    
    Note over Cloud: Productivity Engine: LSTM / XGBoost yield forecast<br/>30-day honey production prediction
    
    Cloud->>Auth: Telemetry + analytics payload
    
    Note over Auth: SHA-256 cryptographic signature<br/>Immutable hash chain for food fraud prevention
    
    Auth->>API: Signed, tamper-proof record
    
    API->>UI: JSON payload via WebSocket / REST
    
    Note over UI: Real-time gauges, charts, alerts<br/>Authenticity verification panel
```

---

## 3. Data Pipeline — Packet Lifecycle

| Stage | Operation | Input | Output | Latency Target |
|:---|:---|:---|:---|:---|
| **1. Capture** | Sensor read / Mock generation | Raw analog/digital signals | JSON telemetry packet | < 50ms |
| **2. Ingest** | MFCC windowing + normalization | Raw packet | Normalized feature vector | < 100ms |
| **3. Edge Inference** | Audio CNN + Anomaly detection | Feature vector | Classification label + confidence | < 200ms |
| **4. Cloud Prediction** | LSTM / XGBoost yield model | Historical weight series | 30-day yield forecast (kg) | < 500ms |
| **5. Sign** | SHA-256 hash chain | Telemetry + analytics | Signed immutable record | < 10ms |
| **6. Deliver** | WebSocket push to dashboard | Signed record | Real-time UI update | < 50ms |

---

## 4. Alert Escalation Matrix

| Condition | Metric Trigger | Severity | User Action |
|:---|:---|:---|:---|
| **High VOC** | VOC > 300 ppm | 🔴 CRITICAL | Investigate for Foulbrood decomposition |
| **Temperature Drop** | Temp < 32°C | 🟡 WARNING | Check brood cluster integrity |
| **High Humidity** | Humidity > 80% | 🟡 WARNING | Inspect for Chalkbrood / ventilation |
| **Acoustic Anomaly** | Freq < 160 Hz | 🔴 CRITICAL | Possible mite infestation or queenless colony |
| **Weight Loss** | Δ Weight < -1kg/day | 🟠 HIGH | Possible robber bee intrusion or swarm |
| **Normal** | All within range | 🟢 OK | No action required |

---

## 5. System Modules

### Module A — Mock Data Engine (`SmartHiveSimulator`)
- Generates lifelike multi-modal telemetry
- Supports health states: `Healthy`, `Foulbrood`, `Chalkbrood`
- Produces: temperature, humidity, weight, VOC, 100-point audio feature array
- Runs on configurable intervals (default: every 15 seconds for demo)

### Module B — Edge AI Engine (`HivePredictiveModel`)
- **Audio CNN**: Classifies mean frequency → Normal vs. Anomaly (threshold: 160 Hz)
- **Yield LSTM**: Linear forecast from historical weight deltas → 30-day projection
- Extensible to TFLite/ONNX for microcontroller deployment

### Module C — Authenticity Chain (`AuthenticityChain`)
- SHA-256 deterministic signing of telemetry + analytics
- Produces tamper-proof JSON records
- Designed for honey origin verification and food fraud prevention

### Module D — Dashboard (`Web Application`)
- Real-time WebSocket data streaming
- Interactive gauges, charts, and hive cards
- Alert notification system with severity levels
- Authenticity audit log viewer
- Multi-hive management

---

## 6. Technology Stack

| Layer | Technology |
|:---|:---|
| **Frontend** | HTML5, CSS3 (Glassmorphism), Vanilla JS, Chart.js |
| **Backend** | Node.js with Express (REST + WebSocket) |
| **AI/ML** | Python (NumPy, mock CNN/LSTM), future: TensorFlow Lite |
| **Data Signing** | SHA-256 (hashlib) |
| **IoT Protocol** | MQTT (paho-mqtt) for live hardware mode |
| **Hardware** | ESP32-S3, SHT31-D, SPH0645, HX711, MQ-135 |
