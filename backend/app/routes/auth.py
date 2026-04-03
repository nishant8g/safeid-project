"""Authentication routes — register and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserRegister, UserLogin, TokenResponse, UserProfile
from ..services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Verify Firebase Phone Auth Token
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        # Verify the mathematically signed Firebase ID Token
        decoded_token = id_token.verify_firebase_token(
            data.firebase_token, 
            requests.Request(), 
            audience="safeid-auth"
        )
        
        # Ensure the phone number matches the token exactly
        verified_phone = decoded_token.get("phone_number")
        if not verified_phone or verified_phone != data.phone:
            raise HTTPException(status_code=400, detail="Phone number does not match SMS verification.")
            
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid SMS Verification Token: {str(e)}")

    # Create user
    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=token,
        user=UserProfile.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=token,
        user=UserProfile.model_validate(user),
    )
