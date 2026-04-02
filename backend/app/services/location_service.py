"""Location service — Google Maps reverse geocoding and What3Words."""

import logging
from typing import Optional

import httpx

from ..config import settings

logger = logging.getLogger(__name__)


async def reverse_geocode(latitude: float, longitude: float) -> Optional[str]:
    """
    Convert lat/lng to a human-readable address using Google Maps Geocoding API.
    Falls back to coordinate string if API fails.
    """
    if settings.GOOGLE_MAPS_API_KEY:
        try:
            url = "https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                "latlng": f"{latitude},{longitude}",
                "key": settings.GOOGLE_MAPS_API_KEY,
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)
                data = response.json()

                if data.get("status") == "OK" and data.get("results"):
                    return data["results"][0]["formatted_address"]
        except Exception as e:
            logger.error(f"Google Maps geocoding failed: {e}")

    # Fallback — return raw coordinates
    return f"Lat: {latitude:.6f}, Lng: {longitude:.6f}"


async def get_what3words(latitude: float, longitude: float) -> Optional[str]:
    """
    Get What3Words address for a location.
    """
    if settings.WHAT3WORDS_API_KEY:
        try:
            url = "https://api.what3words.com/v3/convert-to-3wa"
            params = {
                "coordinates": f"{latitude},{longitude}",
                "key": settings.WHAT3WORDS_API_KEY,
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(url, params=params)
                data = response.json()
                if "words" in data:
                    return data["words"]
        except Exception as e:
            logger.error(f"What3Words API failed: {e}")

    return None


def get_google_maps_link(latitude: float, longitude: float) -> str:
    """Generate a Google Maps link for a location."""
    return f"https://www.google.com/maps?q={latitude},{longitude}"
