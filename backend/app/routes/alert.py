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



"""Alert trigger route — sends SOS to emergency contacts."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.contact import EmergencyContact
from ..models.alert import AlertLog
from ..schemas.alert import AlertTrigger, AlertResponse
from ..services.alert_service import send_alerts_to_contacts
from ..services.ai_service import generate_sos_message
from ..services.location_service import reverse_geocode, get_google_maps_link

router = APIRouter(prefix="/alert", tags=["Emergency Alerts"])


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

    # 7. Send alerts to all contacts (Now proceeds even if AI fails)
    results = send_alerts_to_contacts(contacts, sos_message)

    # 8. Log the alert in the database
    alert_log = AlertLog(
        user_id=data.user_id,
        triggered_by=data.triggered_by,
        latitude=data.latitude,
        longitude=data.longitude,
        address=address,
        severity=data.severity,
        message_sent=sos_message,
        contacts_notified=[{"name": c.name, "phone": c.phone} for c in contacts],
    )
    db.add(alert_log)
    db.commit()
    db.refresh(alert_log)

    return AlertResponse(
        status="sent",
        message="Emergency alerts have been sent to all contacts",
        alert_id=alert_log.id,
        contacts_notified=len(contacts),
        sos_message=sos_message,
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