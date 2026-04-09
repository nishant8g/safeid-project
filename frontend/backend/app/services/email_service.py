"""Email Alert Service — sends emergency notifications via Gmail SMTP.

Uses Python's built-in smtplib (zero dependencies).
Supports rich HTML emails with embedded incident photos.
"""

import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import List, Optional

from ..config import settings

logger = logging.getLogger(__name__)


def send_emergency_email(
    to_email: str,
    contact_name: str,
    victim_name: str,
    sos_message: str,
    latitude: float = None,
    longitude: float = None,
    media_url: Optional[str] = None,
    blood_group: Optional[str] = None,
    allergies: Optional[str] = None,
) -> dict:
    """Send a rich HTML emergency alert email via Gmail SMTP."""

    sender_email = settings.SMTP_EMAIL
    sender_password = settings.SMTP_APP_PASSWORD

    if not sender_email or not sender_password:
        logger.warning("SMTP credentials not configured — skipping email")
        return {"status": "skipped", "method": "email", "to": to_email, "reason": "SMTP not configured"}

    # Build the rich HTML email
    maps_link = f"https://www.google.com/maps?q={latitude},{longitude}" if latitude and longitude else ""

    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; color: white;">🚨 SAFEID EMERGENCY ALERT 🚨</h1>
            <p style="margin: 8px 0 0; color: #fecaca; font-size: 14px;">Immediate attention required</p>
        </div>

        <!-- Body -->  
        <div style="padding: 24px;">
            <p style="font-size: 16px; line-height: 1.6;">
                Dear <strong>{contact_name}</strong>,
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
                Someone has found your relative <strong style="color: #f87171;">{victim_name}</strong> 
                at an accident scene and triggered an emergency alert through SafeID.
            </p>

            <!-- Medical Info -->
            <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0; border-left: 4px solid #3b82f6;">
                <h3 style="margin: 0 0 8px; color: #93c5fd;">🏥 Medical Information</h3>
                <p style="margin: 4px 0; color: #cbd5e1;">Blood Group: <strong style="color: #f87171;">{blood_group or 'Unknown'}</strong></p>
                <p style="margin: 4px 0; color: #cbd5e1;">Allergies: <strong>{allergies or 'None recorded'}</strong></p>
            </div>

            {"" if not media_url else f'''
            <!-- Incident Photo -->
            <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 12px; color: #fca5a5;">📸 Incident Photo</h3>
                <img src="{media_url}" alt="Incident Scene" style="width: 100%; max-width: 500px; border-radius: 8px; border: 2px solid #334155;" />
            </div>
            '''}

            {"" if not maps_link else f'''
            <!-- Location -->
            <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin: 0 0 8px; color: #86efac;">📍 Live Location</h3>
                <a href="{maps_link}" style="color: #60a5fa; font-size: 15px; text-decoration: underline;">
                    Open in Google Maps →
                </a>
                <p style="margin: 8px 0 0; color: #94a3b8; font-size: 13px;">
                    Coordinates: {latitude}, {longitude}
                </p>
            </div>
            '''}

            <!-- Action Button -->
            {"" if not maps_link else f'''
            <div style="text-align: center; margin: 24px 0;">
                <a href="{maps_link}" style="display: inline-block; background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                    📍 VIEW LOCATION NOW
                </a>
            </div>
            '''}

            <!-- Raw SOS Message -->
            <div style="background: #1e293b; border-radius: 12px; padding: 16px; margin: 16px 0;">
                <h3 style="margin: 0 0 8px; color: #a5b4fc;">📋 Full Alert Details</h3>
                <pre style="white-space: pre-wrap; color: #cbd5e1; font-size: 13px; line-height: 1.5; margin: 0;">{sos_message}</pre>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #1e293b; padding: 16px; text-align: center; border-top: 1px solid #334155;">
            <p style="margin: 0; color: #64748b; font-size: 12px;">
                Sent by SafeID Emergency Response System · 
                <a href="{settings.BASE_URL}" style="color: #60a5fa;">safeid-project.vercel.app</a>
            </p>
        </div>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"🚨 EMERGENCY ALERT — {victim_name} needs help!"
        msg["From"] = f"SafeID Emergency <{sender_email}>"
        msg["To"] = to_email

        # Plain text fallback
        msg.attach(MIMEText(sos_message, "plain"))
        # Rich HTML version
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, msg.as_string())

        logger.info(f"Emergency email sent to {to_email}")
        return {"status": "sent", "method": "email", "to": to_email}

    except Exception as e:
        logger.error(f"Email failed to {to_email}: {e}")
        return {"status": "failed", "method": "email", "to": to_email, "error": str(e)}


def send_email_alerts_to_contacts(
    contacts: list,
    victim_name: str,
    sos_message: str,
    latitude: float = None,
    longitude: float = None,
    media_url: Optional[str] = None,
    blood_group: Optional[str] = None,
    allergies: Optional[str] = None,
) -> List[dict]:
    """Send emergency email alerts to all contacts that have an email address."""
    results = []
    for contact in contacts:
        email = getattr(contact, "email", None)
        if not email:
            results.append({"contact": contact.name, "method": "email", "status": "skipped", "reason": "no email"})
            continue

        result = send_emergency_email(
            to_email=email,
            contact_name=contact.name,
            victim_name=victim_name,
            sos_message=sos_message,
            latitude=latitude,
            longitude=longitude,
            media_url=media_url,
            blood_group=blood_group,
            allergies=allergies,
        )
        results.append({"contact": contact.name, **result})

    return results
