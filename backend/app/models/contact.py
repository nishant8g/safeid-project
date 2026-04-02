"""Emergency contact database model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from ..database import Base


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)
    relationship = Column(String(100), nullable=True)
    priority = Column(Integer, default=1)  # 1 = primary
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
