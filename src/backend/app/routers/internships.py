import json
import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import Internship, Company, Application, Candidate
from app.notifications.service import notification_service
from app.matching.geo_utils import get_location_coordinates

router = APIRouter(prefix="/internships", tags=["internships"])

class ApplicationRequest(BaseModel):
    candidate_id: str
    notes: Optional[str] = None

class InternshipCreate(BaseModel):
    title: str
    org_id: str
    sector: str
    sector_label: Optional[str] = None
    required_skills: str
    state: str
    district: str
    remote_ok: bool = False
    work_mode: str = "In-Office"
    education_required: str = "12th Grade"
    stipend: str = "₹25,000 - ₹35,000 / month"
    stipend_amount: int = 30000
    duration: str = "6 Months (Full-time)"
    deadline: str = "2026-11-30"
    description: str
    responsibilities: Optional[List[str]] = None
    eligibility: Optional[List[str]] = None

@router.get("/")
def list_internships(
    sector: Optional[str] = None,
    work_mode: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Internship).filter(Internship.is_active == True)

    if sector and sector.lower() != "all":
        query = query.filter(Internship.sector == sector.lower())
    if work_mode and work_mode.lower() != "all":
        query = query.filter(Internship.work_mode.ilike(f"%{work_mode}%"))
    if state and state.lower() != "all":
        query = query.filter(Internship.state.ilike(f"%{state}%"))
    if search:
        s = f"%{search}%"
        query = query.filter(
            (Internship.title.ilike(s)) |
            (Internship.required_skills.ilike(s)) |
            (Internship.district.ilike(s)) |
            (Internship.sector_label.ilike(s))
        )

    results = query.all()
    output = []
    for item in results:
        comp = db.query(Company).filter(Company.id == item.org_id).first()
        output.append({
            "id": item.id,
            "title": item.title,
            "org_id": item.org_id,
            "company_name": comp.name if comp else "Leading Enterprise",
            "company_logo": comp.logo_url if comp else None,
            "verified_employer": comp.verified_employer if comp else True,
            "sector": item.sector,
            "sector_label": item.sector_label or item.sector.title(),
            "required_skills": [s.strip() for s in item.required_skills.split(",") if s.strip()],
            "state": item.state,
            "district": item.district,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "remote_ok": item.remote_ok,
            "work_mode": item.work_mode,
            "education_required": item.education_required,
            "stipend": item.stipend,
            "stipend_amount": item.stipend_amount,
            "duration": item.duration,
            "deadline": item.deadline,
            "description": item.description,
            "responsibilities": json.loads(item.responsibilities) if item.responsibilities else [],
            "eligibility": json.loads(item.eligibility) if item.eligibility else []
        })

    return output

@router.get("/{internship_id}")
def get_internship_detail(internship_id: str, db: Session = Depends(get_db)):
    item = db.query(Internship).filter(Internship.id == internship_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Internship not found")

    comp = db.query(Company).filter(Company.id == item.org_id).first()
    
    # Related internships in same sector
    related = db.query(Internship).filter(
        Internship.sector == item.sector,
        Internship.id != item.id
    ).limit(3).all()

    return {
        "internship": {
            "id": item.id,
            "title": item.title,
            "org_id": item.org_id,
            "company_name": comp.name if comp else "Leading Enterprise",
            "company_logo": comp.logo_url if comp else None,
            "verified_employer": comp.verified_employer if comp else True,
            "sector": item.sector,
            "sector_label": item.sector_label or item.sector.title(),
            "required_skills": [s.strip() for s in item.required_skills.split(",") if s.strip()],
            "state": item.state,
            "district": item.district,
            "latitude": item.latitude,
            "longitude": item.longitude,
            "remote_ok": item.remote_ok,
            "work_mode": item.work_mode,
            "education_required": item.education_required,
            "stipend": item.stipend,
            "stipend_amount": item.stipend_amount,
            "duration": item.duration,
            "deadline": item.deadline,
            "description": item.description,
            "responsibilities": json.loads(item.responsibilities) if item.responsibilities else [],
            "eligibility": json.loads(item.eligibility) if item.eligibility else []
        },
        "company": comp,
        "related_internships": [
            {
                "id": r.id,
                "title": r.title,
                "district": r.district,
                "stipend": r.stipend,
                "work_mode": r.work_mode
            } for r in related
        ]
    }

@router.post("/{internship_id}/apply")
def apply_internship(internship_id: str, payload: ApplicationRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    item = db.query(Internship).filter(Internship.id == internship_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Internship not found")

    cand = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # Check if existing
    existing = db.query(Application).filter(
        Application.candidate_id == payload.candidate_id,
        Application.internship_id == internship_id
    ).first()

    if existing:
        return {"status": "already_applied", "application_id": existing.id, "message": "You have already applied for this role."}

    app_id = f"app_{uuid.uuid4().hex[:6]}"
    app_record = Application(
        id=app_id,
        candidate_id=payload.candidate_id,
        internship_id=internship_id,
        status="Applied",
        match_score=88,
        applied_at=datetime.datetime.utcnow(),
        notes=payload.notes or "Applied via PM Internship Portal"
    )
    db.add(app_record)
    db.commit()

    # Trigger candidate confirmation notification
    notification_service.create_notification(
        db=db,
        user_id=cand.id,
        title="Application Submitted Successfully",
        message=f"Your application for '{item.title}' has been received by {item.district} center.",
        category="Applications",
        related_id=app_id,
        background_tasks=background_tasks
    )

    return {
        "status": "success",
        "application_id": app_id,
        "message": f"Successfully applied for {item.title}!"
    }
