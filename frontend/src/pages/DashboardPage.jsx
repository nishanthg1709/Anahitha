import { Link, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Clock,
  ShieldCheck,
  LogOut,
  ArrowRight,
  PhoneCall,
  User,
  Heart,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-plum font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-lavender/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-plum flex items-center justify-center text-rose shadow-sm">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <span className="font-serif font-bold text-lg text-plum">ANAHITHA</span>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/history"
            className="text-xs font-semibold text-plum/70 hover:text-plum px-3 py-1.5 rounded-lg hover:bg-lavender-light/40 transition-colors flex items-center space-x-1"
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-plum/70 hover:text-plum px-3 py-1.5 rounded-lg hover:bg-lavender-light/40 transition-colors flex items-center space-x-1 cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Log Out</span>
          </button>

          <a
            href="tel:112"
            className="bg-emergency-red text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow hover:bg-red-700 transition-colors flex items-center space-x-1"
          >
            <PhoneCall className="w-3 h-3 fill-current" />
            <span>Call 112</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-lavender-light flex items-center justify-center text-plum shadow-inner">
              <User className="w-7 h-7" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-plum">
                Welcome back, {displayName}
              </h1>
              <p className="text-xs text-plum/60 font-medium">
                Signed in as <span className="font-mono text-plum/80">{user?.email}</span>
              </p>
            </div>
          </div>

          <Link
            to="/chat"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-plum text-white text-xs font-bold shadow hover:bg-plum/90 transition-all shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-rose" />
            <span>Open Companion Chat</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dashboard Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/chat"
            className="p-5 rounded-2xl bg-white border border-lavender/60 hover:border-plum/40 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-plum mb-3 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5 text-plum" />
            </div>
            <h2 className="font-serif font-bold text-base text-plum mb-1">New Session</h2>
            <p className="text-xs text-plum/60 leading-relaxed">
              Consult Dr. Anahitha for symptom organization or daily wellness support.
            </p>
          </Link>

          <Link
            to="/history"
            className="p-5 rounded-2xl bg-white border border-lavender/60 hover:border-plum/40 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center text-plum mb-3 group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5 text-plum" />
            </div>
            <h2 className="font-serif font-bold text-base text-plum mb-1">Saved History</h2>
            <p className="text-xs text-plum/60 leading-relaxed">
              Review saved questions and assistant notes from prior sessions.
            </p>
          </Link>

          <Link
            to="/emergency"
            className="p-5 rounded-2xl bg-red-50/60 border border-emergency-red/30 hover:border-emergency-red hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emergency-red text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5 fill-current" />
            </div>
            <h2 className="font-serif font-bold text-base text-emergency-red mb-1">Emergency 112</h2>
            <p className="text-xs text-plum/70 leading-relaxed">
              Immediate tap-to-call 112 and verified Red Cross / WHO first-aid guides.
            </p>
          </Link>
        </div>

        {/* Safety & RLS Privacy Reminder */}
        <div className="p-4 rounded-2xl bg-white border border-lavender/60 text-xs text-plum/80 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-plum">Data Security & Row Level Security (RLS)</p>
            <p className="text-plum/70 leading-relaxed">
              Your conversations are isolated by Supabase Row Level Security. Only you can access your saved history. Guest sessions are never stored.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-[11px] text-plum/50">
        Demo only. Please don't share real personal health details.
      </footer>
    </div>
  )
}
