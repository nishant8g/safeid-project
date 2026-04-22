import os
import sys
import traceback
from pathlib import Path

# Add the project root to sys.path so 'backend' is findable
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

try:
    from backend.app.main import app

    @app.get("/api/health-bridge")
    def health_bridge():
        return {"status": "Bridge Active", "runtime": "Vercel Serverless", "python": sys.version}

except Exception as e:
    # If import fails, create a minimal app that reports the error
    from fastapi import FastAPI
    app = FastAPI()
    _error = traceback.format_exc()

    @app.get("/api/health-bridge")
    def health_bridge_error():
        return {"status": "IMPORT_FAILED", "error": str(_error), "python": sys.version}

    @app.get("/api/{path:path}")
    def catch_all(path: str):
        return {"status": "IMPORT_FAILED", "error": str(_error), "path": path}
