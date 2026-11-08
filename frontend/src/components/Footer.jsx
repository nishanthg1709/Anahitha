import { HeartHandshake, Phone, Heart, GraduationCap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer({ onOpenEmergency }) {
  return (
    <footer className="bg-plum text-white border-t border-plum/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-rose" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                ANAHITHA
              </span>
            </div>
            <p className="text-sm text-lavender-light/80 leading-relaxed max-w-sm font-normal">
              Your Intelligent Healthcare Companion. A student-built AI learning project designed to help organize thoughts about symptoms, learn health definitions, and plan wellness routines.
            </p>
            <div className="pt-2 flex items-center space-x-2 text-xs text-lavender-light/70">
              <GraduationCap className="w-4 h-4 text-rose" />
              <span>Student Learning &amp; Exploration Project</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-rose">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-lavender-light/80 font-medium">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Capabilities &amp; Modes
                </a>
              </li>
              <li>
                <a href="#preview" className="hover:text-white transition-colors">
                  Sample Preview
                </a>
              </li>
              <li>
                <a href="#safety" className="hover:text-white transition-colors">
                  Safety &amp; Project Boundaries
                </a>
              </li>
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">
                  Start Companion Conversation
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Notice in Footer */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-emergency-red">
              Emergency Notice
            </h4>
            <p className="text-xs text-lavender-light/70 leading-relaxed">
              In an urgent medical emergency, call <strong>112</strong> (India) or your local emergency number immediately.
            </p>
            <button
              onClick={onOpenEmergency}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emergency-red text-white text-xs font-bold shadow hover:bg-red-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 fill-current" />
              <span>Emergency Help (Dial 112)</span>
            </button>
          </div>
        </div>

        {/* Disclaimer Block */}
        <div className="pt-8 pb-4 text-center space-y-3">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-lavender-light/80 max-w-4xl mx-auto leading-relaxed">
            <strong className="text-white block mb-1">Medical Disclaimer &amp; Boundaries:</strong>
            ANAHITHA and Dr. Anahitha are experimental AI learning tools for educational and
            informational purposes only. They do not formulate clinical diagnoses, prescribe medication,
            or replace consultation with a licensed doctor, therapist, or hospital. Always seek the advice
            of qualified healthcare providers with any medical questions.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-lavender-light/60 pt-4">
            <p>&copy; {new Date().getFullYear()} ANAHITHA Healthcare AI Project.</p>
            <div className="flex items-center space-x-1 mt-2 sm:mt-0">
              <span>Built for learning and exploration</span>
              <Heart className="w-3 h-3 text-rose fill-current" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
