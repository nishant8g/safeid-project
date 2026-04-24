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
    LAN_IP: str = LAN_IP
    APP_NAME: str = "ResQ"
    APP_ENV: str = "development"
    SECRET_KEY: str = "resq-super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    BASE_URL: str = os.getenv("BASE_URL", "https://resq-project.vercel.app")

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:////tmp/resq.db" if os.environ.get("VERCEL") else "sqlite:///./resq.db"
    )
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8001")
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "963876569237-9osij8medcclsjr52ehr7mb4vs2fluq7.apps.googleusercontent.com")

    # Twilio (optional secondary channel)
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_PHONE_NUMBER: str = ""
    TWILIO_WHATSAPP_FROM: str = ""

    # Gmail SMTP (primary channel)
    SMTP_EMAIL: str = ""
    SMTP_APP_PASSWORD: str = ""

    # AI (Migrating to Gemini for Free Tier)
    ANTHROPIC_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # What3Words
    WHAT3WORDS_API_KEY: str = ""

    # Telegram (Free Automated Alerts)
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_CHAT_ID: str = ""

    # CORS — allow both localhost and LAN access
    FRONTEND_URL: str = f"http://{LAN_IP}:3000"

    class Config:
        case_sensitive = False
        # Load .env.local first (overrides .env for dev), then .env
        env_file = (str(ENV_PATH.parent / ".env.local"), str(ENV_PATH))
        env_file_encoding = "utf-8"
        extra = "allow"


settings = Settings()

