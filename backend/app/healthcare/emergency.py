import re
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

CRISIS_CARING_MESSAGE = (
    "I'm really sorry you're going through this, and I'm glad you told me. You don't have to face it alone. "
    "Please contact your local emergency number (112 in India) or a trusted person right now."
)

EMERGENCY_SERIOUS_GUIDANCE = (
    "These symptoms can be a sign of a serious emergency. Call 112 now. "
    "ANAHITHA cannot contact emergency services or dispatch help for you."
)

class EmergencyCheckResult(BaseModel):
    is_emergency: bool = Field(..., description="Whether a medical emergency or crisis was detected")
    category: Optional[str] = Field(None, description="Category of emergency or crisis")
    matched_triggers: List[str] = Field(default_factory=list, description="Keywords or phrases that triggered detection")
    urgent_guidance: Optional[str] = Field(None, description="Guidance to display immediately")
    helpline: str = Field(default="112", description="Primary emergency helpline (India)")
    note: str = Field(default="Outside India? Dial your local emergency number.", description="Guidance for international users")

# Non-medical idioms or compound phrases to suppress ONLY when NO personal symptom is present
NON_MEDICAL_SUPPRESSIONS = [
    (re.compile(r"\bunconscious\s+bias\b", re.IGNORECASE), "unconscious bias"),
    (re.compile(r"\bbreathtaking\b", re.IGNORECASE), "breathtaking"),
    (re.compile(r"\bchestnuts?\b", re.IGNORECASE), "chestnut"),
]

# First-person or acute personal symptom indicators that OVERRIDE any suppression
FIRST_PERSON_INDICATORS = [
    re.compile(r"\b(?:i\s+have|i'?m\s+having|im\s+having|i\s+feel|i\s+am|i\s+can'?t|i\s+cant)\b", re.IGNORECASE),
    re.compile(r"\b(?:my\s+(?:chest|heart|arm|head|breathing|father|mother|dad|mom|friend|brother|sister|son|daughter|partner|wife|husband))\b", re.IGNORECASE),
    re.compile(r"\b(?:now\s+my|hurts?|hurting|pain)\b", re.IGNORECASE),
]

# Separate Crisis Category for Self-Harm or Suicidal Wording
CRISIS_PATTERNS = [
    re.compile(r"\b(?:kill|end)\s+(?:myself|my\s+life)\b", re.IGNORECASE),
    re.compile(r"\b(?:want|planning|going)\s+to\s+(?:die|kill\s+myself|end\s+it\s+all)\b", re.IGNORECASE),
    re.compile(r"\bcommit\s+suicide\b", re.IGNORECASE),
    re.compile(r"\bsuicid(?:e|al)\b", re.IGNORECASE),
    re.compile(r"\b(?:harm|harming|hurt|hurting|cut|cutting)\s+myself\b", re.IGNORECASE),
    re.compile(r"\bbetter\s+off\s+dead\b", re.IGNORECASE),
]

