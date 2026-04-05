"""User Pydantic schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: str = Field(..., max_length=255)
    phone: str = Field(..., max_length=20)
    password: str = Field(..., min_length=6)
    firebase_token: str = Field(..., description="Firebase SMS Verification JWT Token")


class UserLogin(BaseModel):
    email: str
    password: str
    firebase_token: str = Field(..., description="Firebase Email Auth JWT Token")


class UserProfile(BaseModel):
    id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    is_admin: bool = False
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
