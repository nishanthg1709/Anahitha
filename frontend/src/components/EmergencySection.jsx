import { PhoneCall, AlertCircle, ShieldAlert } from 'lucide-react'

export default function EmergencySection({ onOpenModal }) {
  return (
    <section id="emergency" className="py-24 bg-gradient-to-b from-[#FAF8FD] to-blush/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Urgent Emergency Warning Card */}
        <div className="rounded-[36px] bg-white border-2 border-emergency-red/40 p-8 sm:p-14 shadow-2xl shadow-emergency-red/10 overflow-hidden relative">
          {/* Red Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-emergency-red" />

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-50 text-emergency-red border border-emergency-red/30 text-xs font-bold uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 fill-current" />
              <span>Not For Emergencies</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-plum tracking-tight">
              In an Urgent Medical Situation, Call for Help Immediately
            </h2>

            <div className="p-5 rounded-2xl bg-blush/60 border border-rose/40 max-w-2xl mx-auto text-plum text-sm leading-relaxed">
              <div className="flex items-start justify-center space-x-3">
                <AlertCircle className="w-5 h-5 text-emergency-red shrink-0 mt-0.5" />
                <p className="text-left font-medium">
                  <strong>Critical Notice:</strong> Dr. Anahitha is an AI companion and{' '}
                  <span className="underline decoration-emergency-red font-semibold">
                    cannot contact emergency services or dispatch help
                  </span>{' '}
                  for you. If you or someone around you needs immediate medical attention, call
                  emergency responders right away.
                </p>
              </div>
            </div>

            {/* Primary, Largest Tap-to-Call Button: 112 (India) */}
            <div className="pt-4 max-w-md mx-auto space-y-3">
              <a
                href="tel:112"
                className="w-full p-5 sm:p-6 rounded-3xl bg-emergency-red text-white flex items-center justify-between shadow-xl shadow-emergency-red/25 hover:bg-red-700 hover:shadow-2xl hover:shadow-red-700/35 transition-all transform hover:-translate-y-1 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3.5 bg-white/20 rounded-2xl">
                    <PhoneCall className="w-7 h-7 text-white animate-pulse" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs uppercase tracking-wider font-semibold text-white/90">
                      National Emergency Helpline (India)
                    </div>
                    <div className="text-3xl font-bold font-serif tracking-wider">
                      Call 112
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold px-4 py-2 rounded-xl bg-white text-emergency-red shadow-sm group-hover:bg-white/95">
                  Tap to Call
                </div>
              </a>

              {/* Outside India Notice */}
              <p className="text-xs text-plum/75 text-center font-medium">
                Outside India? Dial your local emergency number.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
