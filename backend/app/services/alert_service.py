"""Alert service — Twilio SMS and WhatsApp notifications."""

import logging
from typing import List, Optional

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from ..config import settings

logger = logging.getLogger(__name__)


def normalize_phone(phone: str) -> str:
    """Normalize a phone number to E.164 format for Twilio."""
    clean_phone = phone.strip().replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    
    # If it's a 10-digit number without a +, assume +91 (India) as a default smart guess
    if not clean_phone.startswith("+"):
        if len(clean_phone) == 10:
            return f"+91{clean_phone}"
        # If it's longer but no +, just prepend +
        return f"+{clean_phone}"
    
    return clean_phone


def get_twilio_client() -> Optional[Client]:
    """Create a Twilio client. Returns None if credentials not set."""
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        except Exception as e:
            logger.error(f"Failed to create Twilio client: {e}")
    return None


def send_sms(to_phone: str, message: str, media_url: Optional[str] = None) -> dict:
    """Manual-Only Override: Skips Twilio and forces manual action on frontend."""
    to_phone = normalize_phone(to_phone)
    return {"status": "manual", "to": to_phone, "reason": "System set to Manual Mode"}


def send_whatsapp(to_phone: str, message: str, media_url: Optional[str] = None) -> dict:
    """Manual-Only Override: Skips Twilio and forces manual action on frontend."""
    to_phone = normalize_phone(to_phone)
    return {"status": "manual", "to": to_phone, "reason": "System set to Manual Mode"}


def make_emergency_call(to_phone: str, message: str) -> dict:
    """Make an automated emergency call via Twilio."""
    client = get_twilio_client()

    if client:
        try:
            twiml = f'<Response><Say voice="alice">{message}</Say><Pause length="2"/><Say voice="alice">{message}</Say></Response>'
            call = client.calls.create(
                twiml=twiml,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_phone,
            )
            logger.info(f"Call made to {to_phone}: SID={call.sid}")
            return {"status": "called", "sid": call.sid, "to": to_phone}
        except TwilioRestException as e:
            logger.error(f"Twilio call failed to {to_phone}: {e}")
            return {"status": "failed", "error": str(e), "to": to_phone}
    else:
        print(f"\n{'='*60}")
        print(f"📞 MOCK CALL → {to_phone}")
        print(f"📝 {message}")
        print(f"{'='*60}\n")
        return {"status": "mock", "to": to_phone}


def send_alerts_to_contacts(contacts: list, message: str, media_url: Optional[str] = None) -> List[dict]:
    """
    Send SOS alerts to all emergency contacts.
    Tries SMS first, then WhatsApp as backup.
    """
    results = []
    for contact in contacts:
        phone = contact.phone
        personalized_msg = f"🚨 EMERGENCY ALERT for {contact.name}:\n\n{message}"

        # Send SMS
        sms_result = send_sms(phone, personalized_msg, media_url=media_url)
        results.append({"contact": contact.name, "method": "sms", **sms_result})

        # Also try WhatsApp
        wa_result = send_whatsapp(phone, personalized_msg, media_url=media_url)
        results.append({"contact": contact.name, "method": "whatsapp", **wa_result})

    return results
