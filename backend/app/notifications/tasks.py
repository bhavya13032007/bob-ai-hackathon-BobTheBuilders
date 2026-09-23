import logging
from app.notifications.service import notification_service

logger = logging.getLogger(__name__)

def dispatch_notification_task(channel: str, recipient: str, title: str, message: str):
    """
    Async task to dispatch notification via external providers.
    """
    try:
        result = notification_service.dispatch_channel(channel, recipient, title, message)
        logger.info(f"Dispatched notification to {channel} for {recipient}: {result}")
        return result
    except Exception as e:
        logger.error(f"Failed to dispatch notification to {channel} for {recipient}: {e}")
        raise
