import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserRegister, UserLogin, TokenResponse, UserProfile
from ..services.auth_service import hash_password, verify_password, create_access_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Strict Login via Google OAuth. Checks if user exists."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        from ..config import settings
        
        # Verify the direct Google ID Token
        decoded_token = id_token.verify_oauth2_token(
            data.google_token, 
            requests.Request(), 
            audience=settings.GOOGLE_CLIENT_ID
        )
        verified_email = decoded_token.get("email")

        if not verified_email:
             raise HTTPException(status_code=400, detail="Google account has no verified email.")

        user = db.query(User).filter(User.email == verified_email).first()
        
        # Strict check: If User doesn't exist, block login!
        if not user:
            raise HTTPException(status_code=404, detail="No account found with this email. Please sign up first!")

        token = create_access_token(data={"sub": user.id})
        return TokenResponse(access_token=token, user=UserProfile.model_validate(user))

    except HTTPException as he:
        # Re-raise known API errors (401, 404, etc)
        raise he
    except Exception as e:
        # ⚡ CRITICAL DEBUG: Catch the 500 and show the reason
        logger.error(f"🚨 LOGIN CRASH: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"SERVER CRASH: {str(e)}. Check backend console for full traceback."
        )


# Keeping a blank dummy register endpoint just in case the API schema breaks unexpectedly,
# though it is technically unused by the frontend now.
@router.post("/register", response_model=TokenResponse, status_code=201)
def register(data: UserLogin, db: Session = Depends(get_db)):
    """Strict Registration via Google OAuth. Creates new user."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        from ..config import settings
        
        # Verify the direct Google ID Token
        decoded_token = id_token.verify_oauth2_token(
            data.google_token, 
            requests.Request(), 
            audience=settings.GOOGLE_CLIENT_ID
        )
        verified_email = decoded_token.get("email")
        verified_name = decoded_token.get("name", "ResQ User")

        if not verified_email:
             raise HTTPException(status_code=400, detail="Google account has no verified email.")

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

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"🚨 REGISTRATION CRASH: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"REGISTRATION SERVER CRASH: {str(e)}"
        )
