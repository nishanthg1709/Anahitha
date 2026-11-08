import os
from pathlib import Path
from dotenv import load_dotenv

# Path to backend/.env
ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=ENV_PATH)

# Free-tier Gemini model constant
DEFAULT_GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Never print or log the key!
def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()

# Allowed CORS origins
ALLOWED_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

