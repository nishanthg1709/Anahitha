from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Anahitha Healthcare AI Backend",
    version="0.1.0",
    description="Backend service for Anahitha Healthcare AI",
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

@app.get("/api/health", response_model=HealthResponse)
def get_health():
    return HealthResponse(
        status="ok",
        message="Anahitha backend is running smoothly"
    )

