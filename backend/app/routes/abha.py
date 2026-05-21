"""ABHA Health ID validation and synchronization routes."""

import logging
import re
import uuid
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..services.auth_service import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/health/abha", tags=["ABHA Health Sync"])


class ABHAVerifyInit(BaseModel):
    abha_id: str


class ABHAVerifyConfirm(BaseModel):
    txn_id: str
    otp: str
    abha_id: str


# Helper regex for verification
ABHA_NUMBER_REGEX = re.compile(r"^\d{2}-\d{4}-\d{4}-\d{4}$")
ABHA_ADDRESS_REGEX = re.compile(r"^[a-zA-Z0-9_\-\.]+@[a-zA-Z0-9]+$")


@router.post("/verify-init")
def verify_abha_init(
    data: ABHAVerifyInit,
    current_user: User = Depends(get_current_user),
):
    """
    Initialize ABHA ID verification.
    Validates format and sends a mock verification OTP.
    """
    abha_id = data.abha_id.strip()
    
    # Validate format: 14-digit formatted (XX-XXXX-XXXX-XXXX) or ABHA Address (user@abdm)
    is_number = ABHA_NUMBER_REGEX.match(abha_id)
    is_address = ABHA_ADDRESS_REGEX.match(abha_id)
    
    if not (is_number or is_address):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ABHA format. Must be a 14-digit number (e.g. 12-3456-7890-1234) or an ABHA address (e.g. username@abdm)."
        )
        
    txn_id = f"txn_{uuid.uuid4().hex[:12]}"
    
    # Get user phone for the mock text message
    phone_mask = "******" + (current_user.phone[-4:] if current_user.phone and len(current_user.phone) >= 4 else "9496")
    
    return {
        "status": "success",
        "txn_id": txn_id,
        "message": f"Verification code sent to registered mobile: {phone_mask}",
        "helper": "For mock verification, enter the code: 123456"
    }


@router.post("/verify-confirm")
def verify_abha_confirm(
    data: ABHAVerifyConfirm,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Confirm ABHA verification with the mock OTP (123456).
    Updates user medical records with verified flag and fills in mock synced health history.
    """
    if data.otp.strip() != "123456":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification code. Please use the testing code: 123456"
        )
        
    # Get or create MedicalInfo
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == current_user.id).first()
    
    # Dynamic fields from ABHA national health sync mock database
    mock_dob = "1995-08-15"
    mock_gender = "Male" if "mr" in current_user.full_name.lower() or "kumar" in current_user.full_name.lower() else "Female"
    
    if med:
        med.abha_id = data.abha_id
        med.abha_verified = True
        # If medical properties are empty, auto-fill them from the mock ABDM sync profile
        if not med.blood_group:
            med.blood_group = "O+"
        if not med.date_of_birth:
            med.date_of_birth = mock_dob
        if not med.conditions:
            med.conditions = "None (ABDM Verified)"
        if not med.allergies:
            med.allergies = "None (ABDM Verified)"
    else:
        med = MedicalInfo(
            user_id=current_user.id,
            abha_id=data.abha_id,
            abha_verified=True,
            blood_group="O+",
            date_of_birth=mock_dob,
            conditions="None (ABDM Verified)",
            allergies="None (ABDM Verified)"
        )
        db.add(med)
        
    db.commit()
    db.refresh(med)
    
    return {
        "status": "success",
        "message": "ABHA Health Account successfully linked and verified!",
        "profile": {
            "abha_id": med.abha_id,
            "full_name": current_user.full_name,
            "gender": mock_gender,
            "dob": med.date_of_birth or mock_dob,
            "blood_group": med.blood_group,
            "verified": True
        }
    }
