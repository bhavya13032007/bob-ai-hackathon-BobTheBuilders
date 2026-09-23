import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import Company, Internship, Application, Candidate, Certificate
from app.notifications.service import notification_service

router = APIRouter(prefix="/companies", tags=["companies"])

class VerifyCertRequest(BaseModel):
    status: str # "Verified", "Rejected", "Pending"
    verified_by_company_name: Optional[str] = "TechNova Solutions"
    rejection_reason: Optional[str] = None
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str # "Applied", "Under Review", "Selected", "Onboarding", "Rejected"
    notes: Optional[str] = None

@router.get("/")
def list_companies(db: Session = Depends(get_db)):
    comps = db.query(Company).all()
    return comps

@router.get("/{company_id}")
def get_company(company_id: str, db: Session = Depends(get_db)):
    comp = db.query(Company).filter(Company.id == company_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Company not found")
    
    internships_count = db.query(Internship).filter(Internship.org_id == company_id).count()
    return {
        "company": comp,
        "total_active_internships": internships_count
    }

@router.get("/{company_id}/applicants")
def get_company_applicants(company_id: str, db: Session = Depends(get_db)):
    # Find all internships for this company
    company_internships = db.query(Internship).filter(Internship.org_id == company_id).all()
    int_ids = [i.id for i in company_internships]
    int_lookup = {i.id: i for i in company_internships}

    # Query all applications for these internships
    apps = db.query(Application).filter(Application.internship_id.in_(int_ids)).order_by(Application.applied_at.desc()).all()

    output = []
    for app_item in apps:
        cand = db.query(Candidate).filter(Candidate.id == app_item.candidate_id).first()
        internship = int_lookup.get(app_item.internship_id)
        
        # Fetch candidate certificates
        certs = db.query(Certificate).filter(Certificate.candidate_id == app_item.candidate_id).all()

        output.append({
            "application_id": app_item.id,
            "status": app_item.status,
            "match_score": app_item.match_score,
            "applied_at": app_item.applied_at.isoformat() if app_item.applied_at else None,
            "notes": app_item.notes,
            "internship": {
                "id": internship.id if internship else None,
                "title": internship.title if internship else "Internship",
                "sector": internship.sector if internship else "General",
                "sector_label": internship.sector_label if internship else "General"
            },
            "candidate": {
                "id": cand.id if cand else None,
                "name": cand.name if cand else "Candidate",
                "email": cand.email if cand else None,
                "phone": cand.phone if cand else None,
                "education_level": cand.education_level if cand else "Graduate",
                "location": f"{cand.district}, {cand.state}" if cand else "India",
                "skills": [s.strip() for s in cand.skills.split(",") if s.strip()] if cand and cand.skills else [],
                "avatar_url": cand.avatar_url if cand else None,
                "profile_strength": cand.profile_strength if cand else 75
            },
            "certificates": [
                {
                    "id": c.id,
                    "title": c.title,
                    "issuer": c.issuer,
                    "issue_date": c.issue_date,
                    "verification_status": c.verification_status,
                    "verified_by": c.verified_by,
                    "rejection_reason": c.rejection_reason,
                    "file_url": c.file_url,
                    "tags": c.tags
                } for c in certs
            ]
        })

    return output

@router.put("/certificates/{cert_id}/verify")
def verify_candidate_certificate(cert_id: str, payload: VerifyCertRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")

    old_status = cert.verification_status
    cert.verification_status = payload.status
    if payload.status == "Verified":
        cert.verified_by = payload.verified_by_company_name or "Verified Recruiter"
        cert.verified_at = datetime.datetime.utcnow()
        cert.rejection_reason = None

        # Send positive notification to candidate
        notification_service.create_notification(
            db=db,
            user_id=cert.candidate_id,
            title="Certificate Verified! 🎉",
            message=f"Your '{cert.title}' certificate was successfully verified by {cert.verified_by}. Your profile match score increased!",
            category="Certificates",
            related_id=cert.id,
            background_tasks=background_tasks
        )
    elif payload.status == "Rejected":
        cert.rejection_reason = payload.rejection_reason or "Document copy is illegible or unverifiable."
        cert.verified_by = payload.verified_by_company_name
        cert.verified_at = datetime.datetime.utcnow()

        # Send update notification to candidate
        notification_service.create_notification(
            db=db,
            user_id=cert.candidate_id,
            title="Certificate Verification Action Required",
            message=f"Your '{cert.title}' certificate needs review: {cert.rejection_reason}",
            category="Certificates",
            related_id=cert.id,
            background_tasks=background_tasks
        )
    else:
        cert.verification_status = "Pending"

    db.commit()
    db.refresh(cert)

    return {
        "status": "success",
        "message": f"Certificate status updated from {old_status} to {payload.status}.",
        "certificate": cert
    }

@router.put("/applications/{application_id}/status")
def update_application_status(application_id: str, payload: ApplicationStatusUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    app_record = db.query(Application).filter(Application.id == application_id).first()
    if not app_record:
        raise HTTPException(status_code=404, detail="Application not found")

    app_record.status = payload.status
    if payload.notes:
        app_record.notes = payload.notes

    internship = db.query(Internship).filter(Internship.id == app_record.internship_id).first()
    int_title = internship.title if internship else "internship"

    db.commit()

    # Trigger application update alert
    notification_service.create_notification(
        db=db,
        user_id=app_record.candidate_id,
        title=f"Application Update: {payload.status}",
        message=f"Your application status for '{int_title}' has moved to '{payload.status}'.",
        category="Applications",
        related_id=app_record.id,
        background_tasks=background_tasks
    )

    return {
        "status": "success",
        "message": f"Application status updated to {payload.status}.",
        "application_id": app_record.id
    }
