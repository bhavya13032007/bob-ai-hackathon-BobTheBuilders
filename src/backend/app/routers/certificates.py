import os
import uuid
import shutil
import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Header, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Certificate, Candidate
from app.config import UPLOAD_DIR
from app.notifications.service import notification_service

router = APIRouter(prefix="/certificates", tags=["certificates"])

class CertificateVerification(BaseModel):
    verification_status: str
    rejection_reason: Optional[str] = None

def get_current_company(x_company_id: str = Header(None)):
    # TODO: replace with real auth before any real deployment
    if not x_company_id:
        raise HTTPException(status_code=401, detail="Missing company authentication header (x-company-id)")
    return x_company_id

@router.patch("/{cert_id}/verify")
def verify_certificate(
    cert_id: str,
    payload: CertificateVerification,
    background_tasks: BackgroundTasks,
    company_id: str = Depends(get_current_company),
    db: Session = Depends(get_db)
):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    if payload.verification_status not in ["Verified", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid verification status. Must be 'Verified' or 'Rejected'.")

    cert.verification_status = payload.verification_status
    cert.verified_by = company_id
    cert.verified_at = datetime.datetime.utcnow()
    
    if payload.verification_status == "Rejected" and payload.rejection_reason:
        cert.rejection_reason = payload.rejection_reason

    db.commit()
    db.refresh(cert)

    # Trigger notification
    action_word = "verified" if payload.verification_status == "Verified" else "rejected"
    msg = f"Your '{cert.title}' credential was {action_word} by the employer."
    if payload.verification_status == "Rejected" and payload.rejection_reason:
        msg += f" Reason: {payload.rejection_reason}"

    notification_service.create_notification(
        db=db,
        user_id=cert.candidate_id,
        title=f"Certificate {payload.verification_status}",
        message=msg,
        category="Certificates",
        related_id=cert.id,
        background_tasks=background_tasks
    )

    return {
        "status": "success",
        "message": f"Certificate {action_word} successfully",
        "certificate": {
            "id": cert.id, 
            "verification_status": cert.verification_status,
            "verified_by": cert.verified_by,
            "rejection_reason": getattr(cert, "rejection_reason", None)
        }
    }

@router.get("/")
def get_certificates(candidate_id: str = "cand_1", db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.candidate_id == candidate_id).order_by(Certificate.created_at.desc()).all()
    
    verified_count = sum(1 for c in certs if c.verification_status == "Verified")
    pending_count = sum(1 for c in certs if c.verification_status == "Pending")
    rejected_count = sum(1 for c in certs if c.verification_status == "Rejected")

    # Match boost calculation (each verified certificate adds 5% profile boost up to 20%)
    profile_boost = min(20, verified_count * 5)

    return {
        "certificates": certs,
        "stats": {
            "total": len(certs),
            "verified": verified_count,
            "pending": pending_count,
            "rejected": rejected_count,
            "profile_boost_percentage": profile_boost
        }
    }

@router.post("/upload")
async def upload_certificate(
    background_tasks: BackgroundTasks,
    candidate_id: str = Form("cand_1"),
    title: str = Form(...),
    issuer: str = Form(...),
    issue_date: str = Form("Recently Uploaded"),
    tags: str = Form("Skills, Credential"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    filename = file.filename or "cert.pdf"
    ext = os.path.splitext(filename)[1].lower()
    
    # Check extension first
    if ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPG, and PNG are allowed.")

    # Read the first 2048 bytes to verify the actual file content/MIME type
    header = await file.read(2048)
    await file.seek(0) # Reset cursor so it can be saved fully later

    import filetype
    kind = filetype.guess(header)
    
    if kind is None:
        raise HTTPException(status_code=400, detail="Corrupted or unrecognized file format.")
        
    allowed_mimes = ["application/pdf", "image/jpeg", "image/png"]
    if kind.mime not in allowed_mimes:
        raise HTTPException(status_code=400, detail=f"File extension matches, but actual file content is {kind.mime}. Only PDF, JPG, and PNG are permitted.")

    cert_id = f"cert_{uuid.uuid4().hex[:8]}"
    file_id = f"{cert_id}{ext}"
    saved_path = os.path.join(UPLOAD_DIR, file_id)

    with open(saved_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cert = Certificate(
        id=cert_id,
        candidate_id=candidate_id,
        title=title,
        issuer=issuer,
        issue_date=issue_date,
        file_url=f"/uploads/{file_id}",
        verification_status="Pending",
        tags=tags,
        created_at=datetime.datetime.utcnow()
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    # In-app notification
    notification_service.create_notification(
        db=db,
        user_id=candidate_id,
        title="Certificate Submitted for Review",
        message=f"Your '{title}' credential from {issuer} was uploaded and queued for company verification.",
        category="Certificates",
        related_id=cert_id,
        background_tasks=background_tasks
    )

    return {
        "status": "success",
        "message": "Certificate uploaded successfully and queued for employer verification.",
        "certificate": {"id": cert.id, "verification_status": cert.verification_status}
    }

@router.delete("/{cert_id}")
def delete_certificate(cert_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    db.delete(cert)
    db.commit()
    return {"status": "success", "message": "Certificate deleted"}
