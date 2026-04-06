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



# from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
# from sqlalchemy.orm import Session
# from typing import Optional
# import uuid
# import shutil
# from pathlib import Path

# from ..database import get_db
# from ..models.user import User
# from ..models.medical import MedicalInfo
# from ..models.contact import EmergencyContact
# from ..models.alert import AlertLog
# from ..schemas.alert import AlertTrigger, AlertResponse

# from ..services.ai_service import generate_sos_message
# from ..services.location_service import reverse_geocode, get_google_maps_link, get_what3words
# from ..services.alert_service import send_alerts_to_contacts
# from ..config import settings

# router = APIRouter(prefix="/alert", tags=["Emergency Alerts"])


# @router.patch("/live-update/{alert_id}")
# async def update_live_location(
#     alert_id: str,
#     latitude: float = Form(...),
#     longitude: float = Form(...),
#     db: Session = Depends(get_db)
# ):
#     """
#     Heartbeat endpoint for Bug 2 (Live Tracking).
#     Continuous updates of scanner location while in transit.
#     """
#     alert = db.query(AlertLog).filter(AlertLog.id == alert_id).first()
#     if not alert:
#         raise HTTPException(status_code=404, detail="Alert session not found")
    
#     alert.latitude = latitude
#     alert.longitude = longitude
#     # Optionally update address in background
#     db.commit()
#     return {"status": "updated", "lat": latitude, "lng": longitude}


# @router.post("/incident", response_model=AlertResponse)
# async def upload_incident_photo(
#     user_id: str = Form(...),
#     latitude: float = Form(...),
#     longitude: float = Form(...),
#     photo: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     """
#     SENIOR EXPERT FIX: Receive live photo and location.
#     Hardened Base64 upload for ImgBB + Universal Google Map Pins.
#     """
#     # 1. Get user
#     user = db.query(User).filter(User.id == user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     # 2. Upload to ImgBB Cloud (Senior Expert Base64 Logic)
#     media_url = None
#     upload_error = ""
    
#     try:
#         import httpx
#         import base64
        
#         # Read the file content
#         image_content = await photo.read()
        
#         # DEBUG: Verify file is not empty
#         print(f"DEBUG: Incident Photo Received: {photo.filename}")
#         print(f"DEBUG: File Size: {len(image_content)} bytes")
        
#         if len(image_content) == 0:
#             print("🚨 ERROR: Received empty file from frontend!")
#             upload_error = "(File is empty)"
#         else:
#             # Senior Expert Tip: Encode to B64 AND Decode to UTF-8 String
#             # ImgBB rejects raw byte objects; it needs a JSON-safe string.
#             b64_string = base64.b64encode(image_content).decode('utf-8')
            
#             async with httpx.AsyncClient() as client:
#                 api_key = settings.IMGBB_API_KEY
                
#                 # Multipart payload with Base64 image field (Highest Stability Standard)
#                 files = { "image": (None, b64_string) }
#                 data = { "key": api_key }
                
#                 print(f"📡 Force-Sending Multipart Payload to ImgBB...")
#                 response = await client.post("https://api.imgbb.com/1/upload", data=data, files=files, timeout=60.0)
                
#                 if response.status_code == 200:
#                     res_data = response.json()
#                     media_url = res_data["data"]["url"]
#                     print(f"✅ IMGBB SUCCESS (Multipart-Hybrid): {media_url}")
#                 else:
#                     print(f"❌ IMGBB 400 REJECTION: {response.text}")
#                     upload_error = f"(Cloud Error: {response.status_code})"
                    
#     except Exception as e:
#         print(f"🚨 SENIOR DEBUGGER EXCEPTION: {e}")
#         upload_error = "(Backend Logic Issue)"

#     # 3. Get emergency contacts
#     contacts = (
#         db.query(EmergencyContact)
#         .filter(EmergencyContact.user_id == user_id)
#         .order_by(EmergencyContact.priority)
#         .all()
#     )
    
#     # 4. Reverse geocode location
#     address = await reverse_geocode(latitude, longitude)

#     # 5. Generate Universal SOS Message (Fixed Map Formatting)
#     med = db.query(MedicalInfo).filter(MedicalInfo.user_id == user_id).first()
    
#     sos_message = (
#         f"🚨 *VISUAL VERIFICATION ALERT* 🚨\n\n"
#         f"I have found your relative *{user.full_name}* at an accident scene.\n\n"
#         f"📸 *VIEW INCIDENT PHOTO:*\n"
#         f"{media_url if media_url else '⚠️ Photo capture failed (' + upload_error + ')'}\n\n"
#         f"🏥 *MEDICAL INFO:*\n"
#         f"• Blood: {med.blood_group if med else 'Unknown'}\n"
#         f"• Allergies: {med.allergies if med and med.allergies else 'None Recorded'}\n\n"
#         f"📍 *ACCIDENT LOCATION:*\n"
#         f"{address if address else 'Coordinates: ' + str(latitude) + ',' + str(longitude)}\n"
#         f"🔗 Google Maps Pin: https://www.google.com/maps?q={latitude},{longitude}\n\n"
#         f"🆔 *FULL PROFILE:* {settings.BASE_URL}/scan/{user_id}\n"
#     )

