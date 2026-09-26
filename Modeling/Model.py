import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
import os

# ==========================================
# 1. SYNTHETIC REALITY TRAINING GENERATOR
# ==========================================
def generate_training_dataset(num_samples=1000, features_len=100):
    """Generates balanced synthetic audio frequency tensors for model initialization."""
    X = []
    y = [] # 0: Healthy (~225Hz), 1: Anomaly/Disease (~135Hz)
    
    for _ in range(num_samples):
        if np.random.rand() > 0.5:
            # Healthy Signature
            signal = np.random.normal(225.0, 15.0, features_len)
            label = 0
        else:
            # Diseased / Mite / Queenless Signature
            signal = np.random.normal(135.0, 15.0, features_len)
            label = 1
            
        X.append(signal)
        y.append(label)
        
    X = np.array(X)
    y = np.array(y)
    
    # Standard MinMax Scaling to replicate the pipeline normalization layer
    X_min = X.min(axis=1, keepdims=True)
    X_max = X.max(axis=1, keepdims=True)
    X_scaled = (X - X_min) / (X_max - X_min + 1e-8)
    
    # Reshape for 1D CNN Input Layer: (Samples, Spatial Steps, Channels)
    X_scaled = np.expand_dims(X_scaled, axis=-1)
    
    # Split 80/20 into train/validation arrays
    split_idx = int(num_samples * 0.8)
    return X_scaled[:split_idx], y[:split_idx], X_scaled[split_idx:], y[split_idx:]

# ==========================================
# 2. EDGE COMPACT CNN ARCHITECTURE
# ==========================================
def build_edge_cnn(input_shape):
    """Constructs a lightweight CNN tailored for rapid MCU RAM constraints (<500KB)."""
    model = models.Sequential([
        layers.Input(shape=input_shape),
        # Extrapolate localized wave patterns
        layers.Conv1D(16, kernel_size=5, activation='relu', padding='same'),
        layers.MaxPooling1D(pool_size=2),
        
        layers.Conv1D(32, kernel_size=3, activation='relu', padding='same'),
        layers.MaxPooling1D(pool_size=2),
        
        layers.Flatten(),
        layers.Dense(32, activation='relu'),
        layers.Dropout(0.2),
        layers.Dense(1, activation='sigmoid') # Binary classification output
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    return model

# ==========================================
# 3. TRAINING AND COMPRESSION EXECUTION
# ==========================================
if __name__ == "__main__":
    print("Generating Mock Telemetry Spectrogram Features...")
    X_train, y_train, X_val, y_val = generate_training_dataset()
    
    print(f"Train Shape: {X_train.shape} | Validation Shape: {X_val.shape}")
    
    print("\nBuilding Lightweight Edge Inference Engine...")
    model = build_edge_cnn(input_shape=(100, 1))
    model.summary()
    
    print("\nTraining Model on Mock Data Baseline...")
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=10,
        batch_size=32
    )
    
    # Save base Keras representation
    model.save("hive_audio_model.keras")
    print("\nSaved baseline model as 'hive_audio_model.keras'")
    
    # Convert and compress using INT8 Post-Training Quantization
    print("\nConverting model to Quantized TensorFlow Lite (.tflite)...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    
    tflite_quantized_model = converter.convert()
    
    # Save compressed binary
    with open("hive_audio_model_quantized.tflite", "wb") as f:
        f.write(tflite_quantized_model)
        
    file_size_kb = os.path.getsize("hive_audio_model_quantized.tflite") / 1024
    print(f"Quantized TFLite Engine Compiled Successfully!")
    print(f"Final Edge File Size: {file_size_kb:.2f} KB (Target: <500 KB)")
