"""Authentication routes — register and login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserRegister, UserLogin, TokenResponse, UserProfile
from ..services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Strict Login via Google OAuth. Checks if user exists."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        decoded_token = id_token.verify_firebase_token(data.firebase_token, requests.Request(), audience="safeid-auth")
        verified_email = decoded_token.get("email")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")

    user = db.query(User).filter(User.email == verified_email).first()
    
    # Strict check: If User doesn't exist, block login!
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email. Please sign up first!")

    token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=token, user=UserProfile.model_validate(user))


# Keeping a blank dummy register endpoint just in case the API schema breaks unexpectedly,
# though it is technically unused by the frontend now.
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserLogin, db: Session = Depends(get_db)):
    """Strict Registration via Google OAuth. Creates new user."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        decoded_token = id_token.verify_firebase_token(data.firebase_token, requests.Request(), audience="safeid-auth")
        verified_email = decoded_token.get("email")
        verified_name = decoded_token.get("name", "SafeID User")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google Token: {str(e)}")

    user = db.query(User).filter(User.email == verified_email).first()
    
    # Strict check: If User already exists, block registration!
    if user:
        raise HTTPException(status_code=400, detail="Account already exists. Please log in!")

    # Auto-Register them safely via Google payload
    user = User(
        full_name=verified_name,
        email=verified_email,
        phone=None,
        password_hash="GOOGLE_OAUTH_MANAGED",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.id})
    return TokenResponse(access_token=token, user=UserProfile.model_validate(user))
