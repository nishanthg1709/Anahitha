// Rule-based keyword emergency screener (zero AI).
// Safety bias: when in doubt, trigger.

export const CRISIS_CARING_MESSAGE =
  'Please contact your local emergency number (112 in India) or a trusted person right now.'

// Non-medical compound terms or idioms to suppress ONLY when no personal symptom is present
const NON_MEDICAL_SUPPRESSIONS = [
  { pattern: /\bunconscious\s+bias\b/i, term: 'unconscious bias' },
  { pattern: /\bbreathtaking\b/i, term: 'breathtaking' },
  { pattern: /\bchestnuts?\b/i, term: 'chestnut' },
]

// First-person or acute personal symptom indicators
const FIRST_PERSON_INDICATORS = [
  /\b(?:i\s+have|i'?m\s+having|im\s+having|i\s+feel|i\s+am|i\s+can'?t|i\s+cant)\b/i,
  /\b(?:my\s+(?:chest|heart|arm|head|breathing|father|mother|dad|mom|friend|brother|sister|son|daughter|partner|wife|husband))\b/i,
  /\b(?:now\s+my|hurts?|hurting|pain)\b/i,
]

// Separate Crisis Category for Self-Harm or Suicidal Wording
const CRISIS_PATTERNS = [
  /\b(?:kill|end)\s+(?:myself|my\s+life)\b/i,
  /\b(?:want|planning|going)\s+to\s+(?:die|kill\s+myself|end\s+it\s+all)\b/i,
  /\bcommit\s+suicide\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\b(?:harm|harming|hurt|hurting|cut|cutting)\s+myself\b/i,
  /\bbetter\s+off\s+dead\b/i,
]

