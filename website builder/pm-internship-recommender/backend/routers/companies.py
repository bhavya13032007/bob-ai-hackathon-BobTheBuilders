from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.post("/", response_model=schemas.CompanyResponse)
async def create_company(company: schemas.CompanyCreate, db: AsyncSession = Depends(get_db)):
    db_company = models.Company(**company.model_dump())
    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)
    return db_company

@router.get("/", response_model=List[schemas.CompanyResponse])
async def read_companies(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Company).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{company_id}", response_model=schemas.CompanyResponse)
async def read_company(company_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Company).filter(models.Company.id == company_id))
    company = result.scalar_one_or_none()
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company
