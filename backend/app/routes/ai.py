"""AI routes — severity analysis and risk prediction."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..schemas.alert import AIMessageRequest, RiskPredictionRequest, RiskPredictionResponse
from ..services.ai_service import generate_sos_message, analyze_severity, generate_risk_predictions
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Features"])


@router.post("/generate-message")
def ai_generate_message(data: AIMessageRequest):
    """Generate an AI-powered SOS message (public endpoint)."""
    message = generate_sos_message(
        user_name=data.user_name,
        blood_group=data.blood_group,
        conditions=data.conditions,
        allergies=data.allergies,
        latitude=data.latitude,
        longitude=data.longitude,
        address=data.address,
    )
    return {"message": message}


@router.post("/analyze")
def ai_analyze_severity(description: str = None, image_description: str = None):
    """
    Analyze severity of an emergency.
    Accepts text description and/or image description.
    """
    result = analyze_severity(description=description, image_description=image_description)
    return result


@router.post("/risk", response_model=RiskPredictionResponse)
def ai_risk_prediction(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get AI-powered health risk predictions based on user's medical data.
    Requires authentication.
    """
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == current_user.id).first()

    result = generate_risk_predictions(
        blood_group=med.blood_group if med else None,
        allergies=med.allergies if med else None,
        conditions=med.conditions if med else None,
        medications=med.medications if med else None,
        date_of_birth=med.date_of_birth if med else None,
    )

    return RiskPredictionResponse(**result)