#     print(f"\n📡 FINAL SOS TEMPLATE:\n{sos_message}\n")

#     # 6. MOCK BROADCAST (Strict Manual Mode)
#     results = [{"contact": c.name, "method": "whatsapp", "status": "manual", "to": c.phone} for c in contacts]

#     # 7. Log the Alert
#     contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]
#     alert_log = AlertLog(
#         user_id=user_id,
#         triggered_by="camera",
#         latitude=latitude,
#         longitude=longitude,
#         address=address,
#         severity="critical",
#         message_sent=sos_message,
#         contacts_notified=contact_list,
#         media_url=media_url
#     )
#     db.add(alert_log)
#     db.commit()
#     db.refresh(alert_log)

#     return {
#         "status": "success",
#         "alert_id": alert_log.id,
#         "sos_message": sos_message,
#         "contacts_list": contact_list,
#         "delivery_results": results
#     }


# @router.post("/trigger", response_model=AlertResponse)
# async def trigger_alert(data: AlertTrigger, db: Session = Depends(get_db)):
#     """
#     PUBLIC endpoint — trigger an emergency alert.
#     Sends SMS/WhatsApp to all emergency contacts of the user.
#     """
#     # 1. Get user
#     user = db.query(User).filter(User.id == data.user_id).first()
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     # 2. Get emergency contacts
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

#     # 3. Get medical info
#     med = db.query(MedicalInfo).filter(MedicalInfo.user_id == data.user_id).first()

#     # 4. Reverse geocode location
#     address = None
#     if data.latitude and data.longitude:
#         address = await reverse_geocode(data.latitude, data.longitude)

#     # 5. Generate Rich SOS Message (Senior Developer Optimized)
#     try:
#         sos_message = (
#             f"🚨 *SAFEID EMERGENCY SOS* 🚨\n\n"
#             f"I have found your relative *{user.full_name}* at an accident scene.\n\n"
#             f"🏥 *MEDICAL INFO:*\n"
#             f"• Blood Group: {med.blood_group if med else 'Unknown'}\n"
#             f"• Allergies: {med.allergies if med and med.allergies else 'None Recorded'}\n\n"
#             f"📍 *LIVE LOCATION (GOOGLE MAPS):*\n"
#             f"https://www.google.com/maps?q={data.latitude},{data.longitude}\n\n"
#             f"🆔 *FULL PROFILE:* {settings.BASE_URL}/scan/{data.user_id}\n"
#         )
#     except Exception as e:
#         print(f"Fallback generation: {e}")
#         sos_message = f"🚨 EMERGENCY: I have found your relative {user.full_name}. Location: https://www.google.com/maps?q={data.latitude},{data.longitude}"

#     # 6. Append voice override if rescuer spoke a message
#     if data.message_override:
#         sos_message += f"\n\n🎤 Rescuer Note: \"{data.message_override}\""

#     # 7. MOCK BROADCAST (Strict Manual Mode)
#     results = [{"contact": c.name, "method": "whatsapp", "status": "manual", "to": c.phone} for c in contacts]

#     # 8. Log the Alert
#     contact_list = [{"name": c.name, "phone": c.phone} for c in contacts]
#     alert_log = AlertLog(
#         user_id=data.user_id,
#         triggered_by=data.triggered_by,
#         latitude=data.latitude,
#         longitude=data.longitude,
#         address=address,
#         severity=data.severity,
#         message_sent=sos_message,
#         contacts_notified=contact_list,
#     )
#     db.add(alert_log)
#     db.commit()
#     db.refresh(alert_log)

#     return {
#         "status": "success",
#         "alert_id": alert_log.id,
#         "sos_message": sos_message,
#         "contacts_list": contact_list,
#         "delivery_results": results
#     }


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
from ..services.location_service import reverse_geocode, get_google_maps_link, get_what3words
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
    
    # SENIOR FIX: Optimize for WhatsApp Link Preview
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

    # 6. MOCK BROADCAST (Strict Manual Mode)
   # 6. ACTUAL WHATSAPP/SMS BROADCAST
    try:
        print("📡 TRIGGERING ACTUAL WHATSAPP/SMS BROADCAST...")
        # This calls YOUR actual Twilio/Messaging service from alert_service.py
        results = send_alerts_to_contacts(contacts, sos_message)
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