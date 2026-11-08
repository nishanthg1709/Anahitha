from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from safety.emergency import detect_emergency, EmergencyDetectionResult

app = FastAPI(
    title="Anahitha Healthcare AI Backend",
    version="0.1.0",
    description="Backend service for Anahitha Healthcare AI with deterministic clinical safety guardrails",
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HealthResponse(BaseModel):
    status: str
    message: str

class ScreenRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="The user's query or message to screen")

@app.get("/api/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        message="Anahitha backend is running smoothly"
    )

@app.post("/api/screen-emergency", response_model=EmergencyDetectionResult)
def screen_emergency_endpoint(req: ScreenRequest):
    """
    Deterministic rule-based emergency screener.
    Must always run BEFORE any AI call or model inference.
    """
    return detect_emergency(req.message)
