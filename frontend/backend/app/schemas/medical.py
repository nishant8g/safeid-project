"""Medical info Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel


class MedicalInfoCreate(BaseModel):
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    organ_donor: Optional[bool] = False
    special_notes: Optional[str] = None
    date_of_birth: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None


class MedicalInfoResponse(BaseModel):
    id: str
    user_id: str
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    organ_donor: bool = False
    special_notes: Optional[str] = None
    date_of_birth: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None

    class Config:
        from_attributes = True


class PublicMedicalInfo(BaseModel):
    """Safe data visible to rescuers - no private details."""
    full_name: str
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    organ_donor: bool = False
    special_notes: Optional[str] = None
