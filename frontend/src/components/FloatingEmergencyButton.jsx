import { Link, useLocation } from 'react-router-dom'
import { PhoneCall } from 'lucide-react'

export default function FloatingEmergencyButton() {
  const location = useLocation()

  // Hide the floating button when already on the emergency page itself
  if (location.pathname === '/emergency') {
    return null
  }

  return (
    <aside aria-label="Quick Emergency Helpline" className="fixed bottom-6 right-6 z-50">
      <Link
        to="/emergency"
        className="group flex items-center space-x-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-emergency-red text-white font-bold text-xs sm:text-sm shadow-2xl shadow-emergency-red/40 hover:bg-red-700 hover:shadow-red-700/50 transition-all transform hover:-translate-y-1 active:translate-y-0"
        aria-label="Open emergency help and call 112"
      >
        <span className="relative flex h-3.5 w-3.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white text-emergency-red items-center justify-center">
            <PhoneCall className="w-2.5 h-2.5 fill-current text-emergency-red" />
          </span>
        </span>
        <span className="tracking-wide">Emergency (112)</span>
      </Link>
    </aside>
  )
}

