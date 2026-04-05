"""
SafeID — FastAPI Application Entry Point
AI-Powered Emergency QR Response System
"""

import logging
import secrets
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .models import user, medical, contact, qrcode, alert, analytics
from .routes import auth, user, qr, scan, alert, ai
from .config import settings
from .database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Basic Auth for Securing the Backend Dashboard
security = HTTPBasic()

def get_current_admin(credentials: HTTPBasicCredentials = Depends(security)):
    correct_username = secrets.compare_digest(credentials.username, "admin")
    correct_password = secrets.compare_digest(credentials.password, "larry")
    if not (correct_username and correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access Denied: You are not the owner of this server.",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

# Create FastAPI app (Public Docs Disabled)
app = FastAPI(
    title="SafeID API",
    description="AI-Powered Emergency QR Response System",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# Secure Docs Routes
@app.get("/docs", include_in_schema=False)
async def get_secure_documentation(admin: str = Depends(get_current_admin)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="SafeID API secured")

@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_endpoint(admin: str = Depends(get_current_admin)):
    return get_openapi(title=app.title, version=app.version, routes=app.routes)

# CORS — allow frontend from any origin (dev mode: phones on same WiFi)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount QR code images as static files
qr_dir = Path(__file__).resolve().parent.parent / "qr" / "generated"
qr_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/qr", StaticFiles(directory=str(qr_dir)), name="qr_images")

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(qr.router)
app.include_router(scan.router)
app.include_router(alert.router)
app.include_router(ai.router)


@app.on_event("startup")
def startup():
    """Initialize database on startup."""
    init_db()
    logger.info("✅ Database initialized")
    logger.info(f"📡 API docs: http://localhost:8000/docs")
    logger.info(f"🌐 Frontend expected at: {settings.FRONTEND_URL}")


@app.get("/", tags=["Health Check"])
def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "app": "SafeID API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health Check"])
def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "twilio": "configured" if settings.TWILIO_ACCOUNT_SID else "not configured",
            "ai": "configured" if settings.ANTHROPIC_API_KEY else "not configured",
            "maps": "configured" if settings.GOOGLE_MAPS_API_KEY else "not configured",
        },
    }
