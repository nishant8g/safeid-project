"""Medical information database model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text
from ..database import Base


class MedicalInfo(Base):
    __tablename__ = "medical_info"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    blood_group = Column(String(10), nullable=True)
    allergies = Column(Text, nullable=True)
    conditions = Column(Text, nullable=True)
    medications = Column(Text, nullable=True)
    organ_donor = Column(Boolean, default=False)
    special_notes = Column(Text, nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    height = Column(String(10), nullable=True)
    weight = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
