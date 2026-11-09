import jwt
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app
from app.database import db
from app.limiter import rate_limiter

client = TestClient(app)

# Helper to create test tokens
def create_test_token(user_id: str, email: str = "test@example.com") -> str:
    return jwt.encode(
        {"sub": user_id, "email": email, "role": "authenticated"},
        "test-secret-key-that-is-at-least-32-bytes-long-for-sha256",
        algorithm="HS256",
    )

@pytest.fixture(autouse=True)
def reset_state():
    """Reset database and rate limiter before each test."""
    db.reset()
    rate_limiter.reset()

# --- 1. Guest Chat Stores Nothing ---

@patch("main.generate_companion_reply")
def test_guest_chat_stores_nothing(mock_gemini):
    """
    Guests can freely use /chat, but their messages MUST NEVER be stored in the database.
    """
    mock_gemini.return_value = ("Here is general hydration advice.", None)

    # Guest sends chat message (no Authorization header)
    response = client.post(
        "/api/chat",
        json={"message": "How much water should I drink daily?", "mode": "wellness"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is False
    assert "hydration" in data["reply"]

    # Verify zero messages are stored in database
    assert db.total_stored_messages() == 0

@patch("main.generate_companion_reply")
def test_guest_emergency_chat_stores_nothing(mock_gemini):
    """
    When a guest message triggers emergency guidance, it is returned immediately
    and NEVER stored in the database.
    """
    response = client.post(
        "/api/chat",
        json={"message": "Help me, I cannot breathe and lips are turning blue", "mode": "chat"},
    )
    assert response.status_code == 200
    assert response.json()["emergency"] is True
    mock_gemini.assert_not_called()

    # Zero messages stored
    assert db.total_stored_messages() == 0

# --- 2. Authenticated Chat Saves Messages ---

@patch("main.generate_companion_reply")
def test_authenticated_chat_saves_messages(mock_gemini):
    """
    When an authenticated user chats, their prompt and Dr. Anahitha's reply
    are saved to their conversation history.
    """
    mock_gemini.return_value = ("Sleep hygiene involves consistent bedtimes.", None)
    user_id = "user-123-uuid"
    token = create_test_token(user_id, "user1@example.com")

    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/chat",
        json={"message": "Tips for better sleep?", "mode": "wellness"},
        headers=headers,
    )
    assert response.status_code == 200

    # User message + assistant message = 2 messages saved
    assert db.total_stored_messages() == 2

    # Check history endpoint returns the saved conversation
    hist_resp = client.get("/api/chat/history", headers=headers)
    assert hist_resp.status_code == 200
    history = hist_resp.json()["conversations"]
    assert len(history) == 1
    assert history[0]["user_id"] == user_id
    assert len(history[0]["messages"]) == 2
    assert history[0]["messages"][0]["content"] == "Tips for better sleep?"
    assert history[0]["messages"][1]["content"] == "Sleep hygiene involves consistent bedtimes."

# --- 3. Row Level Security: User A Cannot Read User B's Rows ---

@patch("main.generate_companion_reply")
def test_row_level_security_isolation_between_two_users(mock_gemini):
    """
    Row Level Security (RLS) enforcement:
    User A and User B both send chat messages.
    User A can ONLY see User A's conversations and messages.
    User B can ONLY see User B's conversations and messages.
    Neither user can read the other's rows.
    """
    mock_gemini.side_effect = [
        ("User A response from Dr. Anahitha", None),
        ("User B response from Dr. Anahitha", None),
    ]

    user_a_id = "user-a-1111-uuid"
    user_b_id = "user-b-2222-uuid"

    token_a = create_test_token(user_a_id, "usera@example.com")
    token_b = create_test_token(user_b_id, "userb@example.com")

    headers_a = {"Authorization": f"Bearer {token_a}"}
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A chats
    resp_a = client.post(
        "/api/chat",
        json={"message": "User A secret question about headaches", "mode": "symptoms"},
        headers=headers_a,
    )
    assert resp_a.status_code == 200

    # User B chats
    resp_b = client.post(
        "/api/chat",
        json={"message": "User B secret question about allergies", "mode": "info"},
        headers=headers_b,
    )
    assert resp_b.status_code == 200

    # Total 4 messages in database (2 for A, 2 for B)
    assert db.total_stored_messages() == 4

    # 1. User A requests their history
    hist_a = client.get("/api/chat/history", headers=headers_a).json()["conversations"]
    assert len(hist_a) == 1
    assert hist_a[0]["user_id"] == user_a_id
    assert "User A secret question" in hist_a[0]["messages"][0]["content"]

    # Verify User A CANNOT see any of User B's content
    all_content_visible_to_a = " ".join(
        m["content"] for conv in hist_a for m in conv["messages"]
    )
    assert "User B secret question" not in all_content_visible_to_a
    assert "allergies" not in all_content_visible_to_a

    # 2. User B requests their history
    hist_b = client.get("/api/chat/history", headers=headers_b).json()["conversations"]
    assert len(hist_b) == 1
    assert hist_b[0]["user_id"] == user_b_id
    assert "User B secret question" in hist_b[0]["messages"][0]["content"]

    # Verify User B CANNOT see any of User A's content
    all_content_visible_to_b = " ".join(
        m["content"] for conv in hist_b for m in conv["messages"]
    )
    assert "User A secret question" not in all_content_visible_to_b
    assert "headaches" not in all_content_visible_to_b

# --- 4. Authentication Enforcement on Protected Endpoints ---

def test_history_endpoint_rejects_unauthenticated_requests():
    """
    GET /api/chat/history requires authentication.
    Requests without Authorization header must return HTTP 401.
    """
    response = client.get("/api/chat/history")
    assert response.status_code == 401
    assert "Authentication required" in response.json()["detail"]

def test_history_endpoint_rejects_malformed_tokens():
    """
    GET /api/chat/history with invalid token string returns HTTP 401.
    """
    response = client.get("/api/chat/history", headers={"Authorization": "Bearer not-a-valid-token"})
    assert response.status_code == 401
