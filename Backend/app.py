# ============================================================
# app.py — Main Flask server
# ============================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                jwt_required, get_jwt_identity)
import numpy as np
import cv2
import base64

from database    import create_user, verify_user, get_user_by_id
from database    import save_prediction, get_user_history
from model_loader import predict_gesture
from datetime import timedelta

# 💡 We import from our own files (database.py, model_loader.py)
#    Just like importing from any library — Python finds them
#    because they're in the same folder

# ── App Setup ─────────────────────────────────────────────────────────────
app = Flask(__name__)
# 💡 Creates the Flask application — this is the core of our server



app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "signspeaksecretkey2025"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)
# 💡 This makes tokens last 24 hours instead of 15 minutes
#    timedelta(hours=24) creates a "time duration" of 24 hours
#    Much better for development and normal usage!
# 💡 Secret key used to sign login tokens
#    In production this should be a long random string stored securely
#    For development, any string works

CORS(app)
# 💡 Allows React (running on port 3000) to make requests to Flask
#    (running on port 5000). Without this, browsers block cross-origin requests
#    Think of it as adding our React app to the guest list

jwt = JWTManager(app)
# 💡 Initializes the JWT manager — handles creating and verifying login tokens


# ── AUTH ROUTES ───────────────────────────────────────────────────────────

@app.route('/register', methods=['POST'])
def register():
    """
    Accepts: { username, email, password }
    Returns: success message or error
    """
    data     = request.get_json()
    # 💡 request.get_json() reads the JSON body sent by the frontend
    #    e.g. { "username": "remy", "email": "r@r.com", "password": "123" }

    username = data.get('username')
    email    = data.get('email')
    password = data.get('password')

    # Basic validation
    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    # 💡 400 = Bad Request — the client sent incomplete data
    #    jsonify() converts a Python dict to JSON format for the response

    success = create_user(username, email, password)

    if success:
        return jsonify({"message": "Account created successfully!"}), 201
        # 💡 201 = Created — standard HTTP code for successful creation
    else:
        return jsonify({"error": "Username or email already exists"}), 409
        # 💡 409 = Conflict — the resource already exists


@app.route('/login', methods=['POST'])
def login():
    """
    Accepts: { email, password }
    Returns: JWT access token + user info
    """
    data     = request.get_json()
    email    = data.get('email')
    password = data.get('password')

    user = verify_user(email, password)

    if user:
        # Create a JWT token containing the user's ID
        token = create_access_token(identity=str(user['id']))
        # 💡 The token is a signed string that proves who the user is
        #    It expires after a set time (default 1 hour)
        #    The frontend stores this and sends it with every request
        return jsonify({
            "token"   : token,
            "username": user['username'],
            "id"      : user['id']
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401
        # 💡 401 = Unauthorized — credentials don't match


# ── PREDICTION ROUTE ──────────────────────────────────────────────────────

@app.route('/predict', methods=['POST'])
@jwt_required()
# 💡 @jwt_required() protects this route — only logged in users can access it
#    If someone sends a request without a valid token, Flask returns 401
def predict():
    """
    Accepts: { frames: [base64_image, base64_image, ...] } (30 frames)
    Returns: { gesture, confidence }
    """
    user_id = int(get_jwt_identity())
    # 💡 Extracts the user ID we stored in the token during login

    data   = request.get_json()
    frames = data.get('frames', [])
    # 💡 The frontend sends 30 frames as base64 encoded strings
    #    base64 is a way to convert binary image data to text
    #    so it can be sent inside JSON

    if len(frames) != 30:
        return jsonify({"error": "Exactly 30 frames required"}), 400

    # Decode each base64 frame back to a numpy array
    processed_frames = []
    for frame_b64 in frames:
        # Decode base64 string to bytes
        img_bytes = base64.b64decode(frame_b64)
        # 💡 base64.b64decode reverses the encoding — bytes back to image data

        # Convert bytes to numpy array
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        # 💡 np.frombuffer reads raw bytes as numbers

        # Decode to actual image
        frame = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
        # 💡 cv2.imdecode converts the numpy array to an actual image
        #    IMREAD_GRAYSCALE loads it in grayscale (single channel)

        # Resize and normalize
        frame = cv2.resize(frame, (64, 64))
        frame = frame / 255.0
        # 💡 Same preprocessing we did in Phase 3!

        processed_frames.append(frame.reshape(64, 64, 1))
        # 💡 Add channel dimension: (64,64) → (64,64,1)

    # Get prediction from model
    gesture, confidence = predict_gesture(processed_frames)

    # Save to database
    save_prediction(user_id, gesture, confidence)

    return jsonify({
        "gesture"   : gesture,
        "confidence": confidence
    }), 200


# ── HISTORY ROUTE ─────────────────────────────────────────────────────────

@app.route('/history', methods=['GET'])
@jwt_required()
def history():
    """Returns the last 20 predictions for the logged-in user."""
    user_id = int(get_jwt_identity())
    records = get_user_history(user_id)

    # Convert datetime objects to strings for JSON
    for record in records:
        record['created_at'] = str(record['created_at'])
    # 💡 JSON doesn't understand Python datetime objects
    #    str() converts them to readable strings like "2025-04-09 14:30:00"

    return jsonify({"history": records}), 200


# ── PROFILE ROUTE ─────────────────────────────────────────────────────────

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """Returns basic info about the logged-in user."""
    user_id = int(get_jwt_identity())
    user    = get_user_by_id(user_id)
    if user:
        return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404


# ── RUN SERVER ────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import os
port = int(os.environ.get('PORT', 5000))
app.run(debug=False, host='0.0.0.0', port=port)
# 💡 os.environ.get('PORT') reads the port Railway assigns automatically
#    host='0.0.0.0' makes Flask accessible from outside the server
#    debug=False — never run debug mode in production!
    # 💡 debug=True → shows detailed errors and auto-restarts when you
    #    save changes to the code (very helpful during development!)
    #    port=5000 → server runs at http://localhost:5000