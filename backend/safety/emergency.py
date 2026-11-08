import re
from typing import Optional, List, Dict
from pydantic import BaseModel, Field

class HelplineInfo(BaseModel):
    name: str
    number: str
    description: str

class EmergencyDetectionResult(BaseModel):
    is_emergency: bool = Field(..., description="Whether a medical emergency was detected")
    category: Optional[str] = Field(None, description="The category of emergency detected")
    matched_triggers: List[str] = Field(default_factory=list, description="Keywords or phrases that triggered emergency mode")
    urgent_guidance: Optional[str] = Field(None, description="Pre-scripted emergency response and safety directions")
    helplines: List[HelplineInfo] = Field(default_factory=list, description="Relevant emergency phone numbers")
    note: str = Field(default="Outside India? Dial your local emergency number.", description="Guidance for users outside India")

# Primary emergency helpline: 112 (India)
STANDARD_EMERGENCY_HELPLINES = [
    HelplineInfo(
        name="National Emergency Helpline (India)",
        number="112",
        description="All Emergencies: Ambulance, Police, Fire"
    )
]

# Rule-based compiled regex definitions (word boundaries ensure no partial false positives)
EMERGENCY_RULES: Dict[str, Dict] = {
    "CARDIAC": {
        "patterns": [
            r"\bchest\s+(?:pain|pressure|tightness|heaviness|crushing|squeezing)\b",
            r"\bpain\s+(?:in\s+my\s+chest|radiating\s+to\s+(?:my\s+)?(?:left\s+arm|arm|jaw|neck|back))\b",
            r"\bheart\s+attack\b",
            r"\bcardiac\s+arrest\b",
            r"\bmy\s+heart\s+feels\s+like\s+it\s+stopped\b",
        ],
        "message": (
            "CRITICAL HEALTH ALERT: Your symptoms may indicate a cardiac emergency (such as a heart attack). "
            "Please stop what you are doing, sit or lie down comfortably, and CALL 112 IMMEDIATELY. "
            "ANAHITHA is an AI companion and CANNOT contact emergency services or dispatch help for you."
        ),
    },
    "RESPIRATORY": {
        "patterns": [
            r"\b(?:can't|cannot|unable\s+to)\s+breathe\b",
            r"\b(?:gasping|struggling)\s+for\s+(?:air|breath)\b",
            r"\bsevere\s+(?:shortness\s+of\s+breath|breathlessness|trouble\s+breathing)\b",
            r"\b(?:choking|suffocating)\b",
            r"\blips\s+(?:are\s+)?turning\s+blue\b",
        ],
        "message": (
            "CRITICAL HEALTH ALERT: Severe difficulty breathing is a medical emergency. "
            "Please sit upright to keep your airway open and CALL 112 IMMEDIATELY. "
            "ANAHITHA is an AI companion and CANNOT contact emergency services or dispatch help for you."
        ),
    },
    "STROKE": {
        "patterns": [
            r"\b(?:face|facial)\s+(?:is\s+)?(?:drooping|droop|numb)\b",
            r"\b(?:slurred|slurring)\s+speech\b",
            r"\b(?:cannot|can't)\s+(?:move|lift)\s+(?:my\s+)?(?:arm|leg|one\s+side)\b",
            r"\bsudden\s+(?:loss\s+of\s+balance|paralysis|vision\s+loss|blindness)\b",
            r"\bstroke\s+symptoms?\b",
            r"\bhaving\s+a\s+stroke\b",
        ],
        "message": (
            "CRITICAL HEALTH ALERT: You may be describing signs of a stroke (FAST: Face drooping, Arm weakness, Speech slurring). "
            "Every minute counts. CALL 112 IMMEDIATELY. "
            "ANAHITHA is an AI tool and CANNOT contact emergency services or dispatch help for you."
        ),
    },
    "ANAPHYLAXIS": {
        "patterns": [
            r"\bthroat\s+(?:is\s+)?(?:closing|closing\s+up|swelling|tightening)\b",
            r"\bsevere\s+allergic\s+reaction\b",
            r"\banaphylaxis\b",
            r"\banaphylactic\s+shock\b",
            r"\btongue\s+(?:is\s+)?swelling\b",
            r"\bneed\s+(?:my\s+)?(?:epipen|epi-pen|epinephrine)\b",
        ],
        "message": (
            "CRITICAL HEALTH ALERT: A severe allergic reaction (anaphylaxis) requires immediate life-saving care. "
            "If an epinephrine autoinjector (EpiPen) is available, use it right away as prescribed, and CALL 112 IMMEDIATELY. "
            "ANAHITHA is an AI companion and CANNOT contact emergency services or dispatch help for you."
        ),
    },
    "SELF_HARM": {
        "patterns": [
            r"\b(?:want|plan|going)\s+to\s+(?:kill|end)\s+myself\b",
            r"\b(?:want|going)\s+to\s+end\s+my\s+life\b",
            r"\bcommit\s+suicide\b",
            r"\bsuicidal\s+(?:thoughts|ideation|plan)\b",
            r"\bwant\s+to\s+die\b",
            r"\b(?:cutting|harming)\s+myself\b",
            r"\bbetter\s+off\s+dead\b",
        ],
        "message": (
            "You are not alone, and help is available right now. If you are in immediate danger of hurting yourself, "
            "please CALL 112 IMMEDIATELY or reach out to a trusted person or local crisis helpline. "
            "ANAHITHA cares deeply about your safety, but is an AI companion and cannot contact emergency services or dispatch help for you."
        ),
    },
    "POISON_OVERDOSE": {
        "patterns": [
            r"\b(?:swallowed|drank)\s+(?:bleach|poison|chemicals|antifreeze|drain\s+cleaner)\b",
            r"\boverdose[ds]?\b",
            r"\btook\s+too\s+many\s+(?:pills|tablets|medications|drugs)\b",
            r"\bpoisoning\b",
        ],
        "message": (
            "CRITICAL HEALTH ALERT: Suspected poisoning or medication overdose requires immediate professional intervention. "
            "CALL 112 IMMEDIATELY. Do not induce vomiting unless advised by a medical professional. "
            "ANAHITHA CANNOT contact emergency services or dispatch help for you."
        ),
    },
    "SEVERE_TRAUMA": {
        "patterns": [
            r"\bsevere\s+(?:bleeding|hemorrhage)\b",
            r"\b(?:gushing|squirting|uncontrolled)\s+blood\b",
            r"\bstabbed|shot|gunshot\b",
            r"\bunconscious\s+and\s+not\s+(?:waking|responding)\b",
        ],
        "message": (
            "CRITICAL HEALTH ALERT: Uncontrolled bleeding, severe trauma, or unconsciousness requires urgent medical care. "
            "Apply firm, direct pressure with a clean cloth to bleeding wounds and CALL 112 IMMEDIATELY. "
            "ANAHITHA CANNOT contact emergency services or dispatch help for you."
        ),
    },
}

