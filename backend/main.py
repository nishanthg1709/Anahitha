import logging
from contextlib import asynccontextmanager
from typing import Optional, List, Literal
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.config import ALLOWED_CORS_ORIGINS, is_gemini_api_key_set, get_gemini_model, get_gemini_fallback_model
from app.limiter import rate_limiter
from app.healthcare.emergency import detect_emergency, EmergencyCheckResult
from app.chat_service import generate_companion_reply
from app.auth import get_optional_user, get_required_user
from app.database import db

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("anahitha.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Log once at startup whether GEMINI_API_KEY is set (true/false only)
    key_is_set = is_gemini_api_key_set()
    logger.info(f"Startup: GEMINI_API_KEY set: {key_is_set}")
    logger.info(f"Startup: GEMINI_MODEL: {get_gemini_model()}")
    fallback = get_gemini_fallback_model()
    logger.info(f"Startup: GEMINI_FALLBACK_MODEL: {fallback if fallback else '(disabled)'}")
    yield

app = FastAPI(
    title="Anahitha Healthcare AI Backend",
    version="0.2.0",
    description="Backend service for Anahitha with deterministic clinical safety guardrails and Gemini chat",
    lifespan=lifespan,
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

class ProfileUpdateRequest(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)

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
    6. If user is authenticated, saves message history. If user is guest, stores nothing.
    """
    # 1. Rate limiting (20 requests per minute per IP)
    rate_limiter.check_rate_limit(request)

    # Check for authenticated user (returns None for guests)
    user = get_optional_user(request)

    # 2. Safety screening: must run BEFORE calling Gemini
    emergency_result = detect_emergency(req.message)
    if emergency_result.is_emergency:
        reply_text = emergency_result.urgent_guidance or "These symptoms can be a sign of a serious emergency. Call 112 now."
        if user:
            db.save_chat_message(
                user_id=user["id"],
                mode=req.mode,
                user_content=req.message,
                assistant_content=reply_text,
                is_emergency=True,
            )

        return ChatResponse(
            reply=reply_text,
            emergency=True,
            category=emergency_result.category,
            urgent_guidance=emergency_result.urgent_guidance,
            matched_triggers=emergency_result.matched_triggers,
            helpline=emergency_result.helpline,
            note=emergency_result.note,
        )

    # 3. Call Gemini via official google-genai SDK
    reply_text, error_msg = generate_companion_reply(req.message, mode=req.mode)

    # Save to history ONLY if logged in (guests store nothing)
    if user:
        db.save_chat_message(
            user_id=user["id"],
            mode=req.mode,
            user_content=req.message,
            assistant_content=reply_text,
            is_emergency=False,
        )

    return ChatResponse(
        reply=reply_text,
        emergency=False,
        error=error_msg,
    )

@app.get("/api/chat/history")
def get_chat_history_endpoint(request: Request):
    """
    Retrieves saved conversation history for the authenticated user.
    Enforces Row Level Security (RLS) - returns only the authenticated user's rows.
    Requires a valid Supabase JWT Bearer token.
    """
    user = get_required_user(request)
    conversations = db.get_user_chat_history(user["id"])
    return {"conversations": conversations}

@app.delete("/api/chat/conversations/{conversation_id}")
def delete_conversation_endpoint(conversation_id: str, request: Request):
    """
    Deletes a specific conversation and its messages.
    Enforces RLS: User can only delete their own conversation.
    """
    user = get_required_user(request)
    success = db.delete_conversation(user["id"], conversation_id)
    if not success:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Conversation not found or unauthorized")
    return {"status": "ok", "message": "Conversation deleted successfully"}

@app.delete("/api/user/data")
def delete_user_data_endpoint(request: Request):
    """
    Deletes all saved conversations, messages, and profile data for the authenticated user.
    """
    user = get_required_user(request)
    deleted_count = db.delete_user_data(user["id"])
    return {
        "status": "ok",
        "deleted_conversations": deleted_count,
        "message": "All user data deleted successfully",
    }

@app.get("/api/user/profile")
def get_user_profile_endpoint(request: Request):
    """
    Retrieves the authenticated user's profile.
    """
    user = get_required_user(request)
    return db.get_user_profile(user["id"], default_email=user.get("email", ""))

@app.put("/api/user/profile")
def update_user_profile_endpoint(req: ProfileUpdateRequest, request: Request):
    """
    Updates the authenticated user's profile display name.
    """
    user = get_required_user(request)
    return db.update_user_profile(user["id"], display_name=req.display_name)
