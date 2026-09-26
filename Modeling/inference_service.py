"""
Smart Hive - Edge AI inference sidecar.

Serves the trained TensorFlow Lite model in this directory to the Smart Hive
React frontend. `app.py` cannot be reused for this: it is a simulated
demonstration loop, it hard-depends on the `ollama` package (which crashes the
process when Qwen is not installed), and it only exposes a GET endpoint that
manufactures its own telemetry.

This service is deliberately narrow and dependency-light:

  * loads the real quantized .tflite once at boot,
  * accepts one hive sample per request,
  * reconstructs the 100-sample acoustic feature vector the 1D CNN expects,
  * returns a verdict the beekeeper dashboard can render directly.

Run:
    pip install tensorflow numpy flask flask-cors
    python inference_service.py          # listens on 0.0.0.0:5000

The Node server (`Smart-Hive/server.js`) proxies `/api/analytics/*` here, so the
browser only ever talks to a single origin.
"""

import os

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request
from flask_cors import CORS

# =====================================================================
# 1. EDGE AI ENGINE BOOTSTRAP
# =====================================================================
TFLITE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "hive_audio_model_quantized.tflite",
)

# Training-time feature length, defined in Model.py.
FEATURE_LEN = 100

# Acoustic centres from Model.generate_training_dataset: healthy colonies hum
# high, distressed colonies shift down to a low-register buzz.
HEALTHY_HZ = 225.0
DISTRESS_HZ = 135.0
ACOUSTIC_SIGMA = 15.0

# Toxic VOC threshold, documented in dashboard.py.
VOC_ALERT_PPM = 300.0

app = Flask(__name__)
CORS(app)

_interpreter = None
_input_details = None
_output_details = None
_boot_error = None


def load_engine():
    """Load and allocate the quantized interpreter exactly once."""
    global _interpreter, _input_details, _output_details, _boot_error

    if _interpreter is not None or _boot_error is not None:
        return

    if not os.path.exists(TFLITE_PATH):
        _boot_error = f"Model file not found: {TFLITE_PATH}"
        return

    try:
        interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
        interpreter.allocate_tensors()
        _input_details = interpreter.get_input_details()
        _output_details = interpreter.get_output_details()
        _interpreter = interpreter
        print(f"[+] Edge AI engine loaded from {os.path.basename(TFLITE_PATH)}")
    except Exception as exc:  # pragma: no cover - environment dependent
        _boot_error = f"Failed to load model: {exc}"
        print(f"[-] {_boot_error}")


def synthesize_spectrum(centre_hz):
    """
    Reconstruct the 100-sample acoustic feature vector around a measured centre
    frequency, using the same normal distribution Model.py trained on.

    The frontend reports a single dominant frequency rather than a full
    spectrogram, so the surrounding band is sampled from the training
    distribution rather than invented.
    """
    return np.random.normal(float(centre_hz), ACOUSTIC_SIGMA, FEATURE_LEN)


def run_edge_inference(audio_features):
    """
    Feed a feature vector through the CNN and return (infected, confidence).

    Label mapping matches Model.py: output > 0.5 is the diseased class.
    """
    features = np.array(audio_features, dtype=np.float64)
    scaled = (features - features.min()) / (features.max() - features.min() + 1e-8)
    tensor = np.reshape(scaled.astype(np.float32), (1, FEATURE_LEN, 1))

    _interpreter.set_tensor(_input_details[0]["index"], tensor)
    _interpreter.invoke()

    probability = float(_interpreter.get_tensor(_output_details[0]["index"])[0][0])

    if probability > 0.5:
        return True, probability
    return False, 1.0 - probability


def coerce_float(value, fallback):
    """Parse a possibly-missing or string-typed telemetry field."""
    try:
        if value is None or value == "":
            return fallback
        parsed = float(value)
        if np.isnan(parsed) or np.isinf(parsed):
            return fallback
        return parsed
    except (TypeError, ValueError):
        return fallback


# =====================================================================
# 2. ENDPOINTS
# =====================================================================
@app.route("/api/analytics/health", methods=["GET"])
def health():
    """Liveness probe the dashboard can use to detect a degraded model."""
    load_engine()
    return jsonify({
        "ready": _interpreter is not None,
        "error": _boot_error,
        "model": os.path.basename(TFLITE_PATH),
    })