# Critical medical conditions matching frontend rules (NO condition names in response messages)
EMERGENCY_RULES: Dict[str, Dict] = {
    "RESPIRATORY": {
        "patterns": [
            re.compile(r"\bnot\s+breath(?:ing|in|ng|ign)\b", re.IGNORECASE),
            re.compile(r"\b(?:can'?t|cannot|cant|unable\s+to|trouble|struggling\s+to)\s+breath[es]?\b", re.IGNORECASE),
            re.compile(r"\b(?:gasping|struggling)\s+for\s+(?:air|breath)\b", re.IGNORECASE),
            re.compile(r"\b(?:short\s+of\s+breath|shortness\s+of\s+breath)\b", re.IGNORECASE),
            re.compile(r"\b(?:choking|suffocating)\b", re.IGNORECASE),
            re.compile(r"\blips\s+(?:are\s+)?turning\s+blue\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
    "CARDIAC": {
        "patterns": [
            re.compile(r"\b(?:heart\s*attack|hart\s*attack|heartattack|heart\s*attak|hartattack)\b", re.IGNORECASE),
            re.compile(r"\bchest\s*(?:pain|paine|pressure|tightness|heaviness|crushing|squeezing)\b", re.IGNORECASE),
            re.compile(r"\bchestpain\b", re.IGNORECASE),
            re.compile(r"\b(?:chest\s+hurts?|pain\s+in\s+(?:my\s+)?chest)\b", re.IGNORECASE),
            re.compile(r"\bpain\s+radiating\s+to\s+(?:my\s+)?(?:left\s+arm|arm|jaw|neck)\b", re.IGNORECASE),
            re.compile(r"\bcardiac\s+arrest\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
    "UNCONSCIOUSNESS": {
        "patterns": [
            re.compile(r"\b(?:collapsed|colapsed|collapsing|colapsing)\b", re.IGNORECASE),
            re.compile(r"\b(?:unresponsive|unresponsiv|nonresponsive|not\s+responsive|un-responsive)\b", re.IGNORECASE),
            re.compile(r"\b(?:is\s+)?unconscious\b", re.IGNORECASE),
            re.compile(r"\b(?:passed\s+out|fainted\s+and\s+not\s+waking)\b", re.IGNORECASE),
            re.compile(r"\bnot\s+waking\s+up\b", re.IGNORECASE),
            re.compile(r"\bloss\s+of\s+consciousness\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
    "SEVERE_BLEEDING": {
        "patterns": [
            re.compile(r"\bbleeding\s+(?:won'?t|wont|does\s+not|doesnt)\s+stop[e]?\b", re.IGNORECASE),
            re.compile(r"\b(?:won'?t|wont)\s+stop\s+bleeding\b", re.IGNORECASE),
            re.compile(r"\b(?:heavy|severe|uncontrolled|gushing)\s+bleed(?:ing)?\b", re.IGNORECASE),
            re.compile(r"\bbleeding\s+heavily\b", re.IGNORECASE),
            re.compile(r"\bhemorrhag(?:e|ing)\b", re.IGNORECASE),
            re.compile(r"\blosing\s+a\s+lot\s+of\s+blood\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
    "STROKE": {
        "patterns": [
            re.compile(r"\b(?:face|facial)\s+(?:is\s+)?(?:drooping|droping|droop|numb)\b", re.IGNORECASE),
            re.compile(r"\b(?:slurred|slurring)\s+speech\b", re.IGNORECASE),
            re.compile(r"\b(?:having\s+a\s+)?stroke\b", re.IGNORECASE),
            re.compile(r"\bsudden\s+numbness\s+on\s+one\s+side\b", re.IGNORECASE),
            re.compile(r"\b(?:cannot|can't)\s+(?:move|lift)\s+(?:my\s+)?(?:arm|leg)\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
    "POISONING": {
        "patterns": [
            re.compile(r"\b(?:swallowed|swalowed|drank)\s+(?:poison|posion|poisen|bleach|chemicals|antifreeze)\b", re.IGNORECASE),
            re.compile(r"\b(?:overdose|over\s*dose|overdosed|overdoze|overdosing|over\s*dosing)\b", re.IGNORECASE),
            re.compile(r"\btook\s+too\s+many\s+(?:pills|medications|tablets)\b", re.IGNORECASE),
            re.compile(r"\bpoisoning\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
    "SEIZURE": {
        "patterns": [
            re.compile(r"\b(?:seizure|seizur|seisure|ceizure|sezure)\b", re.IGNORECASE),
            re.compile(r"\bhaving\s+(?:a\s+)?(?:seizure|seizures|fit|convulsion[s]?)\b", re.IGNORECASE),
            re.compile(r"\bconvulsion[s]?\b", re.IGNORECASE),
        ],
        "guidance": EMERGENCY_SERIOUS_GUIDANCE,
    },
}

def detect_emergency(text: str) -> EmergencyCheckResult:
    """
    Python rule-based detector mirroring frontend safety rules.
    Safety bias: when in doubt, trigger.
    Never names a condition in the emergency message.
    Must always run BEFORE any Gemini API call.
    """
    if not text or not text.strip():
        return EmergencyCheckResult(is_emergency=False)

    clean_text = text.strip()

    # Check for first-person symptom cues
    has_first_person_symptom = any(pattern.search(clean_text) for pattern in FIRST_PERSON_INDICATORS)

    # 1. Non-medical idiom suppression ONLY when NO first-person symptom is present
    if not has_first_person_symptom:
        for pattern, term in NON_MEDICAL_SUPPRESSIONS:
            if pattern.search(clean_text):
                text_without_idiom = pattern.sub(" ", clean_text)
                has_other = any(
                    any(p.search(text_without_idiom) for p in group["patterns"])
                    for group in EMERGENCY_RULES.values()
                )
                if not has_other:
                    return EmergencyCheckResult(
                        is_emergency=False,
                        category=None,
                        matched_triggers=[],
                        urgent_guidance=None,
                    )

    # 2. Separate Crisis Category for Self-Harm or Suicidal Wording
    for pattern in CRISIS_PATTERNS:
        match = pattern.search(clean_text)
        if match:
            return EmergencyCheckResult(
                is_emergency=True,
                category="CRISIS_SELF_HARM",
                matched_triggers=[match.group(0)],
                urgent_guidance=CRISIS_CARING_MESSAGE,
            )

    # 3. Medical Emergency Categories (No condition names used)
    for category, config in EMERGENCY_RULES.items():
        matched = []
        for pattern in config["patterns"]:
            match = pattern.search(clean_text)
            if match:
                matched.append(match.group(0))

        if matched:
            return EmergencyCheckResult(
                is_emergency=True,
                category=category,
                matched_triggers=matched,
                urgent_guidance=config["guidance"],
            )

    return EmergencyCheckResult(
        is_emergency=False,
        category=None,
        matched_triggers=[],
        urgent_guidance=None,
    )
