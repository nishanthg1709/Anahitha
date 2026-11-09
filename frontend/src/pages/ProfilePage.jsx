import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  User,
  ArrowLeft,
  Mail,
  Calendar,
  Save,
  CheckCircle2,
  ShieldAlert,
  PhoneCall,
  Settings as SettingsIcon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user, session } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [createdDate, setCreatedDate] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = session?.access_token || 'mock-dev-token'
        const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.ok) {
          const data = await response.json()
          setDisplayName(data.display_name || user?.user_metadata?.display_name || '')
          setEmail(data.email || user?.email || '')
          setCreatedDate(data.created_at || user?.created_at || new Date().toISOString())
        } else {
          setDisplayName(user?.user_metadata?.display_name || user?.email?.split('@')[0] || '')
          setEmail(user?.email || '')
        }
      } catch {
        setDisplayName(user?.user_metadata?.display_name || user?.email?.split('@')[0] || '')
        setEmail(user?.email || '')
      }
    }

    fetchProfile()
  }, [user, session])

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!displayName.trim()) return

    setIsSaving(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const token = session?.access_token || 'mock-dev-token'
      const response = await fetch('http://127.0.0.1:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ display_name: displayName.trim() }),
      })

      if (!response.ok) {
        throw new Error(`Save failed (HTTP ${response.status})`)
      }

      setSuccessMsg('Profile updated successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setErrorMsg(err.message || 'Could not update profile.')
    } finally {
      setIsSaving(false)
    }
  }

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
            <User className="w-5 h-5 text-plum" />
            <h1 className="font-serif font-bold text-lg text-plum">User Profile</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/settings"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-lavender hover:bg-lavender-light/50 transition-colors flex items-center space-x-1"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
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

      {/* Main Content */}
      <main className="max-w-xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-grow">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender/60 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 border-b border-lavender/40 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-plum text-rose flex items-center justify-center text-xl font-bold shadow-md">
              {displayName ? displayName[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-plum">{displayName || 'User'}</h2>
              <p className="text-xs text-plum/60">{email}</p>
            </div>
          </div>

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-emergency-red/30 text-emergency-red text-xs font-medium flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-plum mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                maxLength={100}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full bg-[#FAF8FD] border border-lavender rounded-xl px-3.5 py-2.5 text-sm text-plum placeholder-plum/40 focus:outline-none focus:border-plum/60 focus:ring-2 focus:ring-lavender"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-plum/40 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-lavender-light/30 border border-lavender/50 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-plum/60 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-plum/50 mt-1">Managed via authentication provider</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-plum mb-1.5">
                Member Since
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-plum/40 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={createdDate ? new Date(createdDate).toLocaleDateString() : 'Active session'}
                  disabled
                  className="w-full bg-lavender-light/30 border border-lavender/50 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-plum/60 cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !displayName.trim()}
              className="w-full py-2.5 rounded-xl bg-plum text-white text-xs font-bold shadow hover:bg-plum/90 disabled:opacity-50 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-rose" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-[11px] text-plum/50">
        Demo only. Please don't share real personal health details.
      </footer>
    </div>
  )
}
