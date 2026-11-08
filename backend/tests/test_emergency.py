import pytest
from app.healthcare.emergency import (
    detect_emergency,
    CRISIS_CARING_MESSAGE,
    EMERGENCY_SERIOUS_GUIDANCE,
)

# --- Positive Emergency Tests ---

def test_cardiac_emergency():
    query = "I am having severe crushing chest pain and it radiates to my left arm"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category == "CARDIAC"
    assert len(result.matched_triggers) > 0
    # No condition names in guidance message
    assert "These symptoms can be a sign of a serious emergency. Call 112 now." in result.urgent_guidance
    assert "ANAHITHA cannot contact emergency services" in result.urgent_guidance
    assert "heart attack" not in result.urgent_guidance
    assert "cardiac emergency" not in result.urgent_guidance
    assert result.helpline == "112"
    assert result.note == "Outside India? Dial your local emergency number."

def test_respiratory_emergency():
    query = "Help me, I cannot breathe and my lips are turning blue"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category == "RESPIRATORY"
    assert "These symptoms can be a sign of a serious emergency. Call 112 now." in result.urgent_guidance

def test_stroke_emergency():
    query = "My father's face is drooping and he has slurred speech"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category == "STROKE"
    assert "These symptoms can be a sign of a serious emergency. Call 112 now." in result.urgent_guidance
    assert "stroke" not in result.urgent_guidance.lower()

def test_self_harm_emergency():
    query = "I feel hopeless and I want to end my life"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category == "CRISIS_SELF_HARM"
    assert result.urgent_guidance == CRISIS_CARING_MESSAGE
    assert result.urgent_guidance.startswith("I'm really sorry you're going through this")
    assert result.urgent_guidance.endswith("Please contact your local emergency number (112 in India) or a trusted person right now.")

def test_poison_overdose_emergency():
    query = "A toddler drank bleach from under the sink"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category == "POISONING"
    assert "These symptoms can be a sign of a serious emergency. Call 112 now." in result.urgent_guidance

def test_trauma_emergency():
    query = "There is an accident with severe bleeding and he is unconscious and not waking"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category in ("SEVERE_BLEEDING", "UNCONSCIOUSNESS")
    assert "These symptoms can be a sign of a serious emergency. Call 112 now." in result.urgent_guidance

# --- Negative Tests (Benign / Everyday Queries) ---

def test_benign_general_greeting():
    query = "Good morning Dr. Anahitha, how are you today?"
    result = detect_emergency(query)
    assert result.is_emergency is False
    assert result.category is None
    assert len(result.matched_triggers) == 0
    assert result.urgent_guidance is None

def test_benign_hydration_question():
    query = "How much water should I drink on a hot afternoon?"
    result = detect_emergency(query)
    assert result.is_emergency is False

def test_benign_cold_symptoms():
    query = "I have a mild runny nose and slightly scratchy throat since yesterday"
    result = detect_emergency(query)
    assert result.is_emergency is False

def test_benign_ergonomics_headache():
    query = "I get a dull headache when looking at my computer for 6 hours"
    result = detect_emergency(query)
    assert result.is_emergency is False

def test_empty_string():
    result = detect_emergency("")
    assert result.is_emergency is False
    assert result.category is None

def test_whitespace_only():
    result = detect_emergency("    \n   ")
    assert result.is_emergency is False

# --- Boundary & False Positive Tests ---

def test_word_boundaries_chestnut():
    query = "I roasted some sweet chestnuts for dinner"
    result = detect_emergency(query)
    assert result.is_emergency is False

def test_word_boundaries_breathtaking():
    query = "The mountain view is truly breathtaking"
    result = detect_emergency(query)
    assert result.is_emergency is False

def test_case_insensitivity():
    query = "HELP! I HAVE CHEST PAIN AND CANNOT BREATHE!"
    result = detect_emergency(query)
    assert result.is_emergency is True
    assert result.category in ("CARDIAC", "RESPIRATORY")
