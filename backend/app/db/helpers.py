import json
import logging
from sqlalchemy.orm import Session
from app.db.models import Candidate

logger = logging.getLogger(__name__)

def get_candidate_skill_verifications(candidate: Candidate) -> dict:
    """Reads the candidate's skill_verifications JSON column safely."""
    if not candidate.skill_verifications:
        return {}
    try:
        return json.loads(candidate.skill_verifications)
    except json.JSONDecodeError:
        logger.error(f"Failed to decode skill_verifications for candidate {candidate.id}")
        return {}

def set_candidate_skill_verifications(candidate: Candidate, verifications: dict):
    """Writes to the candidate's skill_verifications JSON column safely."""
    try:
        candidate.skill_verifications = json.dumps(verifications)
    except Exception as e:
        logger.error(f"Failed to encode skill_verifications for candidate {candidate.id}: {e}")

def get_skill_status(candidate: Candidate, skill_name: str) -> str:
    """Gets the verification status for a specific skill. Returns 'unverified' if not found."""
    verifications = get_candidate_skill_verifications(candidate)
    return verifications.get(skill_name.lower().strip(), "unverified")

def set_skill_status(candidate: Candidate, skill_name: str, status: str, db: Session):
    """Updates the status of a specific skill and commits to the database."""
    verifications = get_candidate_skill_verifications(candidate)
    verifications[skill_name.lower().strip()] = status
    set_candidate_skill_verifications(candidate, verifications)
    db.commit()
    db.refresh(candidate)

def sync_skills_fallback(candidate: Candidate, db: Session):
    """Ensures all skills have a verification status. Applies fallback verification if no quiz exists."""
    from app.db.models import SkillQuiz
    
    if not candidate.skills:
        return
        
    skills = [s.strip() for s in candidate.skills.split(",") if s.strip()]
    verifications = get_candidate_skill_verifications(candidate)
    changed = False
    
    for s in skills:
        s_lower = s.lower()
        if s_lower not in verifications:
            # Check if quiz exists
            quiz_exists = db.query(SkillQuiz).filter(SkillQuiz.skill_name == s_lower).first()
            if quiz_exists:
                verifications[s_lower] = "unverified"
            else:
                verifications[s_lower] = "verified (fallback)"
            changed = True
            
    if changed:
        set_candidate_skill_verifications(candidate, verifications)
        db.commit()
        db.refresh(candidate)
