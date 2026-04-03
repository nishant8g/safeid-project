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

    # Create user in PostgreSQL (Firebase handles the real password)
    user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        password_hash="FIREBASE_MANAGED",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate placeholder token since they must verify email before real login
    return TokenResponse(
        access_token="UNVERIFIED_PENDING_EMAIL_ACTIVATION",
        user=UserProfile.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token via Firebase verification."""
    # 1. Verify the Google Firebase JWT
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        decoded_token = id_token.verify_firebase_token(
            data.firebase_token, 
            requests.Request(), 
            audience="safeid-auth"
        )
        
        # 2. Mathematically check status
        if not decoded_token.get("email_verified"):
            raise HTTPException(status_code=401, detail="Please verify your email inbox before logging in.")
            
        verified_email = decoded_token.get("email")
        if verified_email != data.email:
            raise HTTPException(status_code=400, detail="Token email does not match.")
            
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=401, detail=f"Invalid Firebase Security Token: {str(e)}")

    # 3. Synchronize with our internal PostgreSQL Database
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Account details not found. Please register first.")

    # 4. Generate native access token 
    token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=token,
        user=UserProfile.model_validate(user),
    )
