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
        import httpx
        
        # Read the raw file content
        image_content = await photo.read()
        
        print(f"DEBUG: Incident Photo Received: {photo.filename}")
        print(f"DEBUG: File Size: {len(image_content)} bytes")
        
        if len(image_content) == 0:
            print("🚨 ERROR: Received empty file from frontend!")
            upload_error = "(File is empty)"
        else:
            async with httpx.AsyncClient() as client:
                # 1. Put the API key directly in the URL
                upload_url = f"https://api.imgbb.com/1/upload?key={settings.IMGBB_API_KEY}"
                
                # 2. Send the RAW file, no Base64 encoding at all.
                # We pass the filename, the raw bytes, and the content type.
                files = {
                    "image": (photo.filename, image_content, photo.content_type)
                }
                
                print(f"📡 Sending Raw Image File to ImgBB...")
                response = await client.post(upload_url, files=files, timeout=60.0)
                
                if response.status_code == 200:
                    res_data = response.json()
                    media_url = res_data["data"]["url"]
                    print(f"✅ IMGBB SUCCESS: {media_url}")
                else:
                    print(f"❌ IMGBB {response.status_code} REJECTION: {response.text}")
                    upload_error = f"(Cloud Error: {response.status_code})"
                    
    except Exception as e:
        print(f"🚨 SENIOR DEBUGGER EXCEPTION: {e}")
        upload_error = "(Backend Logic Issue)"

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
    
    # SENIOR FIX: Optimize for WhatsApp Link Preview and ensure media_url is used
    sos_message = (
        f"🚨 *SAFEID EMERGENCY ALERT* 🚨\n\n"
        f"I have found your relative *{user.full_name}* at an accident scene.\n\n"
        f"📸 *INCIDENT PHOTO:* {media_url if media_url else 'Pending/Failed'}\n\n"
        f"🏥 *MEDICAL INFO:* {med.blood_group if med else 'Unknown'}\n"
        f"• Allergies: {med.allergies if med and med.allergies else 'None'}\n\n"
        f"📍 *LOCATION:* https://www.google.com/maps?q={latitude},{longitude}\n\n"
        f"🆔 *PROFILE:* {settings.BASE_URL}/scan/{user_id}\n"
    )

    print(f"\n📡 FINAL SOS TEMPLATE:\n{sos_message}\n")

    # 6. WhatsApp / SMS Broadcast Base Engine
    try:
        print("📡 TRIGGERING ACTUAL WHATSAPP/SMS BROADCAST...")
        # This calls YOUR actual Twilio/Messaging service from alert_service.py
        results = send_alerts_to_contacts(contacts, sos_message, media_url=media_url)
        print("✅ BROADCAST COMPLETE!")
    except Exception as e:
        print(f"❌ BROADCAST FAILED: {str(e)}")
        results = [{"error": str(e), "status": "failed"}]
    # 7. Log the Alert
    contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]
    alert_log = AlertLog(
        user_id=user_id,
        triggered_by="camera",
        latitude=latitude,
        longitude=longitude,
        address=address,
        severity="critical",
        message_sent=sos_message,
        contacts_notified=contact_list,
        media_url=media_url
    )
    db.add(alert_log)
    db.commit()
    db.refresh(alert_log)

    return {
        "status": "success",
        "alert_id": alert_log.id,
        "sos_message": sos_message,
        "contacts_list": contact_list,
        "delivery_results": results
    }


@router.post("/trigger", response_model=AlertResponse)
async def trigger_alert(data: AlertTrigger, db: Session = Depends(get_db)):
    """
    PUBLIC endpoint — trigger an emergency alert.
    Sends SMS/WhatsApp to all emergency contacts of the user.
    """
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
        raise HTTPException(
            status_code=400,
            detail="No emergency contacts configured for this user",
        )

    # 3. Get medical info
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == data.user_id).first()

    # 4. Reverse geocode location
    address = None
    if data.latitude and data.longitude:
        address = await reverse_geocode(data.latitude, data.longitude)

    # 5. Generate Rich SOS Message
    try:
        # FIX 2: Standard Google Maps format (https://www.google.com/maps?q=lat,lng)
        sos_message = (
            f"🚨 *SAFEID EMERGENCY SOS* 🚨\n\n"
            f"I have found your relative *{user.full_name}* at an accident scene.\n\n"
            f"🏥 *MEDICAL INFO:*\n"
            f"• Blood Group: {med.blood_group if med else 'Unknown'}\n"
            f"• Allergies: {med.allergies if med and med.allergies else 'None Recorded'}\n\n"
            f"📍 *LIVE LOCATION (GOOGLE MAPS):*\n"
            f"https://www.google.com/maps?q={data.latitude},{data.longitude}\n\n"
            f"🆔 *FULL PROFILE:* {settings.BASE_URL}/scan/{data.user_id}\n"
        )
    except Exception as e:
        print(f"Fallback generation: {e}")
        sos_message = f"🚨 EMERGENCY: I have found your relative {user.full_name}. Location: https://www.google.com/maps?q={data.latitude},{data.longitude}"

    # 6. Append voice override if rescuer spoke a message
    if data.message_override:
        sos_message += f"\n\n🎤 Rescuer Note: \"{data.message_override}\""

    # 7. MOCK BROADCAST (Strict Manual Mode)
    results = [{"contact": c.name, "method": "whatsapp", "status": "manual", "to": c.phone} for c in contacts]

    # 8. Log the Alert
    contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]
    alert_log = AlertLog(
        user_id=data.user_id,
        triggered_by=data.triggered_by,
        latitude=data.latitude,
        longitude=data.longitude,
        address=address,
        severity=data.severity,
        message_sent=sos_message,
        contacts_notified=contact_list,
    )
    db.add(alert_log)
    db.commit()
    db.refresh(alert_log)

    return {
        "status": "success",
        "alert_id": alert_log.id,
        "sos_message": sos_message,
        "contacts_list": contact_list,
        "delivery_results": results
    }


@router.get("/history")
def get_alert_history(user_id: str, db: Session = Depends(get_db)):
    """Get alert history for a user."""
    alerts = (
        db.query(AlertLog)
        .filter(AlertLog.user_id == user_id)
        .order_by(AlertLog.created_at.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "id": a.id,
            "triggered_by": a.triggered_by,
            "severity": a.severity,
            "address": a.address,
            "contacts_notified": a.contacts_notified,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a in alerts
    ]