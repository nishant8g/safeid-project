"""Public scan route — NO authentication required.
This is what the rescuer sees when they scan the QR code.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.qrcode import QRCodeRecord
from ..schemas.medical import PublicMedicalInfo

router = APIRouter(prefix="/scan", tags=["Emergency Scan"])


@router.get("/{user_id}")
def get_scan_data(user_id: str, db: Session = Depends(get_db)):
    """
    PUBLIC endpoint — returns minimal safe data for QR scan.
    No authentication needed. This is the critical emergency endpoint.
    """
    # Check user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check QR is active
    qr = db.query(QRCodeRecord).filter(QRCodeRecord.user_id == user_id).first()
    if qr and not qr.is_active:
        raise HTTPException(status_code=403, detail="This SafeID has been deactivated")

    # Get medical info
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == user_id).first()

    # Return SAFE public data — NO phone, NO email, NO address
    return {
        "user_id": user.id,
        "full_name": user.full_name,
        "blood_group": med.blood_group if med else None,
        "allergies": med.allergies if med else None,
        "conditions": med.conditions if med else None,
        "medications": med.medications if med else None,
        "organ_donor": med.organ_donor if med else False,
        "special_notes": med.special_notes if med else None,
        "sms_fallback_code": qr.sms_fallback_code if qr else None,
    }
