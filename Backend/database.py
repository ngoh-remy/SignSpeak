# ============================================================
# database.py — All database operations in one place
# ============================================================

import mysql.connector
import bcrypt
# 💡 bcrypt is a password hashing library
#    It converts "mypassword123" → "$2b$12$xK8Qz..." (unreadable)
#    Even if the database is hacked, passwords can't be recovered

# ── Database Connection Config ────────────────────────────────────────────
import os

DB_CONFIG = {
    "host"    : os.environ.get("DB_HOST",     "localhost"),
    "user"    : os.environ.get("DB_USER",     "root"),
    "password": os.environ.get("DB_PASSWORD", "yourpassword"),
    "database": os.environ.get("DB_NAME",     "signspeakdb")
}
# 💡 os.environ.get() reads secret values from Railway's environment
#    instead of hardcoding passwords in our code
#    The second argument is the fallback for local development


def get_connection():
    """Creates and returns a new database connection."""
    return mysql.connector.connect(**DB_CONFIG)
    # 💡 **DB_CONFIG unpacks the dictionary as keyword arguments
    #    Same as writing: connect(host="localhost", user="root", ...)


# ── User Operations ───────────────────────────────────────────────────────

def create_user(username, email, password):
    """
    Hashes the password and saves a new user to the database.
    Returns True if successful, False if username/email already exists.
    """
    # Hash the password before storing
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    # 💡 password.encode('utf-8') converts string to bytes (bcrypt needs bytes)
    #    bcrypt.gensalt() generates a random "salt" — extra random data
    #    mixed into the hash so two identical passwords produce different hashes

    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed)
        )
        # 💡 %s are placeholders — mysql fills them in safely
        #    This prevents SQL injection attacks!
        conn.commit()
        # 💡 commit() saves the changes permanently to the database
        return True
    except mysql.connector.IntegrityError:
        # 💡 IntegrityError happens when username or email already exists
        #    (because we set UNIQUE on those columns)
        return False
    finally:
        cursor.close()
        conn.close()
        # 💡 Always close connections — like turning off the tap after use


def verify_user(email, password):
    """
    Checks if email exists and password matches.
    Returns user dict if valid, None if invalid.
    """
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    # 💡 dictionary=True returns rows as dicts: {"id": 1, "username": "remy"}
    #    instead of tuples: (1, "remy")

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), 
                                user['password'].encode('utf-8')):
        # 💡 bcrypt.checkpw hashes the provided password with the same salt
        #    and checks if it matches the stored hash
        #    We never "decrypt" passwords — we just re-hash and compare!
        return user
    return None


def get_user_by_id(user_id):
    """Returns a user by their ID."""
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, username, email FROM users WHERE id = %s", 
                   (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user


# ── Prediction Operations ─────────────────────────────────────────────────

def save_prediction(user_id, gesture, confidence):
    """Saves a prediction result to the database."""
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO predictions (user_id, gesture, confidence) "
        "VALUES (%s, %s, %s)",
        (user_id, gesture, confidence)
    )
    conn.commit()
    cursor.close()
    conn.close()


def get_user_history(user_id, limit=20):
    """Returns the last 20 predictions for a user."""
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT gesture, confidence, created_at FROM predictions "
        "WHERE user_id = %s ORDER BY created_at DESC LIMIT %s",
        (user_id, limit)
    )
    # 💡 ORDER BY created_at DESC → newest predictions first
    #    LIMIT 20 → only return last 20 records
    history = cursor.fetchall()
    cursor.close()
    conn.close()
    return history