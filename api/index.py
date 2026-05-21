import os
import sys
from pathlib import Path
import traceback

# Add the project root to sys.path so 'backend' is findable
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    # Import the actual FastAPI app from the backend
    from backend.app.main import app
except Exception as e:
    tb = traceback.format_exc()
    print(f"CRITICAL BOOT ERROR:\n{tb}")
    
    from fastapi import FastAPI
    from fastapi.responses import HTMLResponse
    
    app = FastAPI()
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    def catch_all(path_name: str):
        return HTMLResponse(
            content=f"<html><body><h1>Vercel Boot Error</h1><pre>{tb}</pre></body></html>",
            status_code=500
        )
