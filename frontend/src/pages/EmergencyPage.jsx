import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  PhoneCall,
  AlertTriangle,
  ShieldAlert,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
  ExternalLink,
} from 'lucide-react'
import { EMERGENCY_GUIDES } from '../data/emergencyGuides'

export default function EmergencyPage() {
  const [openGuideId, setOpenGuideId] = useState(EMERGENCY_GUIDES[0]?.id || null)

  const toggleGuide = (id) => {
    setOpenGuideId(openGuideId === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-plum font-sans flex flex-col selection:bg-lavender selection:text-plum">
      {/* Top Simple Utility Bar */}
      <header className="bg-white border-b border-lavender/60 py-3 px-4 sm:px-8 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-bold text-plum/80 hover:text-plum group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to ANAHITHA Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-emergency-red bg-red-50 border border-emergency-red/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
          Urgent Protocol Mode
        </span>
      </header>

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* SECTION 1: Massive Tap-to-Call 112 Action Card */}
        <div className="rounded-3xl bg-white border-2 border-emergency-red/40 p-6 sm:p-10 shadow-xl shadow-emergency-red/10 text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-50 text-emergency-red border border-emergency-red/30 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 fill-current" />
            <span>Immediate Emergency Assistance</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-plum tracking-tight">
            Emergency Response &amp; Immediate First-Aid
          </h1>

          <p className="text-sm sm:text-base text-plum/80 max-w-2xl mx-auto leading-relaxed">
            If you or someone nearby is experiencing a life-threatening crisis, do not wait.
            Call emergency services directly from your device right now.
          </p>

          {/* Very Large, Accessible Call 112 Button */}
          <div className="max-w-md mx-auto pt-2 space-y-3">
            <a
              href="tel:112"
              className="w-full p-5 sm:p-7 rounded-3xl bg-emergency-red text-white flex items-center justify-between shadow-2xl shadow-emergency-red/30 hover:bg-red-700 hover:shadow-red-700/40 transition-all transform hover:-translate-y-1 active:translate-y-0 group focus:outline-none focus:ring-4 focus:ring-emergency-red/40"
              aria-label="Direct call to National Emergency 112"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3.5 bg-white/20 rounded-2xl group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-xs uppercase tracking-wider font-semibold text-white/90">
                    National Emergency (India)
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold font-serif tracking-wide">
                    Call 112
                  </div>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl bg-white text-emergency-red shadow-sm group-hover:bg-white/95">
                Tap to Call
              </span>
            </a>

            {/* Note for users outside India */}
            <p className="text-xs text-plum/70 font-semibold tracking-wide">
              Outside India? Dial your local emergency number.
            </p>
          </div>

          {/* Explicit Boundary / Disclaimer: Never claim dispatch or guarantee rescue */}
          <div className="p-4 sm:p-5 rounded-2xl bg-blush/60 border border-rose/40 max-w-2xl mx-auto text-plum text-xs sm:text-sm leading-relaxed text-left flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-emergency-red shrink-0 mt-0.5" />
            <div>
              <strong className="block text-plum font-bold mb-1">
                Important Limitation Notice:
              </strong>
              ANAHITHA is an informational web application and{' '}
              <span className="underline decoration-emergency-red font-semibold">
                cannot dispatch an ambulance, diagnose medical conditions, or guarantee rescue
              </span>.
              Please connect directly with local emergency personnel over phone or in person.
            </div>
          </div>
        </div>

        {/* SECTION 2: First-Aid Guides Review Banner */}
        <div className="p-4 rounded-2xl bg-lavender-light/50 border border-lavender text-plum text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-plum shrink-0" />
            <span className="font-bold tracking-wide">
              DISCLAIMER: NEEDS EXPERT REVIEW BEFORE PUBLIC USE
            </span>
          </div>
          <span className="text-[11px] text-plum/70 font-medium">
            Sources referenced: British Red Cross, WHO, and NHS
          </span>
        </div>

        {/* SECTION 3: Nine Emergency Guides Accordion */}
        <section className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="font-serif text-2xl font-bold text-plum">
                Immediate Action Guides
              </h2>
              <p className="text-xs text-plum/70">
                Step-by-step first-aid while awaiting professional emergency personnel.
              </p>
            </div>
            <span className="text-xs font-semibold text-plum/60 bg-white px-3 py-1 rounded-full border border-lavender">
              {EMERGENCY_GUIDES.length} Guides
            </span>
          </div>

          <div className="space-y-3">
            {EMERGENCY_GUIDES.map((guide) => {
              const isOpen = openGuideId === guide.id

              return (
                <div
                  key={guide.id}
                  className="rounded-2xl bg-white border border-lavender/80 shadow-sm overflow-hidden transition-all"
                >
                  {/* Accordion Toggle Header */}
                  <button
                    onClick={() => toggleGuide(guide.id)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-lavender-light/20 transition-colors focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full shrink-0 ${
                          guide.critical ? 'bg-emergency-red' : 'bg-rose'
                        }`}
                      />
                      <div>
                        <div className="text-base sm:text-lg font-bold text-plum font-serif">
                          {guide.title}
                        </div>
                        <div className="text-xs text-plum/60 font-medium">
                          {guide.category}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-semibold text-plum/80 bg-lavender-light px-2.5 py-0.5 rounded-full border border-lavender">
                        Source: {guide.source}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-plum/60" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-plum/60" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Body Content */}
                  {isOpen && (
                    <div className="px-5 pb-6 pt-2 border-t border-lavender/40 space-y-4 bg-gradient-to-b from-white to-[#FAF8FD]/50">
                      <ol className="space-y-3">
                        {guide.steps.map((step, idx) => {
                          const isFirstStep = idx === 0
                          const isCallStep = step.toLowerCase().includes('call 112')

                          return (
                            <li
                              key={idx}
                              className={`p-3.5 rounded-xl text-xs sm:text-sm flex items-start space-x-3 leading-relaxed ${
                                isCallStep
                                  ? 'bg-red-50 border border-emergency-red/30 text-plum font-semibold'
                                  : 'bg-white border border-lavender/60 text-plum'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                                  isCallStep
                                    ? 'bg-emergency-red text-white'
                                    : 'bg-lavender text-plum'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          )
                        })}
                      </ol>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-plum/60 border-t border-lavender/40">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span>Source: <strong>{guide.source}</strong></span>
                          {guide.sourceUrl && (
                            <a
                              href={guide.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-plum hover:text-plum/80 underline inline-flex items-center space-x-0.5"
                            >
                              <span>Official page</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                          <span>(Verified: {guide.dateChecked})</span>
                        </div>
                        <a
                          href="tel:112"
                          className="font-bold text-emergency-red hover:underline flex items-center space-x-1"
                        >
                          <span>Direct Emergency Dial: 112</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-lavender/60 py-6 px-4 text-center text-xs text-plum/70 space-y-2 mt-auto">
        <p>
          ANAHITHA Healthcare AI — Emergency Protocol Mode. No account required.
        </p>
        <p className="text-[11px] text-plum/50">
          This service is strictly educational and does not replace emergency medical dispatch.
        </p>
      </footer>
    </div>
  )
}

