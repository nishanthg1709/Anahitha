import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, AlertTriangle, PhoneCall, Lock, Database, Sparkles, HeartHandshake } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF8FD] text-plum font-sans flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-lavender/60 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-plum/70 hover:text-plum transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <a
          href="tel:112"
          className="bg-emergency-red text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow hover:bg-red-700 transition-colors flex items-center space-x-1"
        >
          <PhoneCall className="w-3 h-3 fill-current" />
          <span>Call 112</span>
        </a>
      </header>

      {/* Main Privacy Notice */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-grow">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-plum text-rose flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl text-plum">Privacy & Safety Disclosures</h1>
            <p className="text-xs text-plum/60 font-medium">Plain English terms and transparency policy</p>
          </div>
        </div>

        {/* 1. Core Mandatory Disclosures */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lavender/60 shadow-sm space-y-6">
          {/* Demo Only */}
          <section className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-blush flex items-center justify-center text-plum shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-plum" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-plum">1. Demonstration Prototype Only</h2>
              <p className="text-xs text-plum/80 leading-relaxed">
                ANAHITHA is an experimental technology prototype and educational companion. It is strictly for demonstration purposes and is not a clinical medical device.
              </p>
            </div>
          </section>

          {/* Do Not Share Real Health Details */}
          <section className="flex items-start space-x-4 border-t border-lavender/30 pt-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-emergency-red shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-plum">2. Do Not Share Real Personal Health Details</h2>
              <p className="text-xs text-plum/80 leading-relaxed">
                Please do not enter real names, government IDs, detailed medical records, or sensitive personal health information into the chat or symptom screener.
              </p>
            </div>
          </section>

          {/* Data Storage in Supabase */}
          <section className="flex items-start space-x-4 border-t border-lavender/30 pt-5">
            <div className="w-10 h-10 rounded-xl bg-lavender-light flex items-center justify-center text-plum shrink-0 mt-0.5">
              <Database className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-plum">3. Data Stored in Supabase (Logged-in Users Only)</h2>
              <p className="text-xs text-plum/80 leading-relaxed">
                For registered and logged-in users, conversation history is stored securely in Supabase with PostgreSQL Row Level Security (RLS). Each user can only read or manage their own records. Guest conversations are never saved or stored.
              </p>
            </div>
          </section>

          {/* Free-Tier AI Model Notice */}
          <section className="flex items-start space-x-4 border-t border-lavender/30 pt-5">
            <div className="w-10 h-10 rounded-xl bg-plum text-rose flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-plum">4. Free-Tier AI Service Notice</h2>
              <p className="text-xs text-plum/80 leading-relaxed">
                Conversations are processed using free-tier Gemini API endpoints from Google AI Studio. Under Google's standard free-tier terms, submitted prompts may be processed by Google to improve services and models. This is why you must never input real clinical data.
              </p>
            </div>
          </section>

          {/* Emergency Protocols */}
          <section className="flex items-start space-x-4 border-t border-lavender/30 pt-5">
            <div className="w-10 h-10 rounded-xl bg-emergency-red text-white flex items-center justify-center shrink-0 mt-0.5">
              <PhoneCall className="w-5 h-5 fill-current" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif font-bold text-base text-plum">5. Not for Medical Emergencies</h2>
              <p className="text-xs text-plum/80 leading-relaxed">
                ANAHITHA cannot dispatch emergency personnel or summon ambulances. In India, call <strong>112</strong> immediately for acute symptoms. Outside India, dial your local emergency helpline.
              </p>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-lavender/60 text-xs text-plum">
          <div className="flex items-center space-x-2">
            <HeartHandshake className="w-4 h-4 text-plum" />
            <span>Need to delete your saved history?</span>
          </div>
          <Link to="/settings" className="font-bold underline text-plum">
            Go to Account Settings
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 text-[11px] text-plum/50">
        Demo only. Please don't share real personal health details.
      </footer>
    </div>
  )
}
