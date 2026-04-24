from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.contact import EmergencyContact
from ..models.qrcode import QRCodeRecord

router = APIRouter(prefix="/scan", tags=["Emergency Scan"])

@router.get("/{user_id}")
def get_scan_data(user_id: str, db: Session = Depends(get_db)):
    # 1. Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 2. Check QR is active
    qr = db.query(QRCodeRecord).filter(QRCodeRecord.user_id == user_id).first()
    if not qr or not qr.is_active:
        raise HTTPException(
            status_code=403, 
            detail="PROTECTED: This ResQ has been deactivated by the owner."
        )

    # 3. Get medical info
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == user_id).first()
    
    # 3.5 Get LATEST incident photo ONLY if it happened in the last 2 hours
    from ..models.alert import AlertLog
    
    two_hours_ago = datetime.now(timezone.utc) - timedelta(hours=2)
    
    latest_alert = db.query(AlertLog).filter(
        AlertLog.user_id == user_id,
        AlertLog.created_at >= two_hours_ago
    ).order_by(AlertLog.created_at.desc()).first()
    
    latest_media = latest_alert.media_url if latest_alert else None

    # 4. Direct query for family contacts (Zero-Error Optimization)
    contacts = db.query(EmergencyContact).filter(EmergencyContact.user_id == user_id).all()

    # 5. Log the scan (synchronous — fast single INSERT, safe for serverless)
    from ..models.analytics import ScanLog
    try:
        scan_log = ScanLog(user_id=user_id)
        db.add(scan_log)
        db.commit()
    except Exception:
        db.rollback()

    # 6. Return SAFE public data
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "blood_group": med.blood_group if med else None,
        "allergies": med.allergies if med else None,
        "conditions": med.conditions if med else None,
        "medications": med.medications if med else None,
        "organ_donor": med.organ_donor if med else False,
        "special_notes": med.special_notes if med else None,
        "latest_media": latest_media,
        "sms_fallback_code": qr.sms_fallback_code if qr else None,
        "emergency_contacts": [
            {"name": c.name, "phone": c.phone} for c in contacts
        ]
    }
