# """Alert trigger route — sends SOS to emergency contacts."""

from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.orm import Session
import httpx
import logging

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.contact import EmergencyContact
from ..models.alert import AlertLog
from ..schemas.alert import AlertTrigger, AlertResponse

from ..services.ai_service import generate_sos_message
from ..services.location_service import reverse_geocode, get_google_maps_link, get_what3words
from ..services.alert_service import send_alerts_to_contacts
from ..services.email_service import send_email_alerts_to_contacts
from ..services.telegram_service import send_telegram_alert
from ..config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/alert", tags=["Emergency Alerts"])


@router.patch("/live-update/{alert_id}")
async def update_live_location(
    alert_id: str,
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db)
):
    """
    Heartbeat endpoint for Live Tracking (Bug #2 FIX from Audit).
    Updates location AND broadcasts new coordinates to contacts every 30s.
    """
    alert = db.query(AlertLog).filter(AlertLog.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert session not found")
    
    # Check if enough time has passed since last broadcast (throttle to 30 seconds)
    now = datetime.now(timezone.utc)
    
    # If this is the first update or 30+ seconds have passed, broadcast
    should_broadcast = (
        not hasattr(alert, 'last_location_broadcast') or 
        alert.last_location_broadcast is None or
        (now - alert.last_location_broadcast) >= timedelta(seconds=30)
    )
    
    # Always update the database
    alert.latitude = latitude
    alert.longitude = longitude
    
    if should_broadcast:
        # Fetch updated contacts and user
        user = db.query(User).filter(User.id == alert.user_id).first()
        contacts = (
            db.query(EmergencyContact)
            .filter(EmergencyContact.user_id == alert.user_id)
            .order_by(EmergencyContact.priority)
            .all()
        )
        
        if contacts and user:
            # Generate updated message with NEW location
            updated_message = (
                f"🚨 *LIVE UPDATE - SafeID* 🚨\n\n"
                f"{user.full_name}'s location has updated:\n\n"
                f"📍 *NEW LOCATION (GOOGLE MAPS):*\n"
                f"https://www.google.com/maps?q={latitude},{longitude}\n\n"
                f"⏱️ *Updated at:* {now.strftime('%H:%M:%S UTC')}\n"
                f"(Earlier profile: {settings.BASE_URL}/scan/{alert.user_id})"
            )
            
            try:
                # Send updated location to all contacts
                send_alerts_to_contacts(contacts, updated_message, media_url=alert.media_url)
                alert.last_location_broadcast = now
                logger.info(f"Live location broadcast to {len(contacts)} contacts")
            except Exception as e:
                logger.error(f"Live broadcast failed: {e}")
    
    db.commit()
    return {
        "status": "updated", 
        "lat": latitude, 
        "lng": longitude,
        "broadcast": should_broadcast
    }


@router.post("/incident", response_model=AlertResponse)
async def upload_incident_photo(
    user_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    print(f"\n🚀 [INCIDENT] PROCESSING ALERT FOR USER: {user_id}")
    """
    SENIOR EXPERT FIX: Receive live photo and location.
    Hardened Base64 upload for ImgBB + Universal Google Map Pins.
    """
    # 1. Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Upload to ImgBB Cloud
    media_url = None
    upload_error = ""
    
    try:
        # Read the raw file content
        image_content = await photo.read()
        
        if len(image_content) > 0:
            async with httpx.AsyncClient() as client:
                upload_url = f"https://api.imgbb.com/1/upload?key={settings.IMGBB_API_KEY}"
                files = {"image": (photo.filename, image_content, photo.content_type)}
                response = await client.post(upload_url, files=files, timeout=60.0)
                if response.status_code == 200:
                    media_url = response.json()["data"]["url"]
                    
    except Exception as e:
        logger.error(f"🚨 IMGBB Upload Failure: {e}")

    # 3. Get emergency contacts
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == user_id)
        .order_by(EmergencyContact.priority)
        .all()
    )
    
    # 4. Reverse geocode location
    address = await reverse_geocode(latitude, longitude)

    # 5. Generate Universal SOS Message
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == user_id).first()
    
    sos_message = (
        f"🚨 *RESQ EMERGENCY ALERT* 🚨\n\n"
        f"I have found your relative *{user.full_name}* at an accident scene.\n\n"
        f"📸 *INCIDENT PHOTO:* {media_url if media_url else 'Direct access'}\n\n"
        f"🏥 *MEDICAL INFO:* {med.blood_group if med else 'Unknown'}\n"
        f"• Allergies: {med.allergies if med and med.allergies else 'None'}\n\n"
        f"📍 *LOCATION:* https://www.google.com/maps?q={latitude},{longitude}\n\n"
        f"🆔 *PROFILE:* {settings.BASE_URL}/scan/{user_id}\n"
    )

    # 6. Primary Broadcasts (Email, Twilio, Telegram)
    results = []
    
    # Email
    try:
        email_results = send_email_alerts_to_contacts(
            contacts=contacts, victim_name=user.full_name, sos_message=sos_message,
            latitude=latitude, longitude=longitude, media_url=media_url,
            blood_group=med.blood_group if med else None, allergies=med.allergies if med else None,
        )
        results.extend(email_results)
    except Exception as e: logger.error(f"E-failed: {e}")

    # Twilio
    try:
        twilio_results = send_alerts_to_contacts(contacts, sos_message, media_url=media_url)
        results.extend(twilio_results)
    except Exception as e: logger.error(f"T-failed: {e}")

    # Telegram (Free & Automated)
    try:
        tg_result = await send_telegram_alert(sos_message, media_url=media_url)
        results.append({"contact": "Safety Bot", **tg_result})
    except Exception as e: logger.error(f"TG-failed: {e}")

    # 7. Log the Alert
    contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]
    alert_log = AlertLog(
        user_id=user_id, triggered_by="camera", latitude=latitude, longitude=longitude,
        address=address, severity="critical", message_sent=sos_message,
        contacts_notified=contact_list, media_url=media_url
    )
    db.add(alert_log)
    db.commit()
    db.refresh(alert_log)

    return {
        "status": "success", "alert_id": alert_log.id, "sos_message": sos_message,
        "contacts_list": contact_list, "delivery_results": results
    }


