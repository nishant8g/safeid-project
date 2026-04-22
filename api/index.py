import os
import sys
from pathlib import Path

# Add the project root to sys.path so 'backend' is findable
root_dir = str(Path(__file__).resolve().parent.parent)
if root_dir not in sys.path:
    sys.path.append(root_dir)

from backend.app.main import app

@app.get("/api/health-bridge")
def health_bridge():
    return {"status": "Bridge Active", "runtime": "Vercel Serverless"}
