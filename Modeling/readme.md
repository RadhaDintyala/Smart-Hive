## Smart Hive AI-IoT Monitoring Framework (Hardware-Free Demo)
This repository contains the software verification prototype for the Smart Hive Monitoring System. It features a live demonstration dashboard that mounts a real, local Lightweight Edge AI Engine (TensorFlow Lite) to analyze multi-modal hive telemetry entirely via software simulation.
------------------------------
## 📋 System Architecture Architecture Overview
The system architecture implements a split Edge-Cloud topology optimized for real-time agricultural asset tracking:

   1. Data Input Layer: A software telemetry generator that simulates live microclimate fluctuations and hive acoustic frequencies based on biological disease progression metrics.
   2. Edge Compute Layer (AI Inference Engine): A compact 1D Convolutional Neural Network (CNN) running via the tf.lite runtime environment to categorize structural acoustic signatures locally.
   3. Authenticity Layer: A cryptographic pipeline that binds telemetry packets with immutable SHA-256 digital signature hashes to prevent data tampering and secure supply-chain integrity.

------------------------------
## 🛠️ Workspace Prerequisites
To launch the live demonstration dashboard on your machine, you only need a standard Python 3.x environment along with two base calculation modules.
Install the required modules by executing this command in your terminal:

pip install tensorflow numpy

## Required File Structure
Ensure your project workspace directory is structured exactly as follows:

your-project-folder/
├── hive_audio_model_quantized.tflite   <-- The compiled/quantized Edge AI brain
└── dashboard.py                        <-- The main demonstration loop script

------------------------------
## 🚀 Running the Demonstration Dashboard
Execute the active simulation monitor from your terminal:

python dashboard.py

## What Happens Behind the Scenes:

* Real AI Evaluation: The script loads the compressed 15-30 KB hive_audio_model_quantized.tflite file into runtime memory, satisfying the production hardware design constraint of running under 500 KB RAM boundaries.
* Live Environmental Synthesis: The engine cycles through dynamic conditions every 4 seconds, fluctuating baseline parameters across different profiles:
* Healthy States: Simulates stable internal colony warmth (~35°C), high-frequency vibrational profiles (~225Hz hum), and steady weight gains from foraging.
   * Foulbrood Infection Vector: Triggers a noticeable temperature drop (~32.8°C), high moisture levels, low-frequency buzzing distress patterns (~135Hz), and a volatile Volatile Organic Compound (VOC) gas spike (>300 ppm) to mimic organic matter decomposition.
* Tamper Proofing: Every completed evaluation block is compiled into an immutable signature block, displaying a unique cryptographic tracking hash on screen.

------------------------------
## 📊 Interpreting the Output Readout

----------------------------------------------------------------------
 TIMESTAMP: 2026-09-24 21:52:14 | SCENARIO: Foulbrood Infection Vector
 METRICS  : Temp: 32.41°C | Humid: 79.2% | Weight: 44.821kg | VOC: 462.4 ppm
 AI EDGE  : 🚨 CRITICAL: Foulbrood/Mite Anomaly Detected (94.2% confidence)
 ALERTS   : ⚠️  ALERT: Toxic VOC threshold warning triggered.
 SECURE   : 🔒 Immutable SHA-256 Signature Hash:
            216b202b7d3769989288991579ecfae8f4eebd64d51137ff196d50e00219114a
----------------------------------------------------------------------


* ✅ HEALTHY: The model detects a high-register baseline acoustic hum, confirming optimal conditions.
* 🚨 CRITICAL: The local neural network flags a low-frequency registration shift, identifying stress or active infection vectors.
* 🔒 SECURE: The final signature hash acts as a cryptographic seal. If a third party modifies even a single digit of the temperature or weight data after transmission, the verification block breaks, immediately identifying data tampering.

------------------------------
## 🗺️ Physical Hardware Transition Path
When ready to exit software simulation mode and move to live field deployment, the unified data input layer allows developers to drop this code straight into physical nodes without restructuring the application loop:

* Microcontrollers: Flash the .tflite hex array into an ESP32-S3 (8MB PSRAM) development kit running TensorFlow Lite for Microcontrollers.
* Acoustics & Microclimate: Bind the pipeline to physical inputs using digital Knowles SPH0645LM4H I2S microphones and Sensirion SHT31-D I2C sensors.
* Telemetry Transit: Swap the simulator interface for an active Paho-MQTT listener client to burst-transmit telemetry streams to a centralized cloud broker over TLS 1.3 every 15 minutes.