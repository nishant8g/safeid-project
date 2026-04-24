"""
ResQ — FastAPI Application Entry Point
AI-Powered Emergency QR Response System
Version: 1.0.1 (Production Refresh)
"""

import logging
import secrets
import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback
from pathlib import Path

from .models import user as user_model, medical, contact, qrcode, alert as alert_model, analytics
from .routes import auth, user, qr, scan, alert, ai
from .config import settings
from .database import init_db

# Configure logging to both console and file for debugging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("error_log.txt"),
        logging.StreamHandler()
    ]
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
    title="ResQ API",
    description="AI-Powered Emergency QR Response System",
    version="1.0.0",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    root_path="/api" if os.environ.get("VERCEL") else "",
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"GLOBAL CRASH: {str(exc)}\n{traceback.format_exc()}"
    logger.error(error_msg)
    return JSONResponse(
        status_code=500,
        content={"detail": f"INTERNAL SERVER ERROR: {str(exc)}", "trace": traceback.format_exc()},
    )

# Secure Docs Routes
@app.get("/docs", include_in_schema=False)
async def get_secure_documentation(admin: str = Depends(get_current_admin)):
    return get_swagger_ui_html(openapi_url="/openapi.json", title="ResQ API secured")

@app.get("/openapi.json", include_in_schema=False)
async def get_openapi_endpoint(admin: str = Depends(get_current_admin)):
    return get_openapi(title=app.title, version=app.version, routes=app.routes)

# CORS — allow frontend from any origin (dev mode: phones on same WiFi)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://resq-project.vercel.app",
        f"http://{settings.LAN_IP}:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Vercel Serverless environment makes disk read-only except for /tmp
import os
if os.environ.get("VERCEL"):
    qr_dir = Path("/tmp/qr")
    alert_dir = Path("/tmp/alerts")
else:
    qr_dir = Path(__file__).resolve().parent.parent / "qr" / "generated"
    alert_dir = Path(__file__).resolve().parent.parent / "static" / "alerts"

# Mount QR code images as static files
qr_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/qr", StaticFiles(directory=str(qr_dir)), name="qr_images")

# Mount accident photos as static files
alert_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static/alerts", StaticFiles(directory=str(alert_dir)), name="alert_images")

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
    logger.info("Database initialized")
    logger.info(f"API docs: http://localhost:8000/docs")
    logger.info(f"Frontend expected at: {settings.FRONTEND_URL}")


@app.get("/", tags=["Health Check"])
def root():
    """Health check endpoint."""
    return {
        "status": "running",
        "app": "ResQ API",
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