OUTSIDE_INDIA_NOTE = "Outside India? Dial your local emergency number."

def detect_emergency(text: str) -> EmergencyDetectionResult:
    """
    Deterministic rule-based emergency screener.
    Must always run BEFORE any AI call or model inference.
    """
    if not text or not text.strip():
        return EmergencyDetectionResult(
            is_emergency=False,
            category=None,
            matched_triggers=[],
            urgent_guidance=None,
            helplines=[],
            note=OUTSIDE_INDIA_NOTE,
        )

    normalized_text = text.strip().lower()

    for category, config in EMERGENCY_RULES.items():
        matched: List[str] = []
        for pattern in config["patterns"]:
            match = re.search(pattern, normalized_text, flags=re.IGNORECASE)
            if match:
                matched.append(match.group(0))

        if matched:
            return EmergencyDetectionResult(
                is_emergency=True,
                category=category,
                matched_triggers=matched,
                urgent_guidance=config["message"],
                helplines=STANDARD_EMERGENCY_HELPLINES,
                note=OUTSIDE_INDIA_NOTE,
            )

    return EmergencyDetectionResult(
        is_emergency=False,
        category=None,
        matched_triggers=[],
        urgent_guidance=None,
        helplines=[],
        note=OUTSIDE_INDIA_NOTE,
    )
