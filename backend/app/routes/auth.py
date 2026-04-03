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
    """Login and Auto-Register via Google OAuth Firebase JWT."""
    # 1. Verify the Google Firebase JWT Mathematically
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        decoded_token = id_token.verify_firebase_token(
            data.firebase_token, 
            requests.Request(), 
            audience="safeid-auth"
        )
            
        verified_email = decoded_token.get("email")
        verified_name = decoded_token.get("name", "SafeID User")
        
        if not verified_email:
            raise HTTPException(status_code=400, detail="Google Account does not have an attached email.")
            
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=401, detail=f"Invalid Google Security Token: {str(e)}")

    # 2. Synchronize with our internal PostgreSQL Database
    user = db.query(User).filter(User.email == verified_email).first()
    
    # 3. If User doesn't exist, Auto-Register them instantly! (1-Click Setup)
    if not user:
        user = User(
            full_name=verified_name,
            email=verified_email,
            phone=None, # They can update this in Profile settings later
            password_hash="GOOGLE_OAUTH_MANAGED",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4. Generate master native access token 
    token = create_access_token(data={"sub": user.id})

    return TokenResponse(
        access_token=token,
        user=UserProfile.model_validate(user),
    )

# Keeping a blank dummy register endpoint just in case the API schema breaks unexpectedly,
# though it is technically unused by the frontend now.
@router.post("/register", response_model=TokenResponse, status_code=201)
def dummy_register(data: UserLogin, db: Session = Depends(get_db)):
    return login(data, db)
