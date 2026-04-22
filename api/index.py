from fastapi import FastAPI
import sys
import os
import traceback

app = FastAPI()

@app.get("/api/health-bridge")
def health_bridge():
    return {
        "status": "Bridge Active (Diagnostic)",
        "python": sys.version,
        "cwd": os.getcwd()
    }

@app.get("/api/test-full-import")
def test_full_import():
    try:
        # Add the project root to sys.path
        from pathlib import Path
        root_dir = str(Path(__file__).resolve().parent.parent)
        if root_dir not in sys.path:
            sys.path.insert(0, root_dir)
            
        from backend.app.main import app as main_app
        return {"status": "full main app imported successfully"}
    except Exception as e:
        return {
            "status": "full import failed",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
