"""Alert log database model."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, Float, Text, Integer, ForeignKey, JSON
from ..database import Base


class AlertLog(Base):
    __tablename__ = "alert_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    triggered_by = Column(String(50), default="button")  # button, voice, auto
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    severity = Column(String(20), default="unknown")  # minor, moderate, critical, unknown
    message_sent = Column(Text, nullable=True)
    contacts_notified = Column(JSON, nullable=True)
    media_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
