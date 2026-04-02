"""Alert Pydantic schemas."""

from typing import Optional, List
from pydantic import BaseModel


class AlertTrigger(BaseModel):
    user_id: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    triggered_by: str = "button"  # button, voice, auto
    severity: str = "unknown"
    message_override: Optional[str] = None


class AlertResponse(BaseModel):
    status: str
    message: str
    alert_id: str
    contacts_notified: int
    sos_message: str


class AIMessageRequest(BaseModel):
    user_name: str
    blood_group: Optional[str] = None
    conditions: Optional[str] = None
    allergies: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None


class RiskPredictionRequest(BaseModel):
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    conditions: Optional[str] = None
    medications: Optional[str] = None
    date_of_birth: Optional[str] = None


class RiskPredictionResponse(BaseModel):
    risk_level: str  # low, medium, high
    warnings: List[str]
    recommendations: List[str]
