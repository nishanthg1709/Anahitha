import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Settings as SettingsIcon,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { session, signOut } = useAuth()
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const handleDeleteAllData = async () => {
    setIsDeleting(true)
    setErrorMsg(null)
    try {
      const token = session?.access_token || 'mock-dev-token'
      const response = await fetch('http://127.0.0.1:8000/api/user/data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Deletion failed (HTTP ${response.status})`)
      }

      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      setErrorMsg(err.message || 'Could not complete data deletion.')
      setIsDeleting(false)
      setShowConfirmModal(false)
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
            <SettingsIcon className="w-5 h-5 text-plum" />
            <h1 className="font-serif font-bold text-lg text-plum">Account Settings</h1>
          </div>
        </div>

        <a
          href="tel:112"
          className="bg-emergency-red text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow hover:bg-red-700 transition-colors flex items-center space-x-1"
        >
          <PhoneCall className="w-3 h-3 fill-current" />
          <span>Call 112</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="max-w-xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-grow">
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-emergency-red/30 text-emergency-red text-xs font-medium flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* General Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-lavender/60 shadow-sm space-y-4">
          <h2 className="font-serif font-bold text-base text-plum border-b border-lavender/40 pb-2">
            Account Preferences
          </h2>
          <div className="space-y-3 text-xs text-plum/80">
            <div className="flex items-center justify-between py-1">
              <span>Primary Language</span>
              <span className="font-bold text-plum bg-lavender-light px-2.5 py-0.5 rounded-full">
                English Only
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-lavender/20">
              <span>Primary Emergency Helpline</span>
              <span className="font-bold text-emergency-red bg-red-50 px-2.5 py-0.5 rounded-full">
                112 (India)
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-lavender/20">
              <span>Privacy Policy</span>
              <Link to="/privacy" className="text-plum font-semibold hover:underline">
                View Privacy Statement →
              </Link>
            </div>
          </div>
        </div>

        {/* Danger Zone: Delete All My Data */}
        <div className="bg-white rounded-3xl p-6 border-2 border-red-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-emergency-red">
            <AlertTriangle className="w-5 h-5 fill-current" />
            <h2 className="font-serif font-bold text-base">Danger Zone</h2>
          </div>

          <p className="text-xs text-plum/80 leading-relaxed">
            Permanently remove all your saved conversations, questions, notes, and profile history from the database.
            This action is irreversible.
          </p>

          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="w-full py-3 rounded-xl bg-emergency-red text-white text-xs font-bold shadow hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            aria-label="Delete all my data"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All My Data</span>
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-plum/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-lavender/80 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-emergency-red flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-lg text-plum">Delete all data?</h3>
              <p className="text-xs text-plum/70 leading-relaxed">
                This will immediately purge all your conversations and personal notes. You cannot recover them.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowConfirmModal(false)}
                className="w-1/2 py-2.5 rounded-xl border border-lavender text-xs font-semibold text-plum hover:bg-lavender-light/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAllData}
                className="w-1/2 py-2.5 rounded-xl bg-emergency-red text-white text-xs font-bold shadow hover:bg-red-700 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center p-4 text-[11px] text-plum/50">
        Demo only. Please don't share real personal health details.
      </footer>
    </div>
  )
}
