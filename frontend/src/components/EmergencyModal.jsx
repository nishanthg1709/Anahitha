import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, PhoneCall, X, ShieldAlert } from 'lucide-react'

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-plum/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emergency-red/30 z-10"
        >
          {/* Header Banner */}
          <div className="bg-emergency-red p-6 text-white flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-white/20 rounded-2xl">
                <ShieldAlert className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif tracking-wide">
                  Emergency Medical Notice
                </h3>
                <p className="text-xs text-white/90 font-medium">
                  This application is not for medical emergencies
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-blush/60 border border-rose/40 text-plum flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-emergency-red shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block text-sm font-semibold mb-1 text-plum">
                  ANAHITHA cannot dispatch emergency services.
                </strong>
                If you or someone nearby is experiencing severe chest pain, shortness of breath,
                loss of consciousness, sudden numbness, or acute injury, please call emergency
                services immediately.
              </div>
            </div>

            {/* Primary Large Emergency Button: 112 (India) */}
            <div className="space-y-3">
              <a
                href="tel:112"
                className="w-full p-4 rounded-2xl bg-emergency-red text-white flex items-center justify-between shadow-lg shadow-emergency-red/20 hover:bg-red-700 hover:shadow-red-700/30 transition-all transform hover:-translate-y-0.5 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <PhoneCall className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider font-semibold text-white/90">
                      National Emergency Number (India)
                    </div>
                    <div className="text-2xl font-bold font-serif tracking-wide">
                      Dial 112
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white text-emergency-red shadow-sm group-hover:bg-white/90">
                  Tap to Call
                </span>
              </a>

              {/* Note for users outside India */}
              <p className="text-xs text-plum/70 text-center font-medium">
                Outside India? Dial your local emergency number.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-semibold text-plum bg-lavender-light hover:bg-lavender transition-colors"
              >
                Close Notice
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
