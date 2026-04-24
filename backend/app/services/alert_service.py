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
    """Send SMS notification via Twilio."""
    to_phone = normalize_phone(to_phone)
    client = get_twilio_client()
    
    if client:
        try:
            msg_params = {
                "body": message,
                "from_": settings.TWILIO_PHONE_NUMBER if settings.TWILIO_PHONE_NUMBER else "+14155238886",
                "to": to_phone
            }
            if media_url:
                msg_params["media_url"] = [media_url]
            
            message_obj = client.messages.create(**msg_params)
            logger.info(f"SMS sent to {to_phone}: SID={message_obj.sid}")
            return {"status": "sent", "method": "sms", "sid": message_obj.sid, "to": to_phone}
        except TwilioRestException as e:
            logger.error(f"Twilio SMS failed to {to_phone}: {e}")
            return {"status": "failed", "method": "sms", "error": str(e), "to": to_phone}
    else:
        print(f"📱 MOCK SMS → {to_phone}: {message}")
        return {"status": "mock", "method": "sms", "to": to_phone}


def send_whatsapp(to_phone: str, message: str, media_url: Optional[str] = None) -> dict:
    """Send WhatsApp message with optional media attachment via Twilio (Fix #3)."""
    to_phone = normalize_phone(to_phone)
    client = get_twilio_client()
    
    if client:
        try:
            # For WhatsApp, use the Twilio WhatsApp number format
            msg_params = {
                "body": message,
                "from_": settings.TWILIO_WHATSAPP_FROM if settings.TWILIO_WHATSAPP_FROM else "whatsapp:+14155238886",
                "to": f"whatsapp:{to_phone}"
            }
            
            # Twilio WhatsApp Sandbox often rejects third-party media URLs (returns "image not supported").
            # Since the URL is already in the message body, WhatsApp will render a Rich Preview automatically.
            # We strictly send just the text body to ensure 100% delivery success.
            
            message_obj = client.messages.create(**msg_params)
            logger.info(f"WhatsApp sent to {to_phone}: SID={message_obj.sid}")
            return {
                "status": "sent",
                "method": "whatsapp",
                "sid": message_obj.sid,
                "to": to_phone,
                "has_media": bool(media_url)
            }
        except TwilioRestException as e:
            logger.error(f"Twilio WhatsApp failed to {to_phone}: {e}")
            return {
                "status": "failed",
                "method": "whatsapp",
                "error": str(e),
                "to": to_phone
            }
    else:
        print(f"\n{'='*60}")
        print(f"📱 MOCK WHATSAPP → {to_phone}")
        print(f"📝 {message}")
        if media_url:
            print(f"📸 MEDIA: {media_url}")
        print(f"{'='*60}\n")
        return {
            "status": "mock",
            "method": "whatsapp",
            "to": to_phone,
            "has_media": bool(media_url)
        }


def get_whatsapp_direct_link(phone: str, message: str) -> str:
    """Generate a https://wa.me/ link for manual fallback during demo."""
    import urllib.parse
    clean_phone = normalize_phone(phone).replace("+", "")
    encoded_msg = urllib.parse.quote(message)
    return f"https://wa.me/{clean_phone}?text={encoded_msg}"


def send_alerts_to_contacts(contacts: list, message: str, media_url: Optional[str] = None) -> List[dict]:
    """
    Send SOS alerts to all emergency contacts via Twilio.
    Attempts delivery through both SMS and WhatsApp channels.
    Includes a direct 'wa.me' link for demo fallback.
    """
    results = []
    for contact in contacts:
        phone = contact.phone
        
        # 1. Try SMS
        sms_result = send_sms(phone, message, media_url=media_url)
        results.append({"contact": contact.name, "method": "sms", **sms_result})

        # 2. Try Automated WhatsApp
        wa_result = send_whatsapp(phone, message, media_url=media_url)
        
        # 3. Always include a Direct Link (wa.me) for presentation fallback
        direct_link = get_whatsapp_direct_link(phone, message)
        
        results.append({
            "contact": contact.name, 
            "method": "whatsapp", 
            "direct_link": direct_link,
            **wa_result
        })

    return results
