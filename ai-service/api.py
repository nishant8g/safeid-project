"""
SafeID AI Service — Optional standalone API.
This can run as a separate microservice or be integrated into the main backend.
"""

from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional
from model import generate_emergency_message, classify_severity

app = FastAPI(title="SafeID AI Service", version="1.0.0")


class MessageRequest(BaseModel):
    name: str
    blood_group: Optional[str] = None
    conditions: Optional[str] = None
    allergies: Optional[str] = None
    location_url: Optional[str] = None
    address: Optional[str] = None


class SeverityRequest(BaseModel):
    description: str


@app.post("/generate-message")
def gen_message(req: MessageRequest):
    msg = generate_emergency_message(
        name=req.name,
        blood_group=req.blood_group,
        conditions=req.conditions,
        allergies=req.allergies,
        location_url=req.location_url,
        address=req.address,
    )
    return {"message": msg}


@app.post("/analyze-severity")
def analyze(req: SeverityRequest):
    result = classify_severity(req.description)
    return result


@app.get("/health")
def health():
    return {"status": "healthy", "service": "SafeID AI"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
