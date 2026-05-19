# ============================================================
# model_loader.py — Loads the AI model once when server starts
# ============================================================

import tensorflow as tf
import numpy as np
import pickle
import os

# 💡 We load the model ONCE when the server starts
#    Not every time a request comes in — that would be very slow!
#    Think of it like a chef who prepares their tools once at the
#    start of the day, not before cooking each individual dish

# Paths to our saved model files from Phase 3
import os

MODEL_PATH   = os.environ.get("MODEL_PATH",   "best_model_v2.keras")
ENCODER_PATH = os.environ.get("ENCODER_PATH", "label_encoder.pkl")
# 💡 No more ../ — files are now in the same Backend/ folder!

# Load the trained model
model = tf.keras.models.load_model(MODEL_PATH)
# 💡 This loads all 4.3 million parameters we trained in Phase 3
#    The model is now ready to make predictions

# Load the label encoder
with open(ENCODER_PATH, "rb") as f:
    label_encoder = pickle.load(f)
# 💡 This loads the mapping: 0→drink, 1→go, 2→help, 3→no, 4→yes
#    Without this, the model would output numbers like "2"
#    instead of the actual gesture name "help"

IMG_SIZE        = 64
SEQUENCE_LENGTH = 30

print("✅ Model and label encoder loaded successfully!")
print(f"   Gesture classes: {[str(c) for c in label_encoder.classes_]}")

def predict_gesture(frames):
    """
    Takes a list of frames (as base64 or numpy arrays),
    runs the model, returns the predicted gesture and confidence.

    Input:  list of 30 frames, each (64, 64, 1)
    Output: (gesture_name, confidence_percentage)
    """
    # Stack frames into a sequence array
    sequence = np.array(frames)
    # 💡 Converts list of 30 frames → numpy array of shape (30, 64, 64, 1)

    # Convert grayscale to RGB (MobileNetV2 needs 3 channels)
    sequence_rgb = np.repeat(sequence, 3, axis=-1)
    # 💡 (30, 64, 64, 1) → (30, 64, 64, 3)

    # Run each frame through the model
    predictions = model.predict(sequence_rgb, verbose=0)
    # 💡 Shape: (30, 5) — 30 frames, each with 5 class probabilities

    # Majority voting — sum probabilities across all frames
    avg_pred     = np.sum(predictions, axis=0)
    class_index  = np.argmax(avg_pred)
    confidence   = float(avg_pred[class_index] / np.sum(avg_pred))
    # 💡 confidence = how sure we are, as a fraction of total votes
    #    e.g. if drink got 25 out of 30 votes → confidence = 0.83 = 83%

    gesture_name = label_encoder.classes_[class_index]
    # 💡 Converts class index back to gesture name
    #    e.g. 0 → "drink"

    return gesture_name, round(confidence * 100, 2)
    # 💡 Returns e.g. ("drink", 94.78)