from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient
from main import app
from app.limiter import rate_limiter

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_limiter_state():
    """Reset the rate limiter before each test to ensure test isolation."""
    rate_limiter.reset()

# --- 1. Emergency Screening via POST /api/chat (Mocking Gemini to guarantee it is NEVER called) ---

@patch("main.generate_companion_reply")
def test_chat_mandatory_heart_attack_narrative_override(mock_gemini):
    """
    Safety bias: 'I read about heart attacks and now my chest hurts'
    Must trigger immediately as an emergency and NEVER call Gemini.
    """
    response = client.post(
        "/api/chat",
        json={"message": "I read about heart attacks and now my chest hurts", "mode": "symptoms"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is True
    assert data["category"] == "CARDIAC"
    assert "These symptoms can be a sign of a serious emergency. Call 112 now." in data["reply"]
    assert "heart attack" not in data["reply"]
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_mandatory_unresponsive_trigger(mock_gemini):
    """
    Must trigger on 'my father is unresponsive' and NEVER call Gemini.
    """
    response = client.post(
        "/api/chat",
        json={"message": "my father is unresponsive", "mode": "chat"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is True
    assert data["category"] == "UNCONSCIOUSNESS"
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_respiratory_emergency_and_misspellings(mock_gemini):
    for phrase in ["he is not breathing", "help cant breath", "baby is not breathin"]:
        response = client.post("/api/chat", json={"message": phrase, "mode": "chat"})
        assert response.status_code == 200
        data = response.json()
        assert data["emergency"] is True
        assert data["category"] == "RESPIRATORY"
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_cardiac_misspellings(mock_gemini):
    for phrase in ["hart attack", "chestpain", "sharp chest paine"]:
        response = client.post("/api/chat", json={"message": phrase, "mode": "chat"})
        assert response.status_code == 200
        data = response.json()
        assert data["emergency"] is True
        assert data["category"] == "CARDIAC"
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_collapsed_and_bleeding_emergency(mock_gemini):
    for phrase in ["runner just collapsed", "the bleeding won't stop", "bleeding wont stope"]:
        response = client.post("/api/chat", json={"message": phrase, "mode": "chat"})
        assert response.status_code == 200
        data = response.json()
        assert data["emergency"] is True
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_poison_and_overdose_emergency(mock_gemini):
    for phrase in ["accidental overdoze", "toddler swallowed poison", "swallowed posion"]:
        response = client.post("/api/chat", json={"message": phrase, "mode": "chat"})
        assert response.status_code == 200
        data = response.json()
        assert data["emergency"] is True
        assert data["category"] == "POISONING"
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_seizure_and_stroke_emergency(mock_gemini):
    for phrase in ["she is having a seizure", "brother having ceizure", "notice sudden face drooping"]:
        response = client.post("/api/chat", json={"message": phrase, "mode": "chat"})
        assert response.status_code == 200
        data = response.json()
        assert data["emergency"] is True
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_anaphylaxis_emergency(mock_gemini):
    response = client.post(
        "/api/chat",
        json={"message": "I accidentally ate peanuts and my throat is closing up", "mode": "chat"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is True
    assert data["category"] == "ANAPHYLAXIS"
    mock_gemini.assert_not_called()

@patch("main.generate_companion_reply")
def test_chat_crisis_self_harm_category(mock_gemini):
    """
    Self-harm or suicidal wording must return the exact caring message with 112
    and NEVER invent helpline numbers or call Gemini.
    """
    response = client.post(
        "/api/chat",
        json={"message": "I feel completely hopeless and I want to die", "mode": "chat"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is True
    assert data["category"] == "CRISIS_SELF_HARM"
    assert data["reply"].startswith("I'm really sorry you're going through this, and I'm glad you told me. You don't have to face it alone.")
    assert data["reply"].endswith("Please contact your local emergency number (112 in India) or a trusted person right now.")
    mock_gemini.assert_not_called()

# --- 2. Suppression & Successful Non-Emergency Chat with Mocked Gemini ---

@patch("app.chat_service.genai.Client")
def test_chat_non_medical_suppression_and_mocked_gemini_success(mock_client_class):
    """
    Non-medical idiom ('unconscious bias') with no personal symptom does NOT trigger emergency,
    and calls the mocked Gemini client.
    """
    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance
    mock_response = MagicMock()
    mock_response.text = "Hello! I am Dr. Anahitha. How can I assist with your general wellness today?"
    mock_client_instance.models.generate_content.return_value = mock_response

    response = client.post(
        "/api/chat",
        json={"message": "We had a workplace seminar on unconscious bias", "mode": "info"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is False
    assert "Dr. Anahitha" in data["reply"]
    assert data["error"] is None

# --- 3. Gemini Failure Path (Mocked Exception / Quota Exhaustion) ---

@patch("app.chat_service.genai.Client")
def test_chat_gemini_failure_graceful_recovery(mock_client_class):
    """
    If Gemini throws an exception (e.g. RateLimitError, QuotaExhausted, NetworkError),
    the endpoint must return a friendly error and NEVER crash (returns HTTP 200 with error details).
    """
    mock_client_instance = MagicMock()
    mock_client_class.return_value = mock_client_instance
    mock_client_instance.models.generate_content.side_effect = Exception("ResourceExhausted: Quota exceeded")

    response = client.post(
        "/api/chat",
        json={"message": "What are some tips to sleep better?", "mode": "wellness"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is False
    assert "Dr. Anahitha is temporarily unable to connect" in data["reply"]
    assert "AI generation error" in data["error"]

@patch("app.chat_service.genai.Client")
def test_chat_gemini_fallback_flow(mock_client_class):
    """
    If primary model throws 503/504, it invokes fallback model and returns its response.
    """
    primary_client = MagicMock()
    fallback_client = MagicMock()
    primary_client.models.generate_content.side_effect = Exception("503 UNAVAILABLE: high demand")
    fb_response = MagicMock()
    fb_response.text = "Here are some tips to sleep better from the fallback companion."
    fallback_client.models.generate_content.return_value = fb_response

    mock_client_class.side_effect = [primary_client, fallback_client]

    response = client.post(
        "/api/chat",
        json={"message": "What are some tips to sleep better?", "mode": "wellness"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["emergency"] is False
    assert "Here are some tips to sleep better from the fallback companion." in data["reply"]
    assert data["error"] is None

# --- 4. Rate Limiting Tests (20 requests per minute per IP) ---

@patch("main.generate_companion_reply")
def test_rate_limiting_enforcement(mock_gemini):
    mock_gemini.return_value = ("Sample response", None)
    test_headers = {"x-forwarded-for": "203.0.113.195"}

    # First 20 requests succeed
    for i in range(20):
        resp = client.post(
            "/api/chat",
            json={"message": f"Hello {i}", "mode": "chat"},
            headers=test_headers,
        )
        assert resp.status_code == 200

    # 21st request from same IP is rate limited
    resp_limit = client.post(
        "/api/chat",
        json={"message": "Hello 21", "mode": "chat"},
        headers=test_headers,
    )
    assert resp_limit.status_code == 429
    assert "Rate limit exceeded" in resp_limit.json()["detail"]

    # Different IP is not blocked
    resp_other_ip = client.post(
        "/api/chat",
        json={"message": "Hello from another IP", "mode": "chat"},
        headers={"x-forwarded-for": "198.51.100.42"},
    )
    assert resp_other_ip.status_code == 200

# --- 5. Pydantic Validation Tests ---

def test_pydantic_validation_message_too_long():
    """Messages over 1000 characters must be rejected with HTTP 422."""
    long_message = "a" * 1001
    response = client.post("/api/chat", json={"message": long_message, "mode": "chat"})
    assert response.status_code == 422

def test_pydantic_validation_invalid_mode():
    """Invalid mode values must be rejected with HTTP 422."""
    response = client.post("/api/chat", json={"message": "Hello", "mode": "unsupported_mode"})
    assert response.status_code == 422