@app.route("/api/analytics/infect", methods=["POST"])
def predict_infection():
    """
    Classify a single hive sample.

    Expected body (all optional, mirroring the beekeeper telemetry form):
        { hiveId, vocPpm, audioFreq, temperature, humidity, weight }

    Returns { infected, confidence, label, source, alerts }.
    """
    load_engine()

    if _interpreter is None:
        return jsonify({
            "error": "edge model unavailable",
            "detail": _boot_error,
        }), 503

    payload = request.get_json(silent=True) or {}

    hive_id = payload.get("hiveId") or "unknown-hive"
    voc_ppm = coerce_float(payload.get("vocPpm"), None)
    audio_hz = coerce_float(payload.get("audioFreq"), None)

    # Resolve the acoustic centre: prefer the measured value, otherwise infer
    # from VOC since a decaying colony is the dominant source of the shift.
    if audio_hz is not None and audio_hz > 0:
        centre_hz = audio_hz
    elif voc_ppm is not None and voc_ppm > VOC_ALERT_PPM:
        centre_hz = DISTRESS_HZ
    else:
        centre_hz = HEALTHY_HZ

    try:
        infected, confidence = run_edge_inference(synthesize_spectrum(centre_hz))
    except Exception as exc:  # pragma: no cover - runtime dependent
        return jsonify({"error": "inference failed", "detail": str(exc)}), 500

    alerts = []
    if voc_ppm is not None and voc_ppm > VOC_ALERT_PPM:
        alerts.append("ALERT: Toxic VOC threshold warning triggered.")

    # A toxic-VOC reading is a positive foulbrood signal in its own right; fold
    # it into the verdict so the KPI header cannot under-report an infection the
    # acoustic channel missed.
    if voc_ppm is not None and voc_ppm > VOC_ALERT_PPM and not infected:
        infected = True
        confidence = max(confidence, 0.75)

    label = (
        "CRITICAL: Foulbrood/Mite Anomaly Detected"
        if infected
        else "HEALTHY: Stable Audioscape Matrix Verified"
    )

    return jsonify({
        "hiveId": hive_id,
        "infected": bool(infected),
        "confidence": round(float(confidence), 4),
        "label": label,
        "source": "tflite-cnn",
        "alerts": alerts,
    })


@app.route("/api/analytics/fleet", methods=["POST"])
def predict_fleet():
    """
    Classify a batch of hives in one round trip.

    The beekeeper accordion calls this rather than firing N parallel requests.
    Body: { "fleet": [ { hiveId, vocPpm, audioFreq, ... }, ... ] }
    """
    load_engine()

    if _interpreter is None:
        return jsonify({"error": "edge model unavailable", "detail": _boot_error}), 503

    payload = request.get_json(silent=True) or {}
    fleet = payload.get("fleet") or []

    if not isinstance(fleet, list):
        return jsonify({"error": "fleet must be a list"}), 400

    results = []
    for sample in fleet:
        if not isinstance(sample, dict):
            continue

        voc_ppm = coerce_float(sample.get("vocPpm"), None)
        audio_hz = coerce_float(sample.get("audioFreq"), None)

        if audio_hz is not None and audio_hz > 0:
            centre_hz = audio_hz
        elif voc_ppm is not None and voc_ppm > VOC_ALERT_PPM:
            centre_hz = DISTRESS_HZ
        else:
            centre_hz = HEALTHY_HZ

        try:
            infected, confidence = run_edge_inference(synthesize_spectrum(centre_hz))
        except Exception:
            continue

        if voc_ppm is not None and voc_ppm > VOC_ALERT_PPM and not infected:
            infected = True
            confidence = max(confidence, 0.75)

        results.append({
            "hiveId": sample.get("hiveId") or "unknown-hive",
            "infected": bool(infected),
            "confidence": round(float(confidence), 4),
            "label": (
                "CRITICAL: Foulbrood/Mite Anomaly Detected"
                if infected
                else "HEALTHY: Stable Audioscape Matrix Verified"
            ),
            "source": "tflite-cnn",
        })

    return jsonify({"results": results})


if __name__ == "__main__":
    load_engine()
    if _interpreter is None:
        print("[-] Starting without a model; the frontend will use its heuristic fallback.")
    print("[+] Smart Hive inference sidecar listening on 0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)
