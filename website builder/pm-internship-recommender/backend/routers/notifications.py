from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from datetime import datetime

import models, schemas
from database import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.post("/", response_model=schemas.NotificationResponse)
async def create_notification(notification: schemas.NotificationCreate, db: AsyncSession = Depends(get_db)):
    db_notification = models.Notification(**notification.model_dump())
    db.add(db_notification)
    await db.commit()
    await db.refresh(db_notification)
    return db_notification

@router.get("/", response_model=List[schemas.NotificationResponse])
async def read_notifications(user_id: int, skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Notification)
        .filter(models.Notification.user_id == user_id)
        .offset(skip).limit(limit)
    )
    return result.scalars().all()

@router.patch("/{notification_id}/read", response_model=schemas.NotificationResponse)
async def mark_notification_read(notification_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.Notification).filter(models.Notification.id == notification_id))
    notification = result.scalar_one_or_none()
    if notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.status = "read"
    notification.read_at = datetime.utcnow()
    await db.commit()
    await db.refresh(notification)
    return notification
