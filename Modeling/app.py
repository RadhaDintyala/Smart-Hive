import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
import tensorflow as tf
import time
import json
import hashlib
import ollama  # Import the local LLM library

app = Flask(__name__)
CORS(app)

# =====================================================================
# 1. INITIALIZE AI INTERFERENCE ENGINE (.TFLITE)
# =====================================================================
TFLITE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "hive_audio_model_quantized.tflite")
interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

def run_edge_inference(audio_features_100):
    X = np.array(audio_features_100)
    X_scaled = (X - X.min()) / (X.max() - X.min() + 1e-8)
    input_tensor = np.reshape(X_scaled.astype(np.float32), (1, 100, 1))
    
    interpreter.set_tensor(input_details[0]['index'], input_tensor)
    interpreter.invoke()
    
    # FETCH VALUE: Extract the raw prediction array
    raw_prediction = interpreter.get_tensor(output_details[0]['index'])
    
    # FIX: Extract the specific scalar value out of the nested array format
    prediction_prob = float(raw_prediction[0][0])
    
    if prediction_prob > 0.5:
        return "CRITICAL: Foulbrood/Mite Anomaly Detected", prediction_prob
    else:
        return "HEALTHY: Stable Audioscape Matrix Verified", (1.0 - prediction_prob)

# =====================================================================
# 2. LOCAL LLM RECOMMENDATION ENGINE (QWEN 2.5)
# =====================================================================
def get_llm_recommendation(status, temp, humidity, weight, voc):
    """Queries local Qwen2.5:1.5b via Ollama to generate professional apiary interventions."""
    prompt = f"""
    You are an expert commercial apiary health AI assistant. Based on the following real-time smart hive telemetry, provide exactly two sentences of direct, actionable field advice for a beekeeper. 

    CURRENT METRICS:
    - Diagnostic Status: {status}
    - Temperature: {temp}°C (Normal brood nest is 34-36°C)
    - Humidity: {humidity}%
    - Total Weight: {weight}kg
    - Air Quality VOC: {voc} ppm (High VOC indicates organic decay or foulbrood)

    Provide clear, professional steps. Do not include introductory text, pleasantries, or markdown headers. Go straight to the instructions.
    """
    try:
        response = ollama.chat(
            model='qwen2.5:1.5b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return response['message']['content'].strip()
    except Exception as e:
        return "Recommendation engine currently offline. Please ensure 'ollama run qwen2.5:1.5b' is active."

# =====================================================================
# 3. ENDPOINT DEFINITION
# =====================================================================
simulated_weight = 45.0
scenarios = ["Healthy", "Healthy", "Foulbrood Infection Vector", "Healthy"]

@app.route('/api/hive/telemetry', methods=['GET'])
def get_hive_telemetry():
    global simulated_weight
    time_step = int(time.time() / 4)
    current_scenario = scenarios[time_step % len(scenarios)]
    
    if current_scenario == "Healthy":
        temp = np.random.normal(35.1, 0.3)
        humidity = np.random.normal(61.0, 1.5)
        voc_ppm = np.random.normal(115.0, 5.0)
        simulated_weight += np.random.uniform(0.02, 0.08)
        raw_audio_frequencies = np.random.normal(225.0, 15.0, 100).tolist()
    else:
        temp = np.random.normal(32.5, 0.8)
        humidity = np.random.normal(79.0, 3.0)
        voc_ppm = np.random.normal(475.0, 25.0)
        simulated_weight -= np.random.uniform(0.04, 0.15)
        raw_audio_frequencies = np.random.normal(135.0, 15.0, 100).tolist()

    ai_status, confidence = run_edge_inference(raw_audio_frequencies)
    
    # Generate the dynamic recommendation via local Qwen model
    recommendation = get_llm_recommendation(
        status=ai_status,
        temp=round(temp, 2),
        humidity=round(humidity, 1),
        weight=round(simulated_weight, 3),
        voc=round(voc_ppm, 1)
    )

    telemetry = {
        "timestamp_epoch": round(time.time(), 2),
        "hive_node_id": "demo_hive_alpha",
        "scenario_mode": current_scenario,
        "metrics": {
            "temperature_c": round(temp, 2),
            "humidity_pct": round(humidity, 1),
            "total_weight_kg": round(simulated_weight, 3),
            "gas_voc_ppm": round(voc_ppm, 1)
        }
    }
    
    analysis_output = {
        "inferred_health_status": ai_status,
        "status_code": "CRITICAL" if "CRITICAL" in ai_status else "OK",
        "model_confidence_pct": round(confidence * 100, 2),
        "ai_recommendation": recommendation # Added to the payload
    }
    
    payload = {"telemetry_data": telemetry, "ai_analysis": analysis_output}
    serialized_string = json.dumps(payload, sort_keys=True)
    payload["cryptographic_hash_signature"] = hashlib.sha256(serialized_string.encode('utf-8')).hexdigest()
    
    return jsonify(payload)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
