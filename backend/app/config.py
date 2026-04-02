"""Application configuration loaded from environment variables."""

import os
import socket
from pathlib import Path
from pydantic_settings import BaseSettings

# Load .env from project root
ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


def get_lan_ip() -> str:
    """Get the local network IP address for QR codes to be scannable from phones."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "localhost"


LAN_IP = get_lan_ip()


class Settings(BaseSettings):
    """Application settings."""

    # App
    APP_NAME: str = "SafeID"
    APP_ENV: str = "development"
    SECRET_KEY: str = "safeid-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    BASE_URL: str = f"http://{LAN_IP}:3000"

    # Database
    DATABASE_URL: str = "sqlite:///./safeid.db"

    # Twilio
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    TWILIO_WHATSAPP_FROM: str = ""

    # Anthropic
    ANTHROPIC_API_KEY: str = ""

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # What3Words
    WHAT3WORDS_API_KEY: str = ""

    # CORS — allow both localhost and LAN access
    FRONTEND_URL: str = f"http://{LAN_IP}:3000"

    class Config:
        env_file = str(ENV_PATH)
        env_file_encoding = "utf-8"
        extra = "allow"


settings = Settings()

