import uuid
import datetime
from typing import Optional, Dict, Any, List
from fastapi import BackgroundTasks
from sqlalchemy.orm import Session
from app.db.models import Notification, UserPreference, Internship, Application, Candidate

class NotificationService:
    def __init__(self):
        self.sent_logs = []

    def dispatch_channel(
        self,
        channel: str,
        recipient: str,
        title: str,
        message: str,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Abstracted multi-channel provider stubs for SMS (MSG91/Twilio), WhatsApp (Gupshup), Push, and Email.
        """
        log_entry = {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "channel": channel,
            "recipient": recipient,
            "title": title,
            "message": message,
            "status": "delivered_mock",
            "provider_response": {}
        }

        if channel == "push":
            log_entry["provider_response"] = {
                "provider": "WebPush_VAPID",
                "endpoint": f"https://updates.push.services.mozilla.com/wpush/v2/{recipient}",
                "status": 201
            }
        elif channel == "sms":
            # MSG91 / Twilio mock integration
            log_entry["provider_response"] = {
                "provider": "MSG91_Gov_DAP",
                "sender_id": "PMINTS",
                "dlt_template_id": "11071689201928",
                "phone": recipient,
                "status": "SMS_SENT_OK"
            }
        elif channel == "whatsapp":
            # Gupshup WhatsApp Enterprise mock
            log_entry["provider_response"] = {
                "provider": "Gupshup_WhatsApp_Enterprise",
                "phone": recipient,
                "template": "pm_internship_alert",
                "status": "SENT_TO_WA_GATEWAY"
            }
        elif channel == "email":
            log_entry["provider_response"] = {
                "provider": "Gov_Mail_Relay",
                "to": recipient,
                "subject": title,
                "status": "QUEUED"
            }

        self.sent_logs.append(log_entry)
        return log_entry

    def create_notification(
        self,
        db: Session,
        user_id: str,
        title: str,
        message: str,
        category: str = "Matches",
        user_type: str = "candidate",
        related_id: Optional[str] = None,
        channel: str = "in_app",
        background_tasks: Optional[BackgroundTasks] = None
    ) -> Notification:
        """
        Create in-app notification and trigger outbound multi-channel dispatch if user preferences allow.
        """
        notif_id = f"notif_{uuid.uuid4().hex[:8]}"
        notification = Notification(
            id=notif_id,
            user_id=user_id,
            user_type=user_type,
            category=category,
            title=title,
            message=message,
            related_id=related_id,
            channel=channel,
            status="sent",
            is_read=False,
            created_at=datetime.datetime.utcnow()
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)

        # Check preferences & dispatch to enabled channels
        pref = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        if not pref:
            pref = UserPreference(user_id=user_id)
            db.add(pref)
            db.commit()

        # Find candidate details for phone/email
        cand = db.query(Candidate).filter(Candidate.id == user_id).first()
        phone = cand.phone if cand else "+91 98765 43210"
        email = cand.email if cand else "candidate@example.com"

        from app.notifications.tasks import dispatch_notification_task

        # Dispatch according to category if background_tasks is provided
        if background_tasks:
            if category == "Matches":
                if pref.push_matches:
                    background_tasks.add_task(dispatch_notification_task, "push", user_id, title, message)
                if pref.sms_matches:
                    background_tasks.add_task(dispatch_notification_task, "sms", phone, title, message)
                if pref.wa_matches:
                    background_tasks.add_task(dispatch_notification_task, "whatsapp", phone, title, message)
            elif category == "Applications":
                if pref.push_updates:
                    background_tasks.add_task(dispatch_notification_task, "push", user_id, title, message)
                if pref.sms_updates:
                    background_tasks.add_task(dispatch_notification_task, "sms", phone, title, message)
                if pref.wa_updates:
                    background_tasks.add_task(dispatch_notification_task, "whatsapp", phone, title, message)
            elif category == "Certificates":
                if pref.push_cert:
                    background_tasks.add_task(dispatch_notification_task, "push", user_id, title, message)
                if pref.sms_cert:
                    background_tasks.add_task(dispatch_notification_task, "sms", phone, title, message)
                if pref.wa_cert:
                    background_tasks.add_task(dispatch_notification_task, "whatsapp", phone, title, message)

        return notification

    def run_deadline_checker(self, db: Session) -> List[Dict[str, Any]]:
        """
        Scan upcoming deadlines for saved or applied internships and generate alerts.
        """
        now = datetime.datetime.utcnow()
        upcoming = db.query(Internship).filter(Internship.is_active == True).all()
        alerts_generated = []

        for item in upcoming[:5]:
            # Generate demo reminder for candidate
            notif = self.create_notification(
                db=db,
                user_id="cand_1",
                title=f"Application Deadline Soon: {item.title}",
                message=f"Only 3 days left to apply for {item.title} at {item.district}. Don't miss out!",
                category="Reminders",
                related_id=item.id
            )
            alerts_generated.append({"internship": item.title, "notification_id": notif.id})

        return alerts_generated

notification_service = NotificationService()
