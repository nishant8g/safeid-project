# """Alert trigger route — sends SOS to emergency contacts."""

# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from typing import Optional

# from ..database import get_db
# from ..models.user import User
# from ..models.medical import MedicalInfo
# from ..models.contact import EmergencyContact
# from ..models.alert import AlertLog
# from ..schemas.alert import AlertTrigger, AlertResponse
# from ..services.alert_service import send_alerts_to_contacts
# from ..services.ai_service import generate_sos_message
# from ..services.location_service import reverse_geocode, get_google_maps_link

# router = APIRouter(prefix="/alert", tags=["Emergency Alerts"])


# @router.post("/trigger", response_model=AlertResponse)
# async def trigger_alert(data: AlertTrigger, db: Session = Depends(get_db)):
#     """
#     PUBLIC endpoint — trigger an emergency alert.
#     Sends SMS/WhatsApp to all emergency contacts of the user.
#     No authentication required (accessed by rescuers).
#     """
#     # Get user
#     user = db.query(User).filter(User.id == data.user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     # Get emergency contacts
#     contacts = (
#         db.query(EmergencyContact)
#         .filter(EmergencyContact.user_id == data.user_id)
#         .order_by(EmergencyContact.priority)
#         .all()
#     )
#     if not contacts:
#         raise HTTPException(
#             status_code=400,
#             detail="No emergency contacts configured for this user",
#         )

#     # Get medical info
#     med = db.query(MedicalInfo).filter(MedicalInfo.user_id == data.user_id).first()

#     # Reverse geocode location
#     address = None
#     if data.latitude and data.longitude:
#         address = await reverse_geocode(data.latitude, data.longitude)

#     # Generate AI SOS message
#     sos_message = generate_sos_message(
#         user_name=user.full_name,
#         blood_group=med.blood_group if med else None,
#         conditions=med.conditions if med else None,
#         allergies=med.allergies if med else None,
#         latitude=data.latitude,
#         longitude=data.longitude,
#         address=address,
#     )

#     # If there's a message override from voice input, append it
#     if data.message_override:
#         sos_message += f"\n\n🎤 Rescuer says: \"{data.message_override}\""

#     # Send alerts to all contacts
#     results = send_alerts_to_contacts(contacts, sos_message)

#     # Log the alert
#     alert_log = AlertLog(
#         user_id=data.user_id,
#         triggered_by=data.triggered_by,
#         latitude=data.latitude,
#         longitude=data.longitude,
#         address=address,
#         severity=data.severity,
#         message_sent=sos_message,
#         contacts_notified=[{"name": c.name, "phone": c.phone} for c in contacts],
#     )
#     db.add(alert_log)
#     db.commit()
#     db.refresh(alert_log)

#     return AlertResponse(
#         status="sent",
#         message="Emergency alerts have been sent to all contacts",
#         alert_id=alert_log.id,
#         contacts_notified=len(contacts),
#         sos_message=sos_message,
#     )


# @router.get("/history")
# def get_alert_history(user_id: str, db: Session = Depends(get_db)):
#     """Get alert history for a user."""
#     alerts = (
#         db.query(AlertLog)
#         .filter(AlertLog.user_id == user_id)
#         .order_by(AlertLog.created_at.desc())
#         .limit(20)
#         .all()
#     )
#     return [
#         {
#             "id": a.id,
#             "triggered_by": a.triggered_by,
#             "severity": a.severity,
#             "address": a.address,
#             "contacts_notified": a.contacts_notified,
#             "created_at": a.created_at.isoformat() if a.created_at else None,
#         }
#         for a in alerts
#     ]

# # Inside backend/app/services/alert_service.py
# from twilio.base.exceptions import TwilioRestException

# def send_emergency_alert(to_number, message_body):
#     try:
#         # Ensure your to_number starts with +91
#         if not to_number.startswith('+'):
#             to_number = f"+91{to_number}"
            
#         message = client.messages.create(
#             body=message_body,
#             from_=settings.TWILIO_PHONE_NUMBER,
#             to=to_number
#         )
#         return message.sid
#     except TwilioRestException as e:
#         # This will print the EXACT reason in your VS Code terminal
#         print(f"Twilio Error: {e.code} - {e.msg}") 
#         return None



from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import shutil
from pathlib import Path

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.contact import EmergencyContact
from ..models.alert import AlertLog
from ..schemas.alert import AlertTrigger, AlertResponse

from ..services.ai_service import generate_sos_message
from ..services.location_service import reverse_geocode, get_google_maps_link
from ..services.alert_service import send_alerts_to_contacts
from ..config import settings

router = APIRouter(prefix="/alert", tags=["Emergency Alerts"])


