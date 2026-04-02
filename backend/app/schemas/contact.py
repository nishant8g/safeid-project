"""Emergency contact Pydantic schemas."""

from typing import Optional
from pydantic import BaseModel, Field


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., min_length=5, max_length=20)
    relationship: Optional[str] = None
    priority: int = Field(default=1, ge=1, le=5)


class ContactResponse(BaseModel):
    id: str
    user_id: str
    name: str
    phone: str
    relationship: Optional[str] = None
    priority: int = 1

    class Config:
        from_attributes = True


class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None
    priority: Optional[int] = None
