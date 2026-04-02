"""User profile and medical info routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.contact import EmergencyContact
from ..schemas.user import UserProfile, UserUpdate
from ..schemas.medical import MedicalInfoCreate, MedicalInfoResponse
from ..schemas.contact import ContactCreate, ContactResponse, ContactUpdate
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile"])


# ──── Profile ────

@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserProfile.model_validate(current_user)


@router.put("/profile", response_model=UserProfile)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    if data.full_name:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    return UserProfile.model_validate(current_user)


# ──── Medical Info ────

@router.get("/medical", response_model=MedicalInfoResponse)
def get_medical(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's medical info."""
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="No medical info found. Please add your medical details.")
    return MedicalInfoResponse.model_validate(med)


@router.post("/medical", response_model=MedicalInfoResponse)
def upsert_medical(
    data: MedicalInfoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update medical info."""
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == current_user.id).first()

    if med:
        # Update existing
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(med, key, value)
    else:
        # Create new
        med = MedicalInfo(user_id=current_user.id, **data.model_dump())
        db.add(med)

    db.commit()
    db.refresh(med)
    return MedicalInfoResponse.model_validate(med)


# ──── Emergency Contacts ────

@router.get("/contacts", response_model=List[ContactResponse])
def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all emergency contacts."""
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == current_user.id)
        .order_by(EmergencyContact.priority)
        .all()
    )
    return [ContactResponse.model_validate(c) for c in contacts]


@router.post("/contacts", response_model=ContactResponse, status_code=201)
def add_contact(
    data: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new emergency contact."""
    # Limit to 5 contacts
    count = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).count()
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 emergency contacts allowed")

    contact = EmergencyContact(user_id=current_user.id, **data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.put("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: str,
    data: ContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an emergency contact."""
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(contact, key, value)

    db.commit()
    db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.delete("/contacts/{contact_id}")
def delete_contact(
    contact_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an emergency contact."""
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    db.delete(contact)
    db.commit()
    return {"status": "deleted", "id": contact_id}
