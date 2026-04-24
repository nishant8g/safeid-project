import os
from pathlib import Path
from dotenv import load_dotenv

# Look for .env right in the current folder (backend/)
ENV_LOCAL = Path("").resolve() / ".env.local"
ENV_DEFAULT = Path("").resolve() / ".env"

print(f"DEBUG: CWD detected as: {Path('').resolve()}")
print(f"DEBUG: Checking .env.local at: {ENV_LOCAL}")
print(f"DEBUG: .env.local exists? {ENV_LOCAL.exists()}")

# Explicitly load files into environment variables
if ENV_LOCAL.exists():
    load_dotenv(str(ENV_LOCAL), override=True)
elif ENV_DEFAULT.exists():
    load_dotenv(str(ENV_DEFAULT), override=True)

from pydantic_settings import BaseSettings


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
    APP_NAME: str = os.getenv("APP_NAME", "ResQ")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "resq-super-secret-key")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # URLs
    LAN_IP: str = get_lan_ip()
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resq.db")
    
    # OAuth
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    print(f"DEBUG CONFIG: Google Client ID Loaded: '{GOOGLE_CLIENT_ID}'")

    # Twilio (optional secondary channel)
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_PHONE_NUMBER: str = os.getenv("TWILIO_PHONE_NUMBER", "")
    TWILIO_WHATSAPP_FROM: str = os.getenv("TWILIO_WHATSAPP_FROM", "")

    # Gmail SMTP (primary channel)
    SMTP_EMAIL: str = os.getenv("SMTP_EMAIL", "")
    SMTP_APP_PASSWORD: str = os.getenv("SMTP_APP_PASSWORD", "")

    # Google Maps / AI
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GOOGLE_MAPS_API_KEY: str = os.getenv("GOOGLE_MAPS_API_KEY", "")

    class Config:
        extra = "ignore"


settings = Settings()

