"""
SafeID AI Service — Claude-powered model wrappers.
Provides SOS message generation, severity analysis, and risk prediction.
"""

import os
import json
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import anthropic
try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


def get_client():
    """Get Anthropic Claude client."""
    api_key = os.getenv("ANTHROPIC_API_KEY", "")
    if HAS_ANTHROPIC and api_key:
        return anthropic.Anthropic(api_key=api_key)
    return None


def generate_emergency_message(
    name: str,
    blood_group: str = None,
    conditions: str = None,
    allergies: str = None,
    location_url: str = None,
    address: str = None,
) -> str:
    """Generate a clear, human-friendly SOS message using Claude AI."""
    client = get_client()
    if not client:
        # Template fallback
        parts = [f"🚨 EMERGENCY SOS — {name}"]
        if blood_group:
            parts.append(f"Blood: {blood_group}")
        if allergies:
            parts.append(f"Allergies: {allergies}")
        if conditions:
            parts.append(f"Conditions: {conditions}")
        if location_url:
            parts.append(f"📍 {location_url}")
        parts.append("Please respond immediately!")
        return " | ".join(parts)

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=250,
            messages=[{
                "role": "user",
                "content": f"""Generate a brief emergency SMS (under 300 chars). Person: {name}, Blood: {blood_group or 'Unknown'}, Allergies: {allergies or 'None'}, Conditions: {conditions or 'None'}, Location: {address or location_url or 'Unknown'}. Return ONLY the message."""
            }],
        )
        return response.content[0].text.strip()
    except Exception as e:
        logger.error(f"AI message gen failed: {e}")
        return f"🚨 EMERGENCY: {name} needs help. {f'Location: {location_url}' if location_url else ''} Please respond!"


def classify_severity(description: str) -> dict:
    """Classify emergency severity: minor, moderate, critical."""
    client = get_client()
    if not client:
        return {"severity": "unknown", "explanation": "AI unavailable"}

    try:
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=100,
            messages=[{
                "role": "user",
                "content": f'Classify severity as minor/moderate/critical. Description: "{description}". Return JSON: {{"severity":"...","explanation":"..."}}'
            }],
        )
        return json.loads(response.content[0].text.strip())
    except Exception as e:
        logger.error(f"Severity analysis failed: {e}")
        return {"severity": "unknown", "explanation": str(e)}


if __name__ == "__main__":
    # Quick test
    msg = generate_emergency_message("Nishant", "O+", "Diabetes", "Penicillin")
    print(f"SOS Message: {msg}")
