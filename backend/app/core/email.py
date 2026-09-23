import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import logging

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Helper function to send emails using SendGrid."""
    sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
    from_email = os.getenv("SENDGRID_FROM_EMAIL")

    if not sendgrid_api_key or not from_email:
        logger.error("SendGrid configuration is missing. Cannot send email.")
        return False

    message = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content)

    try:
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)
        if response.status_code in [200, 202]:
            logger.info(f"Email successfully sent to {to_email}")
            return True
        else:
            logger.error(f"Failed to send email. Status code: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Error sending email via SendGrid: {e}")
        return False


def send_otp_email(to_email: str, otp: str) -> bool:
    """Sends the sign-up verification OTP."""
    subject = "Verify your Loopin account"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Loopin!</h2>
        <p>Please use the following One Time Password (OTP) to verify your email address:</p>
        <h1 style="color: #4CAF50; letter-spacing: 5px;">{otp}</h1>
        <p>If you did not request this, please ignore this email.</p>
    </div>
    """
    return send_email(to_email, subject, html_content)


def send_login_notification(to_email: str) -> bool:
    """Sends a plain text 'new login detected' email."""
    subject = "New Login to your Loopin Account"
    html_content = """
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Security Alert</h2>
        <p>A new login was just detected on your Loopin account.</p>
        <p>If this was you, no further action is required.</p>
        <p>If you did not authorize this login, please contact support and change your password immediately.</p>
    </div>
    """
    return send_email(to_email, subject, html_content)
