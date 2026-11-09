import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import {
  Send,
  ArrowLeft,
  PhoneCall,
  AlertTriangle,
  RotateCcw,
  Activity,
  BookOpen,
  CalendarCheck,
  Smile,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react'
import {
  detectEmergency,
  CRISIS_CARING_MESSAGE,
  EMERGENCY_SERIOUS_GUIDANCE,
} from '../utils/emergencyDetector'

export const MODES = [
  { id: 'chat', label: '24/7 Chat', icon: MessageSquare, desc: 'Empathetic listening and health dialogue' },
  { id: 'symptoms', label: 'Understand Symptoms', icon: Activity, desc: 'Organize symptom notes for your doctor' },
  { id: 'info', label: 'Health Information', icon: BookOpen, desc: 'Plain English medical definitions' },
  { id: 'guidance', label: 'Personalized Guidance', icon: CalendarCheck, desc: 'Daily habits and non-clinical guidance' },
  { id: 'wellness', label: 'Lifestyle & Wellness', icon: Smile, desc: 'Sleep, gentle movement, and stress support' },
]

export const STARTER_PROMPTS = [
  { text: 'Help me organize my symptom timeline for my doctor appointment', mode: 'symptoms' },
  { text: 'Tips for improving my sleep posture to reduce morning neck stiffness', mode: 'wellness' },
  { text: 'Can you explain what systolic and diastolic blood pressure mean?', mode: 'info' },
  { text: 'Simple daily reminders to build a steady water drinking habit', mode: 'guidance' },
]

export default function ChatPage() {
  const [activeMode, setActiveMode] = useState('chat')
  const [inputMessage, setInputMessage] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [waitDuration, setWaitDuration] = useState(0)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'anahitha',
      mode: 'chat',
      text: "Hello, I am Dr. Anahitha. I am an educational AI companion designed to help you organize notes about symptoms, understand everyday health topics in simple English, and build mindful wellness routines. How can I support you today?",
      isEmergency: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const chatEndRef = useRef(null)

  // Scroll to bottom whenever messages or thinking state changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking, waitDuration])

  // Track thinking wait duration for 5s warning notice
  useEffect(() => {
    let timer
    if (isThinking) {
      setWaitDuration(0)
      timer = setInterval(() => {
        setWaitDuration((prev) => prev + 1)
      }, 1000)
    } else {
      setWaitDuration(0)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isThinking])

  const handleSendMessage = async (customText, customMode) => {
    const rawText = customText !== undefined ? customText : inputMessage
    const modeToUse = customMode !== undefined ? customMode : activeMode
    const trimmed = (rawText || '').trim()
    if (!trimmed || isThinking) return

    const nowTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // 1. Append User Message
    const userMsg = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: 'user',
      mode: modeToUse,
      text: trimmed,
      timestamp: nowTimestamp,
    }

    setMessages((prev) => [...prev, userMsg])
    if (customText === undefined) {
      setInputMessage('')
    }

    // 2. Client-Side Safety Screener: MUST run BEFORE any network or AI call
    const safetyCheck = detectEmergency(trimmed)
    if (safetyCheck.isEmergency) {
      const emergencyReplyText =
        safetyCheck.category === 'CRISIS_SELF_HARM'
          ? CRISIS_CARING_MESSAGE
          : (safetyCheck.guidanceMessage || EMERGENCY_SERIOUS_GUIDANCE)

      const emergencyReply = {
        id: `emergency-${Date.now()}-${Math.random()}`,
        sender: 'anahitha',
        mode: modeToUse,
        text: emergencyReplyText,
        isEmergency: true,
        category: safetyCheck.category,
        timestamp: nowTimestamp,
      }
      setMessages((prev) => [...prev, emergencyReply])
      return
    }

    // 3. Normal Flow: Call backend POST /api/chat
    setIsThinking(true)
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, mode: modeToUse }),
      })

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`)
      }

      const data = await response.json()

      // If backend flagged emergency, show the exact same emergency card
      if (data.emergency) {
        const backendEmergencyReply = {
          id: `emergency-backend-${Date.now()}-${Math.random()}`,
          sender: 'anahitha',
          mode: modeToUse,
          text: data.reply || EMERGENCY_SERIOUS_GUIDANCE,
          isEmergency: true,
          category: data.category,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, backendEmergencyReply])
      } else {
        const botReply = {
          id: `bot-${Date.now()}-${Math.random()}`,
          sender: 'anahitha',
          mode: modeToUse,
          text: data.reply || "Dr. Anahitha is here to help with your health questions.",
          isEmergency: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, botReply])
      }
    } catch (err) {
      const errorReply = {
        id: `err-${Date.now()}-${Math.random()}`,
        sender: 'system-error',
        mode: modeToUse,
        text: "Dr. Anahitha is temporarily unable to connect to the knowledge engine. Please try again in a few moments, or if this is an urgent health concern, please consult a healthcare provider or call 112.",
        failedMessage: trimmed,
        failedMode: modeToUse,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, errorReply])
    } finally {
      setIsThinking(false)
    }
  }

  const handleRetry = (failedText, failedMode) => {
    handleSendMessage(failedText, failedMode)
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'anahitha',
        mode: activeMode,
        text: "Welcome back. I am Dr. Anahitha. Feel free to choose a focus mode below or ask an everyday wellness question.",
        isEmergency: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-plum font-sans flex flex-col selection:bg-lavender selection:text-plum">
      {/* 1) Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-lavender/60 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            to="/"
            className="p-2 rounded-xl text-plum/70 hover:text-plum hover:bg-lavender-light/60 transition-colors"
            title="Back to Landing Page"
            aria-label="Back to Landing Page"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Dr. Anahitha PNG Avatar & Label */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src="/dr-anahitha.png"
                alt="Dr. Anahitha"
                className="w-10 h-10 rounded-full object-cover border-2 border-lavender shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base text-plum">Dr. Anahitha</span>
                {/* Prominent Label: AI Companion, not a doctor */}
                <span className="text-[11px] font-semibold bg-blush/90 text-plum px-2.5 py-0.5 rounded-full border border-rose/40">
                  AI Companion, not a doctor
                </span>
              </div>
              <div className="text-[11px] text-plum/60 font-medium">
                Educational Support • English Only
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls: Reset & Permanent Call 112 */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleResetChat}
            className="p-2 rounded-xl text-plum/60 hover:text-plum hover:bg-lavender-light/50 transition-colors text-xs flex items-center space-x-1"
            title="Start fresh conversation"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline font-medium">Reset</span>
          </button>

          {/* Permanent Call 112 Button */}
          <a
            href="tel:112"
            className="flex items-center space-x-1.5 bg-emergency-red text-white text-xs font-bold px-4 py-2 rounded-full shadow-md hover:bg-red-700 transition-all active:scale-95"
            aria-label="Call 112"
          >
            <PhoneCall className="w-3.5 h-3.5 fill-current" />
            <span>Call 112</span>
          </a>
        </div>
      </header>

      {/* 6) Small Notice */}
      <div className="bg-lavender-light/30 border-b border-lavender/40 px-4 py-1.5 text-center">
        <p className="text-[11px] text-plum/70 font-medium">
          Demo only. Please don't share real personal health details.
        </p>
      </div>

      {/* 2) Five Mode Chips */}
      <nav aria-label="Conversation modes" className="bg-[#FAF8FD] border-b border-lavender/50 px-4 py-2.5 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-plum/50 shrink-0 mr-1">
            Mode:
          </span>
          {MODES.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all ${
                  isActive
                    ? 'bg-plum text-white shadow-sm ring-2 ring-plum/20'
                    : 'bg-white text-plum/80 border border-lavender hover:bg-lavender-light/50'
                }`}
                aria-pressed={isActive}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose' : 'text-plum/70'}`} />
                <span>{mode.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Main Chat Stream */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between space-y-4">
        {/* Messages Container */}
        <div className="flex-grow space-y-4 min-h-[360px] overflow-y-auto pt-2 pb-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user'
            const isError = msg.isError

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-plum flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4 text-rose" />
                  </div>
                )}

                <div className={`max-w-xl space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* 3) Emergency Interception Card */}
                  {msg.isEmergency ? (
                    <div
                      data-testid="emergency-card"
                      className="p-5 rounded-2xl bg-red-50 border-2 border-emergency-red text-plum shadow-md space-y-3"
                    >
                      <div className="flex items-center space-x-2 text-emergency-red font-bold text-xs uppercase tracking-wide">
                        <AlertTriangle className="w-4 h-4 fill-current shrink-0" />
                        <span>Emergency Assistance Recommended</span>
                      </div>

                      <p className="text-sm font-semibold leading-relaxed text-plum">
                        {msg.text}
                      </p>

                      <div className="pt-2 flex flex-wrap items-center gap-2.5">
                        <a
                          href="tel:112"
                          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emergency-red text-white text-xs font-bold shadow hover:bg-red-700 transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5 fill-current" />
                          <span>Call 112</span>
                        </a>

                        <Link
                          to="/emergency"
                          className="px-4 py-2.5 rounded-xl bg-white border border-emergency-red/40 text-emergency-red text-xs font-bold hover:bg-red-50 transition-colors"
                        >
                          Emergency First-Aid Guides
                        </Link>
                      </div>

                      <p className="text-[11px] text-plum/70 italic pt-1">
                        Outside India? Dial your local emergency number. ANAHITHA cannot contact emergency services or dispatch help for you.
                      </p>
                    </div>
                  ) : isError ? (
                    /* 5) Error & Retry State */
                    <div
                      data-testid="error-card"
                      className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-plum shadow-xs space-y-3"
                    >
                      <div className="flex items-center space-x-2 text-amber-800 font-semibold text-xs">
                        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>Connection Notice</span>
                      </div>

                      <p className="text-xs text-plum/90 leading-relaxed">
                        {msg.text}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white/80 border border-amber-200 text-[11px] text-plum/80 flex items-center justify-between gap-2">
                        <span>For urgent health issues, please dial <strong>112</strong> immediately.</span>
                        <a href="tel:112" className="text-emergency-red font-bold underline shrink-0">
                          Call 112
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRetry(msg.failedMessage, msg.failedMode)}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-plum text-white text-xs font-semibold shadow hover:bg-plum/90 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-rose" />
                        <span>Retry</span>
                      </button>
                    </div>
                  ) : (
                    /* 4) Standard Message Bubble with ReactMarkdown for Assistant */
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-blush/80 border border-rose/30 text-plum rounded-tr-sm ml-8'
                          : 'bg-white border border-lavender text-plum rounded-tl-sm mr-8'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="markdown-content text-plum leading-relaxed space-y-2">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 last:mb-0">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 last:mb-0">{children}</ol>,
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-plum">{children}</strong>,
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`flex items-center space-x-2 text-[10px] text-plum/50 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{msg.timestamp}</span>
                    {msg.mode && (
                      <span className="capitalize bg-lavender-light/50 px-1.5 py-0.5 rounded text-plum/60 font-medium">
                        {MODES.find((m) => m.id === msg.mode)?.label || msg.mode}
                      </span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-lavender-light flex items-center justify-center text-plum shrink-0 shadow-sm mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            )
          })}

          {/* 4) Typing Indicator & >5s Wait Warning */}
          {isThinking && (
            <div data-testid="typing-indicator" className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-plum flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4 text-rose" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-lavender text-plum shadow-xs space-y-2 max-w-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-plum/80 font-medium">Dr. Anahitha is formulating guidance</span>
                  <span className="flex space-x-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-plum/60 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-plum/60 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-plum/60 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>

                {waitDuration >= 5 && (
                  <p data-testid="slow-warning" className="text-xs text-plum/70 italic font-medium pt-1 border-t border-lavender/30">
                    Still thinking, this can take up to 15 seconds.
                  </p>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips when only welcome message is present */}
        {messages.length === 1 && !isThinking && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-plum/60 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose" />
              <span>Suggested topics to explore:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveMode(prompt.mode)
                    handleSendMessage(prompt.text, prompt.mode)
                  }}
                  className="p-3 rounded-2xl bg-white border border-lavender hover:bg-blush/40 hover:border-rose/30 transition-all text-left text-xs font-medium text-plum shadow-xs group"
                >
                  <span className="block text-[10px] uppercase font-bold text-plum/50 group-hover:text-plum mb-0.5">
                    {MODES.find((m) => m.id === prompt.mode)?.label}
                  </span>
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1) Input Composer with 1000-character Counter */}
        <div className="pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="rounded-2xl bg-white border border-lavender shadow-md p-2.5 focus-within:border-plum/50 focus-within:ring-2 focus-within:ring-lavender transition-all"
          >
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                maxLength={1000}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask Dr. Anahitha in ${MODES.find((m) => m.id === activeMode)?.label} mode (English only)...`}
                className="flex-grow bg-transparent px-3 py-2 text-sm text-plum placeholder-plum/40 focus:outline-none"
                aria-label="Message Dr. Anahitha"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || isThinking}
                className="p-3 rounded-xl bg-plum text-white hover:bg-plum/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-rose" />
              </button>
            </div>

            <div className="flex items-center justify-between px-3 pt-2 text-[10px] text-plum/50 border-t border-lavender/30 mt-2">
              <div>
                <span>Mode: <strong>{MODES.find((m) => m.id === activeMode)?.label}</strong> — {MODES.find((m) => m.id === activeMode)?.desc}</span>
              </div>
              <div>
                <span className={inputMessage.length >= 950 ? 'text-emergency-red font-bold' : ''}>
                  {inputMessage.length}/1000
                </span>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

