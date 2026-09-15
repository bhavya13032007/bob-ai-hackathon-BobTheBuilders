import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import Candidate, Certificate, Application
from app.matching.geo_utils import get_location_coordinates

router = APIRouter(prefix="/candidates", tags=["candidates"])

class CandidateCreateUpdate(BaseModel):
    id: Optional[str] = None
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    education_level: str = "Graduate"
    state: str = "Maharashtra"
    district: str = "Mumbai"
    remote_ok: bool = True
    skills: str = "Communication, Problem Solving, Technical"
    sector_interests: str = "it, manufacturing, finance"
    experience_notes: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/")
def get_all_candidates(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()
    return candidates

@router.get("/{candidate_id}")
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    certs_count = db.query(Certificate).filter(Certificate.candidate_id == candidate_id).count()
    verified_certs_count = db.query(Certificate).filter(
        Certificate.candidate_id == candidate_id,
        Certificate.verification_status == "Verified"
    ).count()
    apps_count = db.query(Application).filter(Application.candidate_id == candidate_id).count()

    # Dynamic profile strength calculation
    skills_list = [s.strip() for s in cand.skills.split(",") if s.strip()] if cand.skills else []
    strength = 50
    if len(skills_list) >= 3:
        strength += 15
    if len(skills_list) >= 5:
        strength += 10
    if cand.education_level:
        strength += 10
    if verified_certs_count > 0:
        strength += 15
    strength = min(100, strength)

    return {
        "candidate": cand,
        "skills_list": skills_list,
        "sectors_list": [s.strip() for s in cand.sector_interests.split(",") if s.strip()] if cand.sector_interests else [],
        "stats": {
            "profile_strength": strength,
            "total_certificates": certs_count,
            "verified_certificates": verified_certs_count,
            "total_applications": apps_count
        }
    }

@router.post("/")
def create_or_update_candidate(payload: CandidateCreateUpdate, db: Session = Depends(get_db)):
    cid = payload.id if payload.id else f"cand_{uuid.uuid4().hex[:6]}"
    cand = db.query(Candidate).filter(Candidate.id == cid).first()

    lat, lon = get_location_coordinates(payload.district, payload.state)

    if not cand:
        cand = Candidate(
            id=cid,
            name=payload.name,
            email=payload.email,
            phone=payload.phone,
            education_level=payload.education_level,
            state=payload.state,
            district=payload.district,
            latitude=lat,
            longitude=lon,
            remote_ok=payload.remote_ok,
            skills=payload.skills,
            sector_interests=payload.sector_interests,
            experience_notes=payload.experience_notes,
            avatar_url=payload.avatar_url or "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80"
        )
        db.add(cand)
    else:
        cand.name = payload.name
        if payload.email: cand.email = payload.email
        if payload.phone: cand.phone = payload.phone
        cand.education_level = payload.education_level
        cand.state = payload.state
        cand.district = payload.district
        cand.latitude = lat
        cand.longitude = lon
        cand.remote_ok = payload.remote_ok
        cand.skills = payload.skills
        cand.sector_interests = payload.sector_interests
        if payload.experience_notes: cand.experience_notes = payload.experience_notes

    db.commit()
    db.refresh(cand)
    return cand
