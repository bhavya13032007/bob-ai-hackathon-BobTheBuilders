import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.db.models import Notification, UserPreference
from app.notifications.service import notification_service

router = APIRouter(prefix="/notifications", tags=["notifications"])

class PreferenceUpdate(BaseModel):
    push_matches: bool = True
    sms_matches: bool = False
    wa_matches: bool = True
    push_updates: bool = True
    sms_updates: bool = True
    wa_updates: bool = True
    push_cert: bool = True
    sms_cert: bool = False
    wa_cert: bool = True
    email_digest: bool = True

class SimulateEventRequest(BaseModel):
    user_id: str = "cand_1"
    event_type: str # "new_match", "app_viewed", "cert_verified", "deadline_alert"

@router.get("")
def get_notifications(user_id: str, db: Session = Depends(get_db)):
    notifs = db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()
    unread_count = sum(1 for n in notifs if not n.is_read)

    categories = {
        "Matches": [n for n in notifs if n.category == "Matches"],
        "Applications": [n for n in notifs if n.category == "Applications"],
        "Certificates": [n for n in notifs if n.category == "Certificates"],
        "Reminders": [n for n in notifs if n.category == "Reminders"]
    }

    return {
        "notifications": notifs,
        "unread_count": unread_count,
        "total": len(notifs),
        "by_category": categories
    }

@router.put("/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True
    notif.read_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "success", "message": "Marked as read"}

@router.put("/read-all")
def mark_all_notifications_read(user_id: str = "cand_1", db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).update({
        Notification.is_read: True,
        Notification.read_at: datetime.datetime.utcnow()
    })
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.get("/preferences")
def get_preferences(user_id: str = "cand_1", db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not pref:
        pref = UserPreference(user_id=user_id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("/preferences")
def update_preferences(payload: PreferenceUpdate, user_id: str = "cand_1", db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
    if not pref:
        pref = UserPreference(user_id=user_id)
        db.add(pref)
    
    pref.push_matches = payload.push_matches
    pref.sms_matches = payload.sms_matches
    pref.wa_matches = payload.wa_matches
    pref.push_updates = payload.push_updates
    pref.sms_updates = payload.sms_updates
    pref.wa_updates = payload.wa_updates
    pref.push_cert = payload.push_cert
    pref.sms_cert = payload.sms_cert
    pref.wa_cert = payload.wa_cert
    pref.email_digest = payload.email_digest

    db.commit()
    db.refresh(pref)
    return {"status": "success", "message": "Notification preferences updated successfully", "preferences": pref}

@router.post("/simulate")
def simulate_notification(payload: SimulateEventRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    event = payload.event_type
    user_id = payload.user_id

    if event == "new_match":
        notif = notification_service.create_notification(
            db=db,
            user_id=user_id,
            title="New Matching PM Internship Added! 🎯",
            message="Adani Green has posted a 'Solar Grid Analytics' role matching your Python and Data skills.",
            category="Matches",
            related_id="int_9",
            background_tasks=background_tasks
        )
    elif event == "app_viewed":
        notif = notification_service.create_notification(
            db=db,
            user_id=user_id,
            title="Application Viewed 👀",
            message="Tata Motors recruiter reviewed your profile for EV Assembly & Quality Engineering.",
            category="Applications",
            related_id="app_1",
            background_tasks=background_tasks
        )
    elif event == "cert_verified":
        notif = notification_service.create_notification(
            db=db,
            user_id=user_id,
            title="Certificate Verified! ✅",
            message="Your AWS Educate credential has been verified by TechNova Solutions. +5% Match Boost added!",
            category="Certificates",
            related_id="cert_3",
            background_tasks=background_tasks
        )
    elif event == "deadline_alert":
        notif = notification_service.create_notification(
            db=db,
            user_id=user_id,
            title="Urgent Deadline Alert ⏰",
            message="Application deadline for Associate Product Manager Intern closes in 24 hours. Submit now!",
            category="Reminders",
            related_id="int_1",
            background_tasks=background_tasks
        )
    else:
        notif = notification_service.create_notification(
            db=db,
            user_id=user_id,
            title="System Alert",
            message="Welcome to the PM Internship Scheme recommendation engine!",
            category="Matches",
            background_tasks=background_tasks
        )

    return {
        "status": "success",
        "message": f"Simulated {event} notification dispatched across active channels!",
        "notification": notif
    }

@router.post("/trigger-deadline-check")
def trigger_deadline_check(db: Session = Depends(get_db)):
    """
    Manually triggers the bulk deadline checker cron job.
    Useful for testing Phase 4 functionality without waiting for the APScheduler trigger.
    """
    alerts_generated = notification_service.run_deadline_checker(db)
    return {
        "status": "success",
        "message": "Manual deadline check triggered.",
        "alerts_generated": len(alerts_generated),
        "details": alerts_generated
    }

@router.get("/logs")
def get_outbound_logs():
    return {
        "dispatched_logs": notification_service.sent_logs[-20:]
    }