// Critical medical conditions with misspellings and casual variants
const EMERGENCY_CATEGORIES = [
  {
    category: 'RESPIRATORY',
    terms: [
      /\bnot\s+breath(?:ing|in|ng|ign)\b/i,
      /\b(?:can'?t|cannot|cant|unable\s+to|trouble|struggling\s+to)\s+breath[es]?\b/i,
      /\b(?:gasping|struggling)\s+for\s+(?:air|breath)\b/i,
      /\b(?:short\s+of\s+breath|shortness\s+of\s+breath)\b/i,
      /\b(?:choking|suffocating)\b/i,
      /\blips\s+(?:are\s+)?turning\s+blue\b/i,
    ],
    reason: 'Possible acute airway or respiratory distress',
  },
  {
    category: 'CARDIAC',
    terms: [
      /\b(?:heart\s*attack|hart\s*attack|heartattack|heart\s*attak|hartattack)\b/i,
      /\bchest\s*(?:pain|paine|pressure|tightness|heaviness|crushing|squeezing)\b/i,
      /\bchestpain\b/i,
      /\b(?:chest\s+hurts?|pain\s+in\s+(?:my\s+)?chest)\b/i,
      /\bpain\s+radiating\s+to\s+(?:my\s+)?(?:left\s+arm|arm|jaw)\b/i,
      /\bcardiac\s+arrest\b/i,
    ],
    reason: 'Possible cardiac distress or heart event',
  },
  {
    category: 'UNCONSCIOUSNESS',
    terms: [
      /\b(?:collapsed|colapsed|collapsing|colapsing)\b/i,
      /\b(?:unresponsive|unresponsiv|nonresponsive|not\s+responsive|un-responsive)\b/i,
      /\b(?:is\s+)?unconscious\b/i,
      /\b(?:passed\s+out|fainted\s+and\s+not\s+waking)\b/i,
      /\bnot\s+waking\s+up\b/i,
      /\bloss\s+of\s+consciousness\b/i,
    ],
    reason: 'Possible loss of consciousness or unresponsiveness',
  },
  {
    category: 'SEVERE_BLEEDING',
    terms: [
      /\bbleeding\s+(?:won'?t|wont|does\s+not|doesnt)\s+stop[e]?\b/i,
      /\b(?:won'?t|wont)\s+stop\s+bleeding\b/i,
      /\b(?:heavy|severe|uncontrolled|gushing)\s+bleed(?:ing)?\b/i,
      /\bbleeding\s+heavily\b/i,
      /\bhemorrhag(?:e|ing)\b/i,
      /\blosing\s+a\s+lot\s+of\s+blood\b/i,
    ],
    reason: 'Possible heavy, uncontrolled hemorrhage',
  },
  {
    category: 'STROKE',
    terms: [
      /\b(?:face|facial)\s+(?:is\s+)?(?:drooping|droping|droop|numb)\b/i,
      /\b(?:slurred|slurring)\s+speech\b/i,
      /\b(?:having\s+a\s+)?stroke\b/i,
      /\bsudden\s+numbness\s+on\s+one\s+side\b/i,
    ],
    reason: 'Possible stroke warning signs',
  },
  {
    category: 'POISONING',
    terms: [
      /\b(?:swallowed|swalowed|drank)\s+(?:poison|posion|poisen|bleach|chemicals|antifreeze)\b/i,
      /\b(?:overdose|over\s*dose|overdosed|overdoze|overdosing|over\s*dosing)\b/i,
      /\btook\s+too\s+many\s+(?:pills|medications|tablets)\b/i,
      /\bpoisoning\b/i,
    ],
    reason: 'Suspected acute poisoning or overdose',
  },
  {
    category: 'SEIZURE',
    terms: [
      /\b(?:seizure|seizur|seisure|ceizure|sezure)\b/i,
      /\bhaving\s+(?:a\s+)?(?:seizure|seizures|fit|convulsion[s]?)\b/i,
      /\bconvulsion[s]?\b/i,
    ],
    reason: 'Active seizure or convulsion',
  },
]

/**
 * Checks text for acute emergency keywords, casual phrasing, and crisis terms.
 * Enforces a safety bias: when in doubt, trigger.
 *
 * @param {string} text - User message or input
 * @returns {{ isEmergency: boolean, category: string | null, matchedTerm: string | null, reason: string | null, guidanceMessage: string | null }}
 */
export function detectEmergency(text) {
  if (!text || typeof text !== 'string') {
    return {
      isEmergency: false,
      category: null,
      matchedTerm: null,
      reason: null,
      guidanceMessage: null,
    }
  }

  const cleanText = text.trim()
  if (!cleanText) {
    return {
      isEmergency: false,
      category: null,
      matchedTerm: null,
      reason: null,
      guidanceMessage: null,
    }
  }

  const hasFirstPersonSymptom = FIRST_PERSON_INDICATORS.some((pattern) =>
    pattern.test(cleanText)
  )

  // 1. Non-medical compound word suppression ONLY if NO personal symptom indicator exists
  if (!hasFirstPersonSymptom) {
    for (const item of NON_MEDICAL_SUPPRESSIONS) {
      if (item.pattern.test(cleanText)) {
        // If query is specifically about the non-medical term (e.g. "unconscious bias seminar")
        // and doesn't contain a physical crisis keyword outside that term, suppress.
        const textWithoutIdiom = cleanText.replace(item.pattern, ' ')
        // Check if anything else in the text would trigger an emergency
        const hasOtherEmergency = EMERGENCY_CATEGORIES.some((group) =>
          group.terms.some((term) => term.test(textWithoutIdiom))
        )
        if (!hasOtherEmergency) {
          return {
            isEmergency: false,
            category: null,
            matchedTerm: null,
            reason: `Non-medical term suppressed: ${item.term}`,
            guidanceMessage: null,
          }
        }
      }
    }
  }

  // 2. Separate Crisis Category for Self-Harm or Suicidal Wording
  for (const pattern of CRISIS_PATTERNS) {
    const match = cleanText.match(pattern)
    if (match) {
      return {
        isEmergency: true,
        category: 'CRISIS_SELF_HARM',
        matchedTerm: match[0],
        reason: 'Immediate emotional distress or self-harm concern',
        guidanceMessage: CRISIS_CARING_MESSAGE,
      }
    }
  }

  // 3. Physical Emergency Categories
  for (const group of EMERGENCY_CATEGORIES) {
    for (const pattern of group.terms) {
      const match = cleanText.match(pattern)
      if (match) {
        return {
          isEmergency: true,
          category: group.category,
          matchedTerm: match[0],
          reason: group.reason,
          guidanceMessage:
            'Critical health concern detected. Please call 112 (or your local emergency number) immediately.',
        }
      }
    }
  }

  return {
    isEmergency: false,
    category: null,
    matchedTerm: null,
    reason: null,
    guidanceMessage: null,
  }
}
