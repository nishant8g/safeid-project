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


def generate_qr_code(user_id: str, frontend_url: str = None) -> dict:
    """
    Generate a styled QR code for a user.

    Returns dict with scan_url, image_path, and sms_fallback_code.
    """
    if frontend_url:
        # Guarantee no trailing slashes
        frontend_url = frontend_url.strip().rstrip('/')
    base_url = frontend_url if frontend_url else settings.BASE_URL.strip().rstrip('/')
    
    scan_url = f"{base_url}/scan/{user_id}"
    sms_fallback = f"HELP-{user_id[:8].upper()}"
    filename = f"safeid_{user_id}.png"
    filepath = QR_DIR / filename

    # Create bulletproof standard QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(scan_url)
    qr.make(fit=True)

    # Generate standard black/white image (Never fails on linux containers)
    img = qr.make_image(fill_color="black", back_color="white")
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
    if not filepath.exists():
        # Auto-regenerate on the fly if the Render ephemeral disk was wiped
        generate_qr_code(user_id)

    if filepath.exists():
        return str(filepath)
    return None
