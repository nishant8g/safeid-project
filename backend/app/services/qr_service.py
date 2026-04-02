"""QR Code generation service."""

import os
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from qrcode.image.styles.colormasks import RadialGradiantColorMask
from pathlib import Path

from ..config import settings

# QR output directory
QR_DIR = Path(__file__).resolve().parent.parent.parent / "qr" / "generated"
QR_DIR.mkdir(parents=True, exist_ok=True)


def generate_qr_code(user_id: str) -> dict:
    """
    Generate a styled QR code for a user.

    Returns dict with scan_url, image_path, and sms_fallback_code.
    """
    scan_url = f"{settings.BASE_URL}/scan/{user_id}"
    sms_fallback = f"HELP-{user_id[:8].upper()}"
    filename = f"safeid_{user_id}.png"
    filepath = QR_DIR / filename

    # Create styled QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(scan_url)
    qr.make(fit=True)

    # Generate with rounded style and gradient colors
    try:
        img = qr.make_image(
            image_factory=StyledPilImage,
            module_drawer=RoundedModuleDrawer(),
            color_mask=RadialGradiantColorMask(
                back_color=(255, 255, 255),
                center_color=(220, 50, 50),
                edge_color=(30, 30, 80),
            ),
        )
    except Exception:
        # Fallback to simple QR
        img = qr.make_image(fill_color="#DC3232", back_color="white")

    img.save(str(filepath))

    return {
        "scan_url": scan_url,
        "image_path": str(filepath),
        "image_filename": filename,
        "sms_fallback_code": sms_fallback,
    }


def get_qr_image_path(user_id: str) -> str:
    """Get the file path for a user's QR code image."""
    filename = f"safeid_{user_id}.png"
    filepath = QR_DIR / filename
    if filepath.exists():
        return str(filepath)
    return None
