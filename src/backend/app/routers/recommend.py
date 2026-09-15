import json
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import Internship, Company, Candidate
from app.matching.engine import recommendation_engine
from app.matching.geo_utils import get_location_coordinates

router = APIRouter(prefix="/recommend", tags=["recommendations"])

class CandidateInput(BaseModel):
    candidate_id: Optional[str] = None
    name: Optional[str] = "Candidate"
    education_level: str = "Graduate"
    skills: List[str] = ["Communication", "Problem Solving"]
    sector_interests: List[str] = ["it", "manufacturing"]
    state: str = "Maharashtra"
    district: str = "Mumbai"
    remote_ok: bool = True
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_strength: Optional[int] = 75

@router.post("/")
def get_recommendations(payload: CandidateInput, db: Session = Depends(get_db)):
    cand_dict = payload.dict()
    
    # If candidate_id is provided, merge with stored DB values
    if payload.candidate_id:
        db_cand = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
        if db_cand:
            cand_dict["name"] = db_cand.name
            cand_dict["education_level"] = payload.education_level or db_cand.education_level
            if not payload.skills:
                cand_dict["skills"] = [s.strip() for s in db_cand.skills.split(",") if s.strip()]
            if not payload.sector_interests:
                cand_dict["sector_interests"] = [s.strip() for s in db_cand.sector_interests.split(",") if s.strip()]
            cand_dict["state"] = payload.state or db_cand.state
            cand_dict["district"] = payload.district or db_cand.district
            cand_dict["remote_ok"] = payload.remote_ok if payload.remote_ok is not None else db_cand.remote_ok
            # Pass Verified Certificate Data to Matching Engine for Context-Aware Boost
            from app.db.models import Certificate
            certs = db.query(Certificate).filter(
                Certificate.candidate_id == payload.candidate_id,
                Certificate.verification_status == "Verified"
            ).all()
            
            verified_cert_tags = []
            for c in certs:
                if c.tags:
                    verified_cert_tags.extend([t.strip() for t in c.tags.split(",")])
                if c.title:
                    verified_cert_tags.append(c.title)
                    
            cand_dict["verified_cert_tags"] = verified_cert_tags
        else:
            cand_dict["verified_cert_tags"] = []
    else:
        cand_dict["verified_cert_tags"] = []

    # Ensure latitude and longitude
    if cand_dict.get("latitude") is None or cand_dict.get("longitude") is None:
        lat, lon = get_location_coordinates(cand_dict.get("district", ""), cand_dict.get("state", ""))
        cand_dict["latitude"] = lat
        cand_dict["longitude"] = lon

    # Fetch active internships
    db_internships = db.query(Internship).filter(Internship.is_active == True).all()
    internships_list = []
    
    for item in db_internships:
        comp = db.query(Company).filter(Company.id == item.org_id).first()
        internships_list.append({
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

    # Run hybrid matching with MMR diversity re-ranking
    results = recommendation_engine.recommend(
        candidate=cand_dict,
        internships=internships_list,
        top_n=5
    )

    return results
