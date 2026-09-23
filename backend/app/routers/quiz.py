import json
import random
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.database import get_db
from app.db.models import SkillQuiz, QuizAttempt, Candidate
from app.db.helpers import get_skill_status, set_skill_status
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter(prefix="/quiz", tags=["quiz"])
limiter = Limiter(key_func=get_remote_address)

class QuizSubmission(BaseModel):
    candidate_id: str
    answers: Dict[str, int] # Map of question_id -> selected_option_index

@router.get("/{skill_name}")
def get_quiz_questions(skill_name: str, lang: str = "en", db: Session = Depends(get_db)):
    """Fetches up to 3 questions for a given skill."""
    skill_name_lower = skill_name.lower().strip()
    questions = db.query(SkillQuiz).filter(SkillQuiz.skill_name == skill_name_lower).all()
    
    if not questions:
        raise HTTPException(status_code=404, detail="No quiz available for this skill")
        
    selected_questions = random.sample(questions, min(3, len(questions)))
    
    response = []
    for q in selected_questions:
        try:
            options = json.loads(q.options)
        except:
            options = []
            
        q_text = q.question_text
        
        if lang != "en" and q.language_variants:
            try:
                variants = json.loads(q.language_variants)
                if lang in variants:
                    q_text = variants[lang].get("question_text", q_text)
                    options = variants[lang].get("options", options)
            except:
                pass
                
        response.append({
            "id": q.id,
            "question_text": q_text,
            "options": options
        })
        
    return response

@router.post("/{skill_name}/submit")
@limiter.limit("12/minute") # Rate limit to prevent brute force
def submit_quiz(request: Request, skill_name: str, payload: QuizSubmission, db: Session = Depends(get_db)):
    """Scores the quiz server-side and updates verification status if passed."""
    candidate = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    skill_name_lower = skill_name.lower().strip()
    
    # Calculate score
    correct_count = 0
    total_questions = len(payload.answers)
    
    if total_questions == 0:
        raise HTTPException(status_code=400, detail="No answers submitted")
        
    for q_id, selected_idx in payload.answers.items():
        question = db.query(SkillQuiz).filter(SkillQuiz.id == q_id).first()
        if question and question.correct_option_index == selected_idx:
            correct_count += 1
            
    score = (correct_count / total_questions) * 100
    passed = score >= 60.0
    
    # Check attempt number
    past_attempts = db.query(QuizAttempt).filter(
        QuizAttempt.candidate_id == candidate.id,
        QuizAttempt.skill_name == skill_name_lower
    ).count()
    attempt_num = past_attempts + 1
    
    # Record attempt
    attempt = QuizAttempt(
        id=f"qa_{candidate.id}_{skill_name_lower}_{attempt_num}",
        candidate_id=candidate.id,
        skill_name=skill_name_lower,
        score=score,
        passed=passed,
        attempt_number=attempt_num
    )
    db.add(attempt)
    
    # Update candidate status if passed
    if passed:
        set_skill_status(candidate, skill_name_lower, "verified", db)
    else:
        # Commit the attempt even if failed
        db.commit()
        
    return {
        "score": score,
        "passed": passed,
        "correct_count": correct_count,
        "total": total_questions,
        "status": "verified" if passed else "unverified"
    }
