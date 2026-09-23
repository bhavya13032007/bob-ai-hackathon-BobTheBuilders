from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/internships", tags=["Internships"])

@router.post("/", response_model=schemas.InternshipResponse)
async def create_internship(internship: schemas.InternshipCreate, db: AsyncSession = Depends(get_db)):
    db_internship = models.Internship(**internship.model_dump())
    db.add(db_internship)
    await db.commit()
    await db.refresh(db_internship)
    return db_internship

@router.get("/", response_model=List[schemas.InternshipResponse])
async def read_internships(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Internship).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{internship_id}", response_model=schemas.InternshipResponse)
async def read_internship(internship_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Internship).filter(models.Internship.id == internship_id))
    internship = result.scalar_one_or_none()
    if internship is None:
        raise HTTPException(status_code=404, detail="Internship not found")
    return internship
