from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from typing import Optional
import random
import string
import time
from app.core.firebase import verify_token, set_email_verified
from app.core.email import send_otp_email, send_login_notification
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

# Simple in-memory cache for OTPs. In production, use Redis or DB.
# Structure: { "uid": {"otp": "123456", "expires_at": 1699999999, "email": "test@test.com"} }
otp_cache = {}

class OTPSendRequest(BaseModel):
    uid: str
    email: str

class OTPVerifyRequest(BaseModel):
    uid: str
    otp: str

class LoginRequest(BaseModel):
    id_token: str

def generate_otp(length=6):
    return ''.join(random.choices(string.digits, k=length))

@router.post("/send-signup-otp")
@limiter.limit("3/minute")
async def send_signup_otp(request: Request, payload: OTPSendRequest):
    """Generates and sends an OTP for sign-up verification."""
    otp = generate_otp()
    # Expire in 10 minutes
    expires_at = time.time() + 600
    otp_cache[payload.uid] = {
        "otp": otp,
        "expires_at": expires_at,
        "email": payload.email
    }
    
    success = send_otp_email(payload.email, otp)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send OTP email.")
        
    return {"message": "OTP sent successfully."}

@router.post("/verify-signup-otp")
@limiter.limit("5/minute")
async def verify_signup_otp(request: Request, payload: OTPVerifyRequest):
    """Verifies the sign-up OTP and marks the Firebase user as emailVerified."""
    record = otp_cache.get(payload.uid)
    if not record:
        raise HTTPException(status_code=400, detail="OTP not requested or expired.")
        
    if time.time() > record["expires_at"]:
        del otp_cache[payload.uid]
        raise HTTPException(status_code=400, detail="OTP expired.")
        
    if record["otp"] != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP.")
        
    # OTP is valid. Update Firebase user.
    user = set_email_verified(payload.uid, True)
    if not user:
        raise HTTPException(status_code=500, detail="Failed to verify user in Firebase.")
        
    # Cleanup OTP
    del otp_cache[payload.uid]
    
    return {"message": "Email verified successfully."}

@router.post("/login")
async def login(payload: LoginRequest):
    """Unified login endpoint to verify Firebase ID token and trigger notification."""
    decoded_token = verify_token(payload.id_token)
    if not decoded_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid ID token.")
        
    email = decoded_token.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email not found in ID token.")
        
    # Background task or synchronous call to send notification
    # For now, synchronous call, but ideally use BackgroundTasks
    success = send_login_notification(email)
    if not success:
        # We don't fail the login if notification fails, just log it (which send_login_notification already does).
        pass
        
    return {"message": "Login successful.", "uid": decoded_token.get("uid")}
