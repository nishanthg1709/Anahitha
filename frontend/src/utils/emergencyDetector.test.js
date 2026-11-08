import { describe, it, expect } from 'vitest'
import { detectEmergency, CRISIS_CARING_MESSAGE } from './emergencyDetector'

describe('emergencyDetector (Safety-Biased Rule-Based Screener)', () => {
  // 1. Mandatory Specific Triggers Requested
  describe('Mandatory Safety Bias Trigger Cases', () => {
    it('triggers on "I read about heart attacks and now my chest hurts" (Safety bias: personal symptom overrides narrative)', () => {
      const res = detectEmergency('I read about heart attacks and now my chest hurts')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CARDIAC')
      expect(res.guidanceMessage).toBe('These symptoms can be a sign of a serious emergency. Call 112 now. ANAHITHA cannot contact emergency services or dispatch help for you.')
      expect(res.guidanceMessage).not.toContain('heart attack')
    })

    it('triggers on "my father is unresponsive"', () => {
      const res = detectEmergency('my father is unresponsive')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('UNCONSCIOUSNESS')
    })
  })

  // 2. All 9 Required New Phrases & Exact Triggers
  describe('Required Emergency Phrases & Misspellings', () => {
    // 1) "not breathing"
    it('detects "not breathing"', () => {
      const res = detectEmergency('He is not breathing please help')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('RESPIRATORY')
    })
    it('detects misspelling "not breathin"', () => {
      const res = detectEmergency('baby is not breathin')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('RESPIRATORY')
    })
    it('detects misspelling "not breathng"', () => {
      const res = detectEmergency('person not breathng on floor')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('RESPIRATORY')
    })

    // 2) "heart attack"
    it('detects "heart attack"', () => {
      const res = detectEmergency('I think I am having a heart attack')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CARDIAC')
    })
    it('detects misspelling "hart attack"', () => {
      const res = detectEmergency('my uncle is having a hart attack')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CARDIAC')
    })
    it('detects misspelling "heartattack" (no space)', () => {
      const res = detectEmergency('help heartattack happening')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CARDIAC')
    })

    // 3) "collapsed"
    it('detects "collapsed"', () => {
      const res = detectEmergency('A runner just collapsed on the sidewalk')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('UNCONSCIOUSNESS')
    })
    it('detects misspelling "colapsed"', () => {
      const res = detectEmergency('someone colapsed in the hall')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('UNCONSCIOUSNESS')
    })

    // 4) "unresponsive"
    it('detects "unresponsive"', () => {
      const res = detectEmergency('The patient is completely unresponsive')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('UNCONSCIOUSNESS')
    })
    it('detects misspelling "unresponsiv"', () => {
      const res = detectEmergency('he fell and is unresponsiv')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('UNCONSCIOUSNESS')
    })
    it('detects variant "nonresponsive"', () => {
      const res = detectEmergency('person found nonresponsive in car')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('UNCONSCIOUSNESS')
    })

    // 5) "bleeding won't stop"
    it('detects "bleeding won\'t stop"', () => {
      const res = detectEmergency('Cut my hand deeply and the bleeding won\'t stop')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('SEVERE_BLEEDING')
    })
    it('detects casual variant "bleeding wont stop" (no apostrophe)', () => {
      const res = detectEmergency('the bleeding wont stop at all')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('SEVERE_BLEEDING')
    })
    it('detects misspelling "bleeding wont stope"', () => {
      const res = detectEmergency('help wound bleeding wont stope')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('SEVERE_BLEEDING')
    })

    // 6) "overdose"
    it('detects "overdose"', () => {
      const res = detectEmergency('Someone took an overdose of sleeping pills')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('POISONING')
    })
    it('detects misspelling "overdoze"', () => {
      const res = detectEmergency('suspected accidental overdoze')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('POISONING')
    })
    it('detects variant "over dose"', () => {
      const res = detectEmergency('they had an over dose')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('POISONING')
    })

    // 7) "swallowed poison"
    it('detects "swallowed poison"', () => {
      const res = detectEmergency('Child swallowed poison from cleaning cupboard')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('POISONING')
    })
    it('detects misspelling "swalowed poison"', () => {
      const res = detectEmergency('toddler swalowed poison')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('POISONING')
    })
    it('detects misspelling "swallowed posion"', () => {
      const res = detectEmergency('he swallowed posion by mistake')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('POISONING')
    })

    // 8) "seizure"
    it('detects "seizure"', () => {
      const res = detectEmergency('She is having a seizure right now')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('SEIZURE')
    })
    it('detects misspelling "seizur"', () => {
      const res = detectEmergency('brother having a seizur')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('SEIZURE')
    })
    it('detects misspelling "ceizure"', () => {
      const res = detectEmergency('patient having ceizure')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('SEIZURE')
    })

    // 9) "face drooping"
    it('detects "face drooping"', () => {
      const res = detectEmergency('Notice sudden face drooping on the right side')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('STROKE')
    })
    it('detects misspelling "face droping"', () => {
      const res = detectEmergency('her face droping and cannot speak')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('STROKE')
    })
    it('detects variant "facial drooping"', () => {
      const res = detectEmergency('sudden onset of facial drooping')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('STROKE')
    })

    // 10) "anaphylaxis / throat closing"
    it('detects "throat is closing up"', () => {
      const res = detectEmergency('I accidentally ate peanuts and my throat is closing up')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('ANAPHYLAXIS')
    })
    it('detects "anaphylaxis"', () => {
      const res = detectEmergency('Help me, having anaphylaxis after bee sting')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('ANAPHYLAXIS')
    })
  })

  // 3. Separate Crisis Category for Self-Harm or Suicidal Wording
  describe('Separate Crisis Category (Self-Harm / Suicide)', () => {
    it('detects "want to die" with caring message and 112 guidance', () => {
      const res = detectEmergency('I feel hopeless and I want to die')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CRISIS_SELF_HARM')
      expect(res.guidanceMessage).toBe(CRISIS_CARING_MESSAGE)
      expect(res.guidanceMessage).toContain("I'm really sorry you're going through this, and I'm glad you told me. You don't have to face it alone.")
      expect(res.guidanceMessage).toContain('Please contact your local emergency number (112 in India) or a trusted person right now.')
    })

    it('detects "kill myself"', () => {
      const res = detectEmergency('I want to kill myself')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CRISIS_SELF_HARM')
      expect(res.guidanceMessage).toBe(CRISIS_CARING_MESSAGE)
    })

    it('detects "end my life"', () => {
      const res = detectEmergency('planning to end my life')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CRISIS_SELF_HARM')
      expect(res.guidanceMessage).toBe(CRISIS_CARING_MESSAGE)
    })

    it('detects "suicidal thoughts"', () => {
      const res = detectEmergency('having severe suicidal thoughts')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CRISIS_SELF_HARM')
    })
  })

  // 4. Non-Medical Suppressions vs First-Person Override
  describe('Non-Medical Suppressions & Override Rules', () => {
    it('suppresses "unconscious bias" when no personal symptom is present', () => {
      const res = detectEmergency('We had a corporate lecture on unconscious bias in recruitment')
      expect(res.isEmergency).toBe(false)
      expect(res.reason).toContain('Non-medical term suppressed')
    })

    it('suppresses "breathtaking" scenery', () => {
      const res = detectEmergency('The mountain sunrise was breathtaking')
      expect(res.isEmergency).toBe(false)
    })

    it('suppresses "chestnut" food mention', () => {
      const res = detectEmergency('I prepared roasted chestnuts for dinner')
      expect(res.isEmergency).toBe(false)
    })

    it('NEVER suppresses if message contains a first-person symptom alongside non-medical word', () => {
      const res = detectEmergency('I am reading about unconscious bias and I have severe chest pain')
      expect(res.isEmergency).toBe(true)
      expect(res.category).toBe('CARDIAC')
    })

    it('does not trigger on general benign greeting', () => {
      const res = detectEmergency('Hello Dr. Anahitha, what is a balanced diet?')
      expect(res.isEmergency).toBe(false)
    })
  })
})
