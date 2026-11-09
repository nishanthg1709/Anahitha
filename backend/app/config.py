import os
from pathlib import Path
from dotenv import load_dotenv

# Path to backend/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Free-tier Gemini model constants
DEFAULT_GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

def get_gemini_model() -> str:
    return os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL).strip()

def get_gemini_fallback_model() -> str:
    """Optional fallback model name; returns empty string if not set."""
    return os.getenv("GEMINI_FALLBACK_MODEL", "").strip()

# Never print or log the key!
def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()

def is_gemini_api_key_set() -> bool:
    return bool(get_gemini_api_key())

# Supabase Configuration
def get_supabase_url() -> str:
    return os.getenv("SUPABASE_URL", "").strip()

def get_supabase_anon_key() -> str:
    return os.getenv("SUPABASE_ANON_KEY", "").strip()

def get_supabase_jwt_secret() -> str:
    return os.getenv("SUPABASE_JWT_SECRET", "").strip()

def is_supabase_configured() -> bool:
    return bool(get_supabase_url() and get_supabase_anon_key())

# Allowed CORS origins
ALLOWED_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
