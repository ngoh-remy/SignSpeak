from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (JWTManager, create_access_token,
                                jwt_required, get_jwt_identity)
import numpy as np
import cv2
import base64
import os
from datetime import timedelta

from database    import create_user, verify_user, get_user_by_id
from database    import save_prediction, get_user_history, get_connection
from model_loader import predict_gesture

# ── App Setup ──────────────────────────────────────────────
app = Flask(__name__)
# 💡 Only ONE Flask app definition — the duplicate was causing issues!
app.config["JWT_SECRET_KEY"]            = "signspeaksecretkey2025"
app.config["JWT_ACCESS_TOKEN_EXPIRES"]  = timedelta(hours=24)

CORS(app, origins=[
    "http://localhost:5173",
    "https://sign-speak-kohl.vercel.app"
])

jwt = JWTManager(app)

# ── AUTH ROUTES ────────────────────────────────────────────

@app.route('/register', methods=['POST'])
def register():
    data     = request.get_json()
    username = data.get('username')
    email    = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    success = create_user(username, email, password)
    if success:
        return jsonify({"message": "Account created successfully!"}), 201
    else:
        return jsonify({"error": "Username or email already exists"}), 409


@app.route('/login', methods=['POST'])
def login():
    data     = request.get_json()
    email    = data.get('email')
    password = data.get('password')
    user     = verify_user(email, password)

    if user:
        token = create_access_token(identity=str(user['id']))
        return jsonify({
            "token"   : token,
            "username": user['username'],
            "id"      : user['id']
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401


# ── PREDICTION ROUTE ───────────────────────────────────────

@app.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    data    = request.get_json()
    frames  = data.get('frames', [])

    if len(frames) != 30:
        return jsonify({"error": f"Exactly 30 frames required, got {len(frames)}"}), 400

    processed_frames = []
    for frame_b64 in frames:
        try:
            img_bytes = base64.b64decode(frame_b64)
            img_array = np.frombuffer(img_bytes, dtype=np.uint8)
            frame     = cv2.imdecode(img_array, cv2.IMREAD_GRAYSCALE)
            if frame is None:
                continue
            frame = cv2.resize(frame, (64, 64))
            frame = frame / 255.0
            processed_frames.append(frame.reshape(64, 64, 1))
        except Exception as e:
            continue

    if len(processed_frames) != 30:
        return jsonify({"error": "Failed to process all frames"}), 400

    gesture, confidence = predict_gesture(processed_frames)
    save_prediction(user_id, gesture, confidence)

    return jsonify({
        "gesture"   : gesture,
        "confidence": confidence
    }), 200


# ── HISTORY ROUTE ──────────────────────────────────────────

@app.route('/history', methods=['GET'])
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    try:
        conn   = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT gesture, confidence, created_at FROM predictions
            WHERE user_id = %s ORDER BY created_at DESC LIMIT 50
        """, (user_id,))
        records = cursor.fetchall()
        for r in records:
            r['created_at'] = str(r['created_at'])

        cursor.execute("SELECT COUNT(*) as total FROM predictions WHERE user_id = %s", (user_id,))
        total = cursor.fetchone()['total']

        cursor.execute("""
            SELECT gesture, COUNT(*) as cnt FROM predictions
            WHERE user_id = %s GROUP BY gesture ORDER BY cnt DESC LIMIT 1
        """, (user_id,))
        most_used_row = cursor.fetchone()
        most_used = most_used_row['gesture'] if most_used_row else 'None'

        cursor.execute("""
            SELECT COUNT(*) as today FROM predictions
            WHERE user_id = %s AND DATE(created_at) = DATE(NOW())
        """, (user_id,))
        today = cursor.fetchone()['today']

        cursor.execute("""
            SELECT AVG(confidence) as avg_conf FROM predictions WHERE user_id = %s
        """, (user_id,))
        avg_row  = cursor.fetchone()
        avg_conf = round(float(avg_row['avg_conf']), 1) if avg_row['avg_conf'] else 0

        cursor.execute("""
            SELECT DISTINCT gesture FROM predictions
            WHERE user_id = %s AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        """, (user_id,))
        recent   = [r['gesture'] for r in cursor.fetchall()]
        all_g    = ['drink', 'go', 'help', 'yes', 'no']
        not_used = [g for g in all_g if g not in recent]

        cursor.close()
        conn.close()

        return jsonify({
            "history"    : records,
            "stats"      : {"total": total, "most_used": most_used, "today": today, "avg_conf": avg_conf},
            "suggestions": not_used
        }), 200

    except Exception as e:
        print(f"History error: {str(e)}")
        return jsonify({
            "history": [], "stats": {"total": 0, "most_used": "None", "today": 0, "avg_conf": 0},
            "suggestions": []
        }), 200


# ── PROFILE ROUTE ──────────────────────────────────────────

@app.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user    = get_user_by_id(user_id)
    if user:
        return jsonify(user), 200
    return jsonify({"error": "User not found"}), 404


# ── RUN SERVER ─────────────────────────────────────────────

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
    # 💡 All 3 lines are properly indented inside if __name__ block!