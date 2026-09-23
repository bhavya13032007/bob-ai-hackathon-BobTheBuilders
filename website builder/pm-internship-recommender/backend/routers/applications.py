from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

import models, schemas
from database import get_db

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/", response_model=schemas.ApplicationResponse)
async def create_application(application: schemas.ApplicationCreate, db: AsyncSession = Depends(get_db)):
    db_application = models.Application(**application.model_dump())
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    return db_application

@router.get("/", response_model=List[schemas.ApplicationResponse])
async def read_applications(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Application).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
async def read_application(application_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Application).filter(models.Application.id == application_id))
    application = result.scalar_one_or_none()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return application

@router.patch("/{application_id}/status", response_model=schemas.ApplicationResponse)
async def update_application_status(
    application_id: int, 
    status_update: schemas.ApplicationUpdateStatus, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Application).filter(models.Application.id == application_id))
    application = result.scalar_one_or_none()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = status_update.status
    await db.commit()
    await db.refresh(application)
    return application
