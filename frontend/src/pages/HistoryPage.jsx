import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  RotateCcw,
  Bot,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function HistoryPage() {
  const { session } = useAuth()
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const token = session?.access_token || 'mock-dev-token'
        const response = await fetch('http://127.0.0.1:8000/api/chat/history', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}`)
        }

        const data = await response.json()
        setHistoryData(data.conversations || [])
      } catch (err) {
        setErrorMsg(err.message || 'Could not load conversation history.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [session])

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-plum font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-lavender/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl text-plum/70 hover:text-plum hover:bg-lavender-light/60 transition-colors"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-plum" />
            <h1 className="font-serif font-bold text-lg text-plum">Conversation History</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/chat"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-plum text-white hover:bg-plum/90 transition-colors"
          >
            New Chat
          </Link>

          <a
            href="tel:112"
            className="bg-emergency-red text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow hover:bg-red-700 transition-colors flex items-center space-x-1"
          >
            <PhoneCall className="w-3 h-3 fill-current" />
            <span>Call 112</span>
          </a>
        </div>
      </header>

      {/* Main Stream */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-grow">
        <div className="p-4 rounded-2xl bg-white border border-lavender/60 text-xs text-plum/80 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Isolated to your account via Supabase Row Level Security (RLS).</span>
          </div>
          <span className="text-[10px] bg-lavender-light px-2 py-0.5 rounded-md font-mono">
            GET /api/chat/history
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-plum/60 animate-pulse">
            Loading your conversation history...
          </div>
        ) : errorMsg ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-emergency-red/30 text-emergency-red text-xs space-y-2">
            <p className="font-semibold">Unable to load history</p>
            <p>{errorMsg}</p>
          </div>
        ) : historyData.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-lavender/60 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lavender-light text-plum flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-bold text-lg text-plum">No Saved Conversations Yet</h2>
            <p className="text-xs text-plum/60 max-w-sm mx-auto">
              Conversations you have while logged in will be safely recorded here for your review.
            </p>
            <div className="pt-2">
              <Link
                to="/chat"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-plum text-white text-xs font-semibold shadow hover:bg-plum/90 transition-colors"
              >
                <span>Start a Conversation</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {historyData.map((conv) => (
              <div
                key={conv.id}
                className="bg-white rounded-2xl border border-lavender/60 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-lavender/40 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-plum">{conv.title || 'Conversation'}</span>
                    <span className="text-[10px] uppercase font-bold bg-lavender-light px-2 py-0.5 rounded text-plum/70">
                      {conv.mode || 'chat'}
                    </span>
                  </div>
                  <span className="text-[11px] text-plum/50">
                    {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Messages in this conversation */}
                <div className="space-y-2.5 pt-1">
                  {(conv.messages || []).map((m, idx) => {
                    const isUser = m.sender === 'user'
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-blush/60 border border-rose/30 text-plum ml-6'
                            : 'bg-[#FAF8FD] border border-lavender/60 text-plum mr-6'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 text-[10px] font-bold text-plum/60 mb-1">
                          {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-rose" />}
                          <span>{isUser ? 'You' : 'Dr. Anahitha'}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-[11px] text-plum/50">
        Demo only. Please don't share real personal health details.
      </footer>
    </div>
  )
}
