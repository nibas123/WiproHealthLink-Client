"""
Model Training Script for Ergonomic Overwork Detection
Trains a time-series classification model (LSTM) on synthetic and anonymized ergonomic data.
Exports model in TensorFlow.js format for browser inference.
"""
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Synthetic data generation (replace with real anonymized data for production)
def generate_synthetic_data(num_samples=10000, seq_length=60):
    X = np.random.rand(num_samples, seq_length, 2)  # [keystroke_freq, mouse_activity]
    y = (X.mean(axis=1)[:, 0] > 0.6).astype(int)  # Label: 1 if high keystroke freq
    return X, y

X, y = generate_synthetic_data()

model = keras.Sequential([
    layers.Input(shape=(X.shape[1], X.shape[2])),
    layers.LSTM(32, return_sequences=False),
    layers.Dense(16, activation='relu'),
    layers.Dense(1, activation='sigmoid')
])

model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
model.fit(X, y, epochs=5, batch_size=64)

# Save model for TensorFlow.js
import subprocess
model.save('ergonomic_model.h5')
subprocess.run(['tensorflowjs_converter', '--input_format=keras', 'ergonomic_model.h5', 'tfjs_model'])

print('Model trained and exported to tfjs_model/')