@router.post("/trigger", response_model=AlertResponse)
async def trigger_alert(data: AlertTrigger, db: Session = Depends(get_db)):
    print(f"\n🚀 [TRIGGER] DIRECT SOS FOR USER: {data.user_id}")
    # 1. Get user
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Get emergency contacts
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == data.user_id)
        .order_by(EmergencyContact.priority)
        .all()
    )
    if not contacts:
        raise HTTPException(status_code=400, detail="No contacts configured")

    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == data.user_id).first()
    address = await reverse_geocode(data.latitude, data.longitude) if data.latitude and data.longitude else None

    # 3. Generate Rich SOS Message
    sos_message = (
        f"🚨 *RESQ EMERGENCY SOS* 🚨\n\n"
        f"I have found your relative *{user.full_name}* at an accident scene.\n\n"
        f"🏥 *MEDICAL INFO:*\n"
        f"• Blood Group: {med.blood_group if med else 'Unknown'}\n"
        f"• Allergies: {med.allergies if med and med.allergies else 'None Recorded'}\n\n"
        f"📍 *LIVE LOCATION:* https://www.google.com/maps?q={data.latitude},{data.longitude}\n\n"
        f"🆔 *PROFILE:* {settings.BASE_URL}/scan/{data.user_id}\n"
    )

    if data.message_override:
        sos_message += f"\n\n🎤 Rescuer Note: \"{data.message_override}\""

    # 4. Broadcasts
    results = []
    
    # Email
    try:
        email_results = send_email_alerts_to_contacts(
            contacts=contacts, victim_name=user.full_name, sos_message=sos_message,
            latitude=data.latitude, longitude=data.longitude,
            blood_group=med.blood_group if med else None, allergies=med.allergies if med else None,
        )
        results.extend(email_results)
    except Exception as e: logger.error(f"E-failed: {e}")

    # Twilio
    try:
        twilio_results = send_alerts_to_contacts(contacts, sos_message)
        results.extend(twilio_results)
    except Exception as e: logger.error(f"T-failed: {e}")

    # Telegram
    try:
        tg_result = await send_telegram_alert(sos_message)
        results.append({"contact": "Safety Bot", **tg_result})
    except Exception as e: logger.error(f"TG-failed: {e}")

    # 5. Log the Alert
    contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]
    alert_log = AlertLog(
        user_id=data.user_id, triggered_by=data.triggered_by, latitude=data.latitude,
        longitude=data.longitude, address=address, severity=data.severity,
        message_sent=sos_message, contacts_notified=contact_list,
    )
    db.add(alert_log)
    db.commit()
    db.refresh(alert_log)

    return {
        "status": "success", "alert_id": alert_log.id, "sos_message": sos_message,
        "contacts_list": contact_list, "delivery_results": results
    }


@router.get("/history")
def get_alert_history(user_id: str, db: Session = Depends(get_db)):
    """Get alert history for a user."""
    alerts = db.query(AlertLog).filter(AlertLog.user_id == user_id).order_by(AlertLog.created_at.desc()).limit(20).all()
    return [{"id": a.id, "triggered_by": a.triggered_by, "severity": a.severity, "address": a.address, "contacts_notified": a.contacts_notified, "created_at": a.created_at.isoformat() if a.created_at else None} for a in alerts]