"""AI Service — Claude-powered message generation and severity analysis."""

import logging
from typing import Optional

from ..config import settings

logger = logging.getLogger(__name__)

# Try to import anthropic
try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False
    logger.warning("anthropic package not installed, using template fallback")


def get_claude_client():
    """Get Anthropic client if available."""
    if HAS_ANTHROPIC and settings.ANTHROPIC_API_KEY:
        return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    return None


def generate_sos_message(
    user_name: str,
    blood_group: Optional[str] = None,
    conditions: Optional[str] = None,
    allergies: Optional[str] = None,
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    address: Optional[str] = None,
) -> str:
    """
    Generate a clear, human-friendly SOS message.
    Uses Claude AI if available, otherwise falls back to a template.
    """
    # Build location info
    location_str = ""
    if latitude and longitude:
        maps_link = f"https://www.google.com/maps?q={latitude},{longitude}"
        location_str = f"📍 Location: {address or 'See map'}\n🗺️ Map: {maps_link}"
    elif address:
        location_str = f"📍 Location: {address}"

    # Try AI generation
    client = get_claude_client()
    if client:
        try:
            prompt = f"""Generate a brief, clear emergency SOS message for sending to family contacts.
The message should be:
- Urgent but not panic-inducing
- Include all critical medical info
- Be under 300 characters suitable for SMS

Details:
- Person's name: {user_name}
- Blood group: {blood_group or 'Unknown'}
- Medical conditions: {conditions or 'None reported'}
- Allergies: {allergies or 'None reported'}
- Location: {address or 'Unknown'}
- Map link: {f'https://www.google.com/maps?q={latitude},{longitude}' if latitude and longitude else 'Unknown'}

Return ONLY the message text, no quotes or explanation."""

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
            )
            ai_message = response.content[0].text.strip()
            return ai_message
        except Exception as e:
            logger.error(f"Claude AI message generation failed: {e}")

    # Template fallback
    medical_info = []
    if blood_group:
        medical_info.append(f"Blood: {blood_group}")
    if allergies and allergies.lower() != "none":
        medical_info.append(f"Allergies: {allergies}")
    if conditions and conditions.lower() != "none":
        medical_info.append(f"Conditions: {conditions}")

    medical_str = " | ".join(medical_info) if medical_info else "No medical details on file"

    message = f"🚨 EMERGENCY SOS — {user_name}\n\n"
    message += f"⚕️ {medical_str}\n\n"
    if location_str:
        message += f"{location_str}\n\n"
    message += "⚠️ Someone has triggered an emergency alert. Please respond immediately or call emergency services."

    return message


def analyze_severity(description: str = None, image_description: str = None) -> dict:
    """
    Analyze severity of an emergency situation.
    Returns: {severity: minor/moderate/critical, explanation: str}
    """
    client = get_claude_client()

    if client:
        try:
            prompt = f"""You are a medical triage assistant. Based on the following information,
classify the emergency severity as one of: minor, moderate, or critical.

Description from rescuer: {description or 'No description provided'}
Visual observation: {image_description or 'No visual observation'}

Respond in this exact JSON format:
{{"severity": "minor|moderate|critical", "explanation": "brief one-sentence explanation"}}

Return ONLY the JSON, nothing else."""

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=200,
                messages=[{"role": "user", "content": prompt}],
            )
            import json
            result = json.loads(response.content[0].text.strip())
            return result
        except Exception as e:
            logger.error(f"Claude severity analysis failed: {e}")

    # Fallback
    return {
        "severity": "unknown",
        "explanation": "Unable to assess severity — AI service unavailable. Please call emergency services.",
    }


def generate_risk_predictions(
    blood_group: Optional[str] = None,
    allergies: Optional[str] = None,
    conditions: Optional[str] = None,
    medications: Optional[str] = None,
    date_of_birth: Optional[str] = None,
) -> dict:
    """
    Generate health risk predictions and recommendations based on medical data.
    """
    client = get_claude_client()

    if client:
        try:
            prompt = f"""You are a medical safety advisor. Based on the following patient information,
provide risk warnings and safety recommendations they should be aware of in emergencies.

Patient Info:
- Blood Group: {blood_group or 'Unknown'}
- Allergies: {allergies or 'None'}
- Medical Conditions: {conditions or 'None'}
- Current Medications: {medications or 'None'}
- Date of Birth: {date_of_birth or 'Unknown'}

Respond in this exact JSON format:
{{
  "risk_level": "low|medium|high",
  "warnings": ["warning 1", "warning 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}}

Be specific and actionable. Max 3 warnings and 4 recommendations. Return ONLY JSON."""

            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}],
            )
            import json
            result = json.loads(response.content[0].text.strip())
            return result
        except Exception as e:
            logger.error(f"Claude risk prediction failed: {e}")

    # Template-based fallback
    warnings = []
    recommendations = []
    risk_level = "low"

    if allergies and allergies.lower() != "none":
        warnings.append(f"⚠️ Active allergies: {allergies}. Carry an allergy alert card.")
        risk_level = "medium"

    if conditions and conditions.lower() != "none":
        warnings.append(f"⚠️ Medical conditions on record: {conditions}")
        risk_level = "medium"
        if any(word in conditions.lower() for word in ["diabetes", "heart", "epilepsy", "asthma"]):
            risk_level = "high"

    if medications and medications.lower() != "none":
        warnings.append(f"⚠️ Currently on medications: {medications}")
        recommendations.append("Carry a list of your medications at all times.")

    if blood_group:
        recommendations.append(f"Your blood group is {blood_group}. Make sure this is visible on your medical ID.")

    recommendations.append("Keep your emergency contacts up to date.")
    recommendations.append("Share your SafeID QR code with close family members.")

    if not warnings:
        warnings.append("No critical warnings based on current data.")

    return {
        "risk_level": risk_level,
        "warnings": warnings,
        "recommendations": recommendations,
    }
