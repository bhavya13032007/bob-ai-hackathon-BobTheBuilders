from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime

import models, schemas
from database import get_db

router = APIRouter(prefix="/certificates", tags=["Certificates"])

@router.post("/", response_model=schemas.CertificateResponse)
async def create_certificate(certificate: schemas.CertificateCreate, db: AsyncSession = Depends(get_db)):
    db_certificate = models.Certificate(**certificate.model_dump())
    db.add(db_certificate)
    await db.commit()
    await db.refresh(db_certificate)
    return db_certificate

@router.get("/", response_model=List[schemas.CertificateResponse])
async def read_certificates(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Certificate).offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/{certificate_id}", response_model=schemas.CertificateResponse)
async def read_certificate(certificate_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Certificate).filter(models.Certificate.id == certificate_id))
    certificate = result.scalar_one_or_none()
    if certificate is None:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate

@router.patch("/{certificate_id}/status", response_model=schemas.CertificateResponse)
async def update_certificate_status(
    certificate_id: int, 
    status_update: schemas.CertificateUpdateStatus, 
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.Certificate).filter(models.Certificate.id == certificate_id))
    certificate = result.scalar_one_or_none()
    if certificate is None:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    certificate.verification_status = status_update.verification_status
    certificate.verified_at = datetime.utcnow()
    # In a real app, verified_by would be populated from the current authenticated user's company ID
    
    await db.commit()
    await db.refresh(certificate)
    return certificate
