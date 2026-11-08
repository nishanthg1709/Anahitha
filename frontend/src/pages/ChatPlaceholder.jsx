import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Activity, ArrowLeft, ShieldAlert, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react'

export default function ChatPlaceholder() {
  const [backendHealth, setBackendHealth] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return res.json()
      })
      .then((data) => setBackendHealth({ loading: false, data, error: null }))
      .catch((err) => setBackendHealth({ loading: false, data: null, error: err.message }))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF8FD] via-lavender-light/40 to-[#FAF8FD] flex flex-col items-center justify-center p-6 text-plum">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 border border-lavender/60 relative"
      >
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-plum/70 hover:text-plum mb-6 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Landing Page</span>
        </Link>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-plum text-white rounded-2xl shadow-md">
            <Heart className="w-7 h-7 text-rose" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-serif text-plum">Dr. Anahitha Companion</h1>
            <p className="text-xs text-plum/70 font-medium">Conversational Session</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-blush/40 border border-rose/30 mb-6 flex items-start space-x-3 text-xs leading-relaxed text-plum">
          <Sparkles className="w-5 h-5 text-rose shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-1 text-plum">Companion Room Initialized:</strong>
            Dr. Anahitha’s conversational chat interface and 3D companion canvas are connecting to the FastAPI backend.
          </div>
        </div>

        {/* Backend Connectivity Status */}
        <div className="rounded-2xl border border-lavender p-4 bg-lavender-light/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-plum" />
              <span className="text-xs font-bold text-plum uppercase tracking-wider">
                FastAPI Backend Status
              </span>
            </div>
            <span className="text-[10px] bg-plum/10 px-2 py-0.5 rounded text-plum font-mono">
              GET /api/health
            </span>
          </div>

          {backendHealth.loading && (
            <p className="text-xs text-plum/60 animate-pulse">Checking backend link...</p>
          )}

          {backendHealth.data && (
            <div className="flex items-center space-x-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Connected: {backendHealth.data.message}</span>
            </div>
          )}

          {backendHealth.error && (
            <div className="flex items-center space-x-2 text-xs text-emergency-red bg-red-50 border border-emergency-red/20 p-2.5 rounded-xl font-medium">
              <ShieldAlert className="w-4 h-4 shrink-0 text-emergency-red" />
              <span>Connection error: {backendHealth.error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

