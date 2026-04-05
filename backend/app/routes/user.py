"""User profile and medical info routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.user import User
from ..models.medical import MedicalInfo
from ..models.contact import EmergencyContact
from ..schemas.user import UserProfile, UserUpdate
from ..schemas.medical import MedicalInfoCreate, MedicalInfoResponse
from ..schemas.contact import ContactCreate, ContactResponse, ContactUpdate
from ..services.auth_service import get_current_user

router = APIRouter(prefix="/user", tags=["User Profile"])


# ──── Profile ────

@router.get("/profile", response_model=UserProfile)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return UserProfile.model_validate(current_user)


@router.put("/profile", response_model=UserProfile)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    if data.full_name:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    db.commit()
    db.refresh(current_user)
    return UserProfile.model_validate(current_user)


# ──── Medical Info ────

@router.get("/medical", response_model=MedicalInfoResponse)
def get_medical(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's medical info."""
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == current_user.id).first()
    if not med:
        raise HTTPException(status_code=404, detail="No medical info found. Please add your medical details.")
    return MedicalInfoResponse.model_validate(med)


@router.post("/medical", response_model=MedicalInfoResponse)
def upsert_medical(
    data: MedicalInfoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create or update medical info."""
    med = db.query(MedicalInfo).filter(MedicalInfo.user_id == current_user.id).first()

    if med:
        # Update existing
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(med, key, value)
    else:
        # Create new
        med = MedicalInfo(user_id=current_user.id, **data.model_dump())
        db.add(med)

    db.commit()
    db.refresh(med)
    return MedicalInfoResponse.model_validate(med)


# ──── Emergency Contacts ────

@router.get("/contacts", response_model=List[ContactResponse])
def get_contacts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all emergency contacts."""
    contacts = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.user_id == current_user.id)
        .order_by(EmergencyContact.priority)
        .all()
    )
    return [ContactResponse.model_validate(c) for c in contacts]


@router.post("/contacts", response_model=ContactResponse, status_code=201)
def add_contact(
    data: ContactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new emergency contact."""
    # Limit to 5 contacts
    count = db.query(EmergencyContact).filter(EmergencyContact.user_id == current_user.id).count()
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum 5 emergency contacts allowed")

    contact = EmergencyContact(user_id=current_user.id, **data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.put("/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(
    contact_id: str,
    data: ContactUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update an emergency contact."""
    contact = (
        db.query(EmergencyContact)
        .filter(EmergencyContact.id == contact_id, EmergencyContact.user_id == current_user.id)
        .first()
    )
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    for key, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(contact, key, value)

    db.commit()
    db.refresh(contact)
    return ContactResponse.model_validate(contact)


@router.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Delete an emergency contact."""
    contact = db.query(EmergencyContact).filter(
        EmergencyContact.id == contact_id,
        EmergencyContact.user_id == current_user.id
    ).first()
    
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
        
    db.delete(contact)
    db.commit()
    return {"message": "Contact deleted successfully"}

# ──── Dashboard Metrics Route (Dual-Endpoint Support to prevent 404s) ────

@router.get("/metrics")
@router.get("/analytics")
def get_user_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns premium SaaS analytics data including historical QR scan locations,
    total scans over time, and profile health metric.
    """
    from ..models.analytics import ScanLog
    from ..models.alert import AlertLog
    
    # 1. Total Scans & Recent 7 Days
    from datetime import datetime, timedelta, timezone
    
    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    
    # Get all scans
    all_scans = db.query(ScanLog).filter(ScanLog.user_id == current_user.id).all()
    total_scans = len(all_scans)
    
    # Group by day for the chart
    scan_history = []
    # Initialize past 7 days
    counts_by_day = {}
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).strftime('%m/%d')
        counts_by_day[day] = 0
        
    for scan in all_scans:
        if scan.created_at:
            # Make explicitly naive for safe comparison
            created_dt = scan.created_at.replace(tzinfo=None)
            if created_dt >= seven_days_ago:
                day_str = created_dt.strftime('%m/%d')
                if day_str in counts_by_day:
                    counts_by_day[day_str] += 1
                
    for day, count in counts_by_day.items():
        scan_history.append({"date": day, "scans": count})

    # 2. Get Historical Locations (from Alerts)
    alerts = db.query(AlertLog).filter(
        AlertLog.user_id == current_user.id,
        AlertLog.latitude.isnot(None),
        AlertLog.longitude.isnot(None)
    ).order_by(AlertLog.created_at.desc()).limit(10).all()
    
    locations = [
        {
            "lat": a.latitude,
            "lng": a.longitude,
            "severity": a.severity,
            "date": a.created_at.isoformat() if a.created_at else None,
            "address": a.address
        }
        for a in alerts
    ]
    
    # 3. Global Platform Stats (for the SaaS creator)
    # Only return if user is an admin
    metrics_res = {
        "total_scans": total_scans,
        "scan_history": scan_history,
        "alert_locations": locations,
        "metrics_calculated_at": now.isoformat()
    }
    
    if current_user.is_admin:
        metrics_res["platform_total_users"] = db.query(User).count()
        metrics_res["platform_total_scans"] = db.query(ScanLog).count()
    
    return metrics_res

# ──── Admin-Only: Full User Database Access ────

@router.get("/admin/all", response_model=list[UserProfile])
def get_all_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Returns a complete list of all registered users.
    Strictly restricted to Admin users only.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access Denied: Admin permissions required to view user database."
        )
    
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users
