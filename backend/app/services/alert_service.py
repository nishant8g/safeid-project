"""Alert service — Twilio SMS and WhatsApp notifications."""

import logging
from typing import List, Optional

from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException

from ..config import settings

logger = logging.getLogger(__name__)


def get_twilio_client() -> Optional[Client]:
    """Create a Twilio client. Returns None if credentials not set."""
    if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        try:
            return Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        except Exception as e:
            logger.error(f"Failed to create Twilio client: {e}")
    return None


def send_sms(to_phone: str, message: str) -> dict:
    """
    Send an SMS via Twilio.
    Falls back to console logging if Twilio is not configured.
    """
    client = get_twilio_client()

    if client:
        try:
            msg = client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_phone,
            )
            logger.info(f"SMS sent to {to_phone}: SID={msg.sid}")
            return {"status": "sent", "sid": msg.sid, "to": to_phone}
        except TwilioRestException as e:
            logger.error(f"Twilio SMS failed to {to_phone}: {e}")
            return {"status": "failed", "error": str(e), "to": to_phone}
    else:
        # Mock mode — log to console
        logger.warning(f"[MOCK SMS] To: {to_phone}")
        logger.warning(f"[MOCK SMS] Message: {message}")
        print(f"\n{'='*60}")
        print(f"📱 MOCK SMS → {to_phone}")
        print(f"📝 {message}")
        print(f"{'='*60}\n")
        return {"status": "mock", "to": to_phone}


def send_whatsapp(to_phone: str, message: str) -> dict:
    """Send a WhatsApp message via Twilio."""
    client = get_twilio_client()

    if client and settings.TWILIO_WHATSAPP_FROM:
        try:
            # Ensure the to number has whatsapp: prefix
            wa_to = to_phone if to_phone.startswith("whatsapp:") else f"whatsapp:{to_phone}"
            msg = client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=wa_to,
            )
            logger.info(f"WhatsApp sent to {to_phone}: SID={msg.sid}")
            return {"status": "sent", "sid": msg.sid, "to": to_phone}
        except TwilioRestException as e:
            logger.error(f"Twilio WhatsApp failed to {to_phone}: {e}")
            return {"status": "failed", "error": str(e), "to": to_phone}
    else:
        print(f"\n{'='*60}")
        print(f"💬 MOCK WHATSAPP → {to_phone}")
        print(f"📝 {message}")
        print(f"{'='*60}\n")
        return {"status": "mock", "to": to_phone}


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


def send_alerts_to_contacts(contacts: list, message: str) -> List[dict]:
    """
    Send SOS alerts to all emergency contacts.
    Tries SMS first, then WhatsApp as backup.
    """
    results = []
    for contact in contacts:
        phone = contact.phone
        personalized_msg = f"🚨 EMERGENCY ALERT for {contact.name}:\n\n{message}"

        # Send SMS
        sms_result = send_sms(phone, personalized_msg)
        results.append({"contact": contact.name, "method": "sms", **sms_result})

        # Also try WhatsApp
        wa_result = send_whatsapp(phone, personalized_msg)
        results.append({"contact": contact.name, "method": "whatsapp", **wa_result})

    return results
