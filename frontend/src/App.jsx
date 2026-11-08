import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Activity, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'

export default function App() {
  const [backendHealth, setBackendHealth] = useState({ loading: true, data: null, error: null })

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => setBackendHealth({ loading: false, data, error: null }))
      .catch((err) => setBackendHealth({ loading: false, data: null, error: err.message }))
  }, [])

  return (
    <div className="min-h-screen bg-lavender-light flex flex-col items-center justify-center p-6 text-plum">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl bg-white rounded-3xl shadow-xl p-8 border border-lavender/30"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-plum text-white rounded-2xl">
            <Heart className="w-8 h-8 text-rose" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-plum">Dr. Anahitha</h1>
            <p className="text-sm text-plum/70 font-medium">Healthcare AI Companion</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-plum/60 mb-3">
            Tailwind Theme Color Tokens
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
            <div className="p-3 rounded-xl bg-lavender-light border border-plum/10 flex items-center justify-between">
              <span>Lavender Light</span>
              <span className="text-plum/60">#E9E2F8</span>
            </div>
            <div className="p-3 rounded-xl bg-lavender text-plum border border-plum/10 flex items-center justify-between">
              <span>Lavender</span>
              <span className="text-plum/60">#B9A5E8</span>
            </div>
            <div className="p-3 rounded-xl bg-plum text-white flex items-center justify-between">
              <span>Plum</span>
              <span className="text-white/70">#3A2A5E</span>
            </div>
            <div className="p-3 rounded-xl bg-rose text-white flex items-center justify-between">
              <span>Rose</span>
              <span className="text-white/80">#F28DB2</span>
            </div>
            <div className="p-3 rounded-xl bg-blush text-plum border border-plum/10 flex items-center justify-between">
              <span>Blush</span>
              <span className="text-plum/60">#FFD9E6</span>
            </div>
            <div className="p-3 rounded-xl bg-emergency-red text-white flex items-center justify-between">
              <span>Emergency</span>
              <span className="text-white/80">#D92D3F</span>
            </div>
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-2xl bg-blush/50 border border-rose/30 mb-6 flex items-start space-x-3"
        >
          <Sparkles className="w-5 h-5 text-rose mt-0.5 shrink-0" />
          <div className="text-sm">
            <span className="font-bold text-plum">Framer Motion & Lucide Ready: </span>
            <span>Interactive animations and icons are loaded and working properly.</span>
          </div>
        </motion.div>

        <div className="rounded-2xl border border-lavender p-4 bg-lavender-light/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-plum" />
              <span className="text-sm font-semibold text-plum">Backend Health Check</span>
            </div>
            <span className="text-xs bg-plum/10 px-2 py-0.5 rounded text-plum font-mono">
              GET /api/health
            </span>
          </div>

          {backendHealth.loading && (
            <p className="text-sm text-plum/60 animate-pulse">Checking backend status...</p>
          )}

          {backendHealth.data && (
            <div className="flex items-center space-x-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Status: <strong>{backendHealth.data.status}</strong> - {backendHealth.data.message}</span>
            </div>
          )}

          {backendHealth.error && (
            <div className="flex items-center space-x-2 text-sm text-emergency-red bg-red-50 border border-emergency-red/20 p-2.5 rounded-xl">
              <ShieldAlert className="w-4 h-4 shrink-0 text-emergency-red" />
              <span>Backend not responding yet: {backendHealth.error}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
