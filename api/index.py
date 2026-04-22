from fastapi import FastAPI
import sys
import os

app = FastAPI()

@app.get("/api/health-bridge")
def health_bridge():
    return {
        "status": "Bridge Active (Mini)",
        "python": sys.version,
        "cwd": os.getcwd(),
        "sys_path": sys.path
    }

@app.get("/api/test-import")
def test_import():
    try:
        import backend
        return {"status": "backend imported"}
    except Exception as e:
        import traceback
        return {"status": "import failed", "error": str(e), "traceback": traceback.format_exc()}
