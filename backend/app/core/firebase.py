import os
import firebase_admin
from firebase_admin import credentials, auth
import logging

logger = logging.getLogger(__name__)

def init_firebase():
    """Initializes the Firebase Admin SDK."""
    if firebase_admin._apps:
        return firebase_admin.get_app()

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if not cred_path:
        logger.warning("FIREBASE_CREDENTIALS_PATH environment variable is not set. Firebase Admin SDK not initialized.")
        return None

    try:
        cred = credentials.Certificate(cred_path)
        app = firebase_admin.initialize_app(cred)
        logger.info(f"Firebase Admin SDK initialized successfully using credentials at {cred_path}")
        return app
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        return None

def verify_token(id_token: str):
    """Verifies a Firebase ID token and returns the decoded token."""
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        logger.error(f"Error verifying Firebase ID token: {e}")
        return None

def set_email_verified(uid: str, verified: bool = True):
    """Sets the email_verified flag for a user."""
    try:
        user = auth.update_user(uid, email_verified=verified)
        return user
    except Exception as e:
        logger.error(f"Error updating user {uid} email_verified status: {e}")
        return None

# Initialize upon module load if needed, but safer to let main.py or routers call it
init_firebase()