@router.patch("/live-update/{alert_id}")
async def update_live_location(
    alert_id: str,
    latitude: float = Form(...),
    longitude: float = Form(...),
    db: Session = Depends(get_db)
):
    """
    Heartbeat endpoint for Bug 2 (Live Tracking).
    Continuous updates of scanner location while in transit.
    """
    alert = db.query(AlertLog).filter(AlertLog.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert session not found")
    
    alert.latitude = latitude
    alert.longitude = longitude
    # Optionally update address in background
    db.commit()
    return {"status": "updated", "lat": latitude, "lng": longitude}


@router.post("/incident", response_model=AlertResponse)
async def upload_incident_photo(
    user_id: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    PUBLIC endpoint — Receive a live accident photo and location payload.
    Forces camera capture on frontend and sends to backend contacts.
    """
    # 1. Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Upload to ImgBB Cloud (Bug 2 Fix)
    media_url = None
    upload_error = ""
    
    try:
        import base64
        import httpx
        
        # Read file and encode to base64
        image_bytes = await photo.read()
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        # POST to ImgBB
        async with httpx.AsyncClient() as client:
            # Note: The key should be in settings.IMGBB_API_KEY
            # Using a fallback string for safety if not set
            api_key = settings.IMGBB_API_KEY or "d9f82637207908b98b04a11f26f7435f" # Default public key if user forgot
            
            payload = {
                "key": api_key,
                "image": base64_image,
            }
            
            response = await client.post("https://api.imgbb.com/1/upload", data=payload, timeout=20.0)
            
            if response.status_code == 200:
                res_data = response.json()
                media_url = res_data["data"]["url"]
            else:
                upload_error = f"(Cloud upload failed: {response.status_code})"
    except Exception as e:
        print(f"ImgBB Upload Exception: {e}")
        upload_error = "(Cloud connection error)"

    # 3. Get emergency contacts
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == user_id)
        .order_by(EmergencyContact.priority)
        .all()
    )
    
    # 4. Reverse geocode location
    address = await reverse_geocode(latitude, longitude)

    # 5. Generate SOS Message (Resilient Formatting)
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == user_id).first()
    
    photo_part = f"View Incident Photo: {media_url}\n" if media_url else f"⚠️ Photo capture failed {upload_error}\n"
    
    sos_message = (
        f"🚨 ACCIDENT ALERT for {user.full_name} 🚨\n"
        f"A bystander just scanned their SafeID and sent a live report.\n"
        f"{photo_part}"
        f"Location: {address if address else f'Lat: {latitude}, Lng: {longitude}'}\n"
        f"Google Maps: {get_google_maps_link(latitude, longitude)}"
    )

    # 6. BROADCAST TO CONTACTS (Bug 3 Fix)
    send_alerts_to_contacts(contacts, sos_message, media_url=media_url)

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

    return AlertResponse(
        status="photo_received",
        message="Incident photo and location have been logged and family alerted.",
        alert_id=alert_log.id,
        contacts_notified=len(contacts),
        sos_message=sos_message,
        contacts_list=contact_list,
    )


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

    # 5. Generate AI SOS message WITH FALLBACK
    try:
        sos_message = generate_sos_message(
            user_name=user.full_name,
            blood_group=med.blood_group if med else None,
            conditions=med.conditions if med else None,
            allergies=med.allergies if med else None,
            latitude=data.latitude,
            longitude=data.longitude,
            address=address,
        )
    except Exception as e:
        # If Anthropic fails (401 error), create a high-quality fallback message
        print(f"AI Service Failed: {e}. Switching to fallback template.")
        location_info = address if address else f"Lat: {data.latitude}, Long: {data.longitude}"
        sos_message = (
            f"🚨 EMERGENCY ALERT for {user.full_name} 🚨\n"
            f"Location: {location_info}\n"
            f"Blood Group: {med.blood_group if med else 'Unknown'}\n"
            f"View Profile: {get_google_maps_link(data.latitude, data.longitude)}"
        )

    # 6. Append voice override if rescuer spoke a message
    if data.message_override:
        sos_message += f"\n\n🎤 Rescuer Note: \"{data.message_override}\""

    # 7. Skips Twilio backend sending to allow Native 100% Free SOS on frontend
    contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]

    # 8. Log the alert in the database
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

    return AlertResponse(
        status="prepared",
        message="Emergency alerts prepared for native client push",
        alert_id=alert_log.id,
        contacts_notified=len(contacts),
        sos_message=sos_message,
        contacts_list=contact_list,
    )


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



from twilio.base.exceptions import TwilioRestException

def send_emergency_alert(to_number, message_body):
    try:
        # Ensure your to_number starts with +91
        if not to_number.startswith('+'):
            to_number = f"+91{to_number}"
            
        message = client.messages.create(
            body=message_body,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=to_number
        )
        return message.sid
    except TwilioRestException as e:
        # This will print the EXACT reason in your VS Code terminal
        print(f"Twilio Error: {e.code} - {e.msg}") 
        return None