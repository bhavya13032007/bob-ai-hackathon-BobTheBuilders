from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.post("/", response_model=schemas.CandidateResponse)
async def create_candidate(candidate: schemas.CandidateCreate, db: AsyncSession = Depends(get_db)):
    db_candidate = models.Candidate(**candidate.model_dump())
    db.add(db_candidate)
    await db.commit()
    await db.refresh(db_candidate)
    return db_candidate

@router.get("/", response_model=List[schemas.CandidateResponse])
async def read_candidates(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Candidate).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{candidate_id}", response_model=schemas.CandidateResponse)
async def read_candidate(candidate_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Candidate).filter(models.Candidate.id == candidate_id))
    candidate = result.scalar_one_or_none()
    if candidate is None:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate
