from typing import Optional, List, Literal
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import ALLOWED_CORS_ORIGINS
from app.limiter import rate_limiter
from app.healthcare.emergency import detect_emergency, EmergencyCheckResult
from app.chat_service import generate_companion_reply

app = FastAPI(
    title="Anahitha Healthcare AI Backend",
    version="0.2.0",
    description="Backend service for Anahitha with deterministic clinical safety guardrails and Gemini chat",
)

# CORS restricted strictly to frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# --- Schemas ---

class HealthResponse(BaseModel):
    status: str
    message: str

class ScreenRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="The user's query or message to screen")

ChatMode = Literal["symptoms", "info", "guidance", "wellness", "chat"]

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000, description="User's query (max 1000 characters)")
    mode: ChatMode = Field(default="chat", description="Conversation mode")

class ChatResponse(BaseModel):
    reply: str
    emergency: bool = False
    category: Optional[str] = None
    urgent_guidance: Optional[str] = None
    matched_triggers: List[str] = Field(default_factory=list)
    helpline: Optional[str] = None
    note: Optional[str] = None
    error: Optional[str] = None

# --- Endpoints ---

@app.get("/api/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        message="Anahitha backend is running smoothly",
    )

@app.post("/api/screen-emergency", response_model=EmergencyCheckResult)
def screen_emergency_endpoint(req: ScreenRequest):
    """
    Deterministic rule-based emergency screener.
    Runs offline without AI.
    """
    return detect_emergency(req.message)

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest, request: Request):
    """
    Main conversational endpoint for Dr. Anahitha.
    1. Checks rate limit (20 req/min per IP).
    2. Runs rule-based emergency detection BEFORE any Gemini call.
    3. If emergency triggered, returns guidance immediately with emergency=true (no AI call).
    4. Otherwise, calls Gemini API with mode-specific instructions.
    5. Returns friendly fallback on AI failure (never crashes).
    """
    # 1. Rate limiting (20 requests per minute per IP)
    rate_limiter.check_rate_limit(request)

    # 2. Safety screening: must run BEFORE calling Gemini
    emergency_result = detect_emergency(req.message)
    if emergency_result.is_emergency:
        return ChatResponse(
            reply=emergency_result.urgent_guidance or "Immediate medical emergency detected. Please call 112.",
            emergency=True,
            category=emergency_result.category,
            urgent_guidance=emergency_result.urgent_guidance,
            matched_triggers=emergency_result.matched_triggers,
            helpline=emergency_result.helpline,
            note=emergency_result.note,
        )

    # 3. Call Gemini via official google-genai SDK
    reply_text, error_msg = generate_companion_reply(req.message, mode=req.mode)

    return ChatResponse(
        reply=reply_text,
        emergency=False,
        error=error_msg,
    )
