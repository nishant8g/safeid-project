"""QR Code generation routes."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.qrcode import QRCodeRecord
from ..services.auth_service import get_current_user
from ..services.qr_service import generate_qr_code, get_qr_image_path

router = APIRouter(prefix="/qr", tags=["QR Code"])


@router.post("/generate")
def generate_qr(
    frontend_url: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a QR code for the current user."""
    try:
        # Check if QR already exists
        existing = db.query(QRCodeRecord).filter(QRCodeRecord.user_id == current_user.id).first()

        # Generate new QR code using dynamic frontend URL
        qr_data = generate_qr_code(current_user.id, frontend_url)

        if existing:
            existing.scan_url = qr_data["scan_url"]
            existing.image_path = qr_data["image_path"]
            existing.sms_fallback_code = qr_data["sms_fallback_code"]
            existing.is_active = True
        else:
            qr_record = QRCodeRecord(
                user_id=current_user.id,
                scan_url=qr_data["scan_url"],
                image_path=qr_data["image_path"],
                sms_fallback_code=qr_data["sms_fallback_code"],
            )
            db.add(qr_record)

        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server crash: {str(e)}")

    return {
        "status": "generated",
        "scan_url": qr_data["scan_url"],
        "sms_fallback_code": qr_data["sms_fallback_code"],
        "download_url": f"/qr/image/{current_user.id}",
    }


@router.get("/image/{user_id}")
def get_qr_image(user_id: str):
    """Get the QR code image for download."""
    image_path = get_qr_image_path(user_id)
    if not image_path:
        raise HTTPException(status_code=404, detail="QR code not found")
    return FileResponse(
        image_path,
        media_type="image/png",
        filename=f"safeid_qr_{user_id[:8]}.png",
    )


@router.get("/info")
def get_qr_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get QR code info for current user."""
    qr = db.query(QRCodeRecord).filter(QRCodeRecord.user_id == current_user.id).first()
    if not qr:
        return {"has_qr": False}

    return {
        "has_qr": True,
        "scan_url": qr.scan_url,
        "sms_fallback_code": qr.sms_fallback_code,
        "is_active": qr.is_active,
        "download_url": f"/qr/image/{current_user.id}",
    }
