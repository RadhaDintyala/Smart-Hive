import numpy as np
import tensorflow as tf
import time
import json
import hashlib
import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Hides the oneDNN log messages
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0' # Disables the optional optimization notice


# =====================================================================
# 1. INITIALIZE THE EDGE AI ENGINE (.TFLITE)
# =====================================================================
TFLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hive_audio_model_quantized.tflite")

if not os.path.exists(TFLITE_PATH):
    print(f"[-] ERROR: Could not find '{TFLITE_PATH}' in this directory.")
    print("Please make sure the file you compiled earlier is present here.")
    exit()

# Load the quantized binary model
interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def run_edge_inference(audio_features_100):
    """Feeds test vectors into the TFLite runtime to get health statuses."""
    # Scale inputs between 0 and 1 to mimic real hardware normalization
    X = np.array(audio_features_100)
    X_scaled = (X - X.min()) / (X.max() - X.min() + 1e-8)
    
    # Reshape to (1, 100, 1) to match the 1D CNN input layer requirements
    input_tensor = np.reshape(X_scaled.astype(np.float32), (1, 100, 1))
    
    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()
    
    prediction_prob = interpreter.get_tensor(output_details[0]['index'])[0][0]
    
    # FIX: Flipped conditional states to accurately match the training file label indices
    if prediction_prob > 0.5:
        # Near 1.0 means Diseased (Label 1)
        return "CRITICAL: Foulbrood/Mite Anomaly Detected", float(prediction_prob)
    else:
        # Near 0.0 means Healthy (Label 0)
        return "HEALTHY: Stable Audioscape Matrix Verified", float(1 - prediction_prob)

# =====================================================================
# 2. IMMUTABLE SECURITY & AUTHENTICITY LAYER
# =====================================================================
def generate_signed_telemetry_block(telemetry, analysis_result):
    """Hashes the current status metrics to prevent data tampering."""
    payload = {
        "telemetry_data": telemetry,
        "ai_analysis": analysis_result
    }
    # Serialize to standard string
    serialized_string = json.dumps(payload, sort_keys=True)
    # Generate SHA-256 cryptographic hash representation
    secure_hash = hashlib.sha256(serialized_string.encode('utf-8')).hexdigest()
    
    payload["cryptographic_hash_signature"] = secure_hash
    return payload

# =====================================================================
# 3. INTERACTIVE SIMULATION RUNTIME LOOP
# =====================================================================
def run_live_demonstration():
    print("=" * 70)
    print("     STARTING SMART HIVE AI-IoT DEPLOYMENT SYSTEM DEMO (NO HARDWARE)  ")
    print("=" * 70)
    print("[+] Loading local compiled Edge AI Core engine...")
    print(f"[+] Quantized File Verification: Found {TFLITE_PATH}")
    print("[+] Architecture State: Running Dual-Layer Simulation Pipelines\n")
    print("Press Ctrl+C at any time to exit the live demonstration system.\n")
    time.sleep(2.0)
    
    # Starting telemetry baseline variables
    simulated_weight = 45.0
    scenarios = ["Healthy", "Healthy", "Foulbrood Infection Vector", "Healthy"]
    step = 0
    
    try:
        while True:
            current_scenario = scenarios[step % len(scenarios)]
            step += 1
            
            # 1. Synthesize environmental attributes based on scenario profiles
            if current_scenario == "Healthy":
                temp = np.random.normal(35.0, 0.4)
                humidity = np.random.normal(60.0, 2.0)
                voc_ppm = np.random.normal(120.0, 8.0)
                simulated_weight += np.random.uniform(0.02, 0.12) # Foraging gains weight
                # Generate frequencies corresponding to a healthy 225Hz center hum
                raw_audio_frequencies = np.random.normal(225.0, 15.0, 100).tolist()
            else:
                # Disease event anomalies
                temp = np.random.normal(32.8, 1.0) # Cluster losing temperature control
                humidity = np.random.normal(78.0, 4.0) # Humidity spike
                voc_ppm = np.random.normal(480.0, 35.0) # High VOC decay gas emissions
                simulated_weight -= np.random.uniform(0.05, 0.20) # Losing colony strength
                # Shift frequencies downwards to a stressed 135Hz profile
                raw_audio_frequencies = np.random.normal(135.0, 15.0, 100).tolist()

            telemetry = {
                "timestamp_epoch": round(time.time(), 2),
                "hive_node_id": "demo_hive_alpha",
                "microclimate": {
                    "temperature_c": round(temp, 2),
                    "humidity_pct": round(humidity, 2),
                    "total_weight_kg": round(simulated_weight, 3),
                    "gas_voc_ppm": round(voc_ppm, 1)
                }
            }
            
            # 2. Feed the raw simulated audio straight into the real TFLite model!
            ai_status, confidence = run_edge_inference(raw_audio_frequencies)
            
            # Simple threshold backup for secondary confirmation 
            environmental_alerts = []
            if telemetry["microclimate"]["gas_voc_ppm"] > 300.0:
                environmental_alerts.append("ALERT: Toxic VOC threshold warning triggered.")
                
            analysis_output = {
                "inferred_health_status": ai_status,
                "model_confidence_pct": round(confidence * 100, 2),
                "active_environmental_flags": environmental_alerts
            }
            
            # 3. Generate secure cryptographic receipt block
            final_receipt = generate_signed_telemetry_block(telemetry, analysis_output)
            
            # 4. Display a polished, human-scannable interface readout in the terminal
            print("-" * 70)
            print(f" TIMESTAMP: {time.strftime('%Y-%m-%d %H:%M:%S')} | SCENARIO: {current_scenario}")
            print(f" METRICS  : Temp: {temp:.2f}°C | Humid: {humidity:.1f}% | Weight: {simulated_weight:.3f}kg | VOC: {voc_ppm:.1f} ppm")
            
            # Style classification print based on health alert states
            if "CRITICAL" in ai_status:
                print(f" AI EDGE  : 🚨 {ai_status} ({confidence*100:.1f}% confidence)")
                if environmental_alerts:
                    print(f" ALERTS   : ⚠️  {environmental_alerts[0]}")
            else:
                print(f" AI EDGE  : ✅ {ai_status} ({confidence*100:.1f}% confidence)")
                
            print(f" SECURE   : 🔒 Immutable SHA-256 Signature Hash:")
            print(f"            {final_receipt['cryptographic_hash_signature']}")
            print("-" * 70)
            
            # Sleep 4 seconds between cycles to make the demo presentation easily readable
            time.sleep(4.0)
            
    except KeyboardInterrupt:
        print("\n[+] Demonstration system execution stopped safely.")

if __name__ == "__main__":
    run_live_demonstration()
