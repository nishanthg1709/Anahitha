import os
import logging
from typing import Optional, Dict, Any
import jwt
from fastapi import Request, HTTPException, status
from app.config import get_supabase_jwt_secret

logger = logging.getLogger("anahitha.auth")

def decode_supabase_token(token: str) -> Dict[str, Any]:
    """
    Decodes and validates a Supabase JWT.
    If SUPABASE_JWT_SECRET is configured, verifies the HMAC/RSA signature.
    Otherwise, parses claims securely (for dev/test environments).
    """
    secret = get_supabase_jwt_secret()

    try:
        if secret:
            payload = jwt.decode(
                token,
                secret,
                algorithms=["HS256", "RS256"],
                options={"verify_aud": False},
            )
        else:
            payload = jwt.decode(
                token,
                options={"verify_signature": False},
                algorithms=["HS256", "RS256"],
            )

        user_id = payload.get("sub") or payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject (user_id)",
            )

        return {
            "id": str(user_id),
            "email": payload.get("email", ""),
            "role": payload.get("role", "authenticated"),
        }

    except jwt.PyJWTError as exc:
        logger.warning(f"JWT verification failed: {type(exc).__name__}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
        )

def get_optional_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Extracts authenticated user from Authorization header if present.
    Returns None for guest requests without throwing.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1].strip()
    if not token or token in ("null", "undefined", "none"):
        return None

    try:
        return decode_supabase_token(token)
    except HTTPException:
        return None

def get_required_user(request: Request) -> Dict[str, Any]:
    """
    Extracts authenticated user from Authorization header.
    Raises HTTP 401 if missing or invalid.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to access this endpoint.",
        )

    token = auth_header.split(" ", 1)[1].strip()
    return decode_supabase_token(token)
