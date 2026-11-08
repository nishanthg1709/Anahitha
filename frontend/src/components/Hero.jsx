import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, MessageCircle, ShieldAlert, Heart, ArrowRight, Clock } from 'lucide-react'

export default function Hero({ onOpenEmergency }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-32 bg-gradient-to-b from-[#FAF8FD] via-blush/20 to-[#FAF8FD]">
      {/* Decorative ambient background blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-lavender/30 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-blush/50 blur-[110px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-lavender-light border border-lavender/70 shadow-sm">
              <Sparkles className="w-4 h-4 text-plum" />
              <span className="text-xs font-semibold tracking-wide text-plum uppercase">
                AI Health &amp; Wellness Companion
              </span>
            </div>

            {/* Editorial Headline */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-plum leading-[1.12]">
              Your Intelligent Healthcare Companion
            </h1>

            {/* Short Description: Grounded and true today */}
            <p className="text-lg sm:text-xl text-plum/80 leading-relaxed font-normal max-w-2xl">
              Meet <strong>Dr. Anahitha</strong> — an AI companion designed to help you organize
              your thoughts about symptoms, learn everyday health definitions, and plan positive
              wellness habits.
            </p>

            {/* Call To Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
              <Link
                to="/chat"
                className="group inline-flex items-center justify-center space-x-3 px-8 py-4 rounded-full bg-plum text-white font-semibold text-base shadow-xl shadow-plum/20 hover:bg-plum/90 hover:shadow-2xl hover:shadow-plum/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-5 h-5 text-rose transition-transform group-hover:scale-110" />
                <span>Start a Conversation</span>
                <ArrowRight className="w-4 h-4 text-lavender-light opacity-80 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#safety"
                className="inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-full border border-plum/20 bg-white/60 text-plum font-semibold text-base hover:bg-lavender-light hover:border-lavender transition-all"
              >
                <span>Safety &amp; Boundaries</span>
              </a>
            </div>

            {/* Trust Markers - Completely True Today */}
            <div className="pt-4 flex flex-wrap items-center gap-y-3 gap-x-6 text-xs text-plum/75 font-medium border-t border-lavender/50">
              <div className="flex items-center space-x-1.5">
                <Heart className="w-4 h-4 text-plum shrink-0" />
                <span>Not a Doctor • No Diagnoses</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-emergency-red shrink-0" />
                <span>Not for Emergencies (Call 112)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-plum shrink-0" />
                <span>Planned Safety Screening</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Image with Floating & Breathing Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 flex justify-center lg:justify-end relative"
          >
            {/* Ambient Aura & Hover Glow Container */}
            <div className="relative group max-w-sm sm:max-w-md w-full">
              {/* Soft animated gradient halo behind Dr. Anahitha */}
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-tr from-rose/30 via-lavender/40 to-blush/40 blur-2xl opacity-75 group-hover:opacity-100 transition duration-700 -z-10 group-hover:scale-105" />

              {/* Floating & Breathing Framer Motion wrapper */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                  scale: [1, 1.018, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative rounded-[36px] overflow-hidden bg-gradient-to-b from-white/90 via-blush/30 to-lavender-light/60 p-2.5 shadow-2xl border border-lavender/60 transition-shadow duration-500 group-hover:shadow-[0_25px_60px_-15px_rgba(242,141,178,0.5)]"
              >
                {/* Main Avatar Image */}
                <img
                  src="/dr-anahitha.png"
                  alt="Dr. Anahitha — Your Healthcare AI Companion"
                  className="w-full h-auto object-cover rounded-[30px] aspect-[4/4.5] transform transition duration-700 group-hover:scale-[1.02]"
                />

                {/* Status Float Badge */}
                <div className="absolute bottom-5 left-5 right-5 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-lavender shadow-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-emerald-500" />
                      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-plum">Dr. Anahitha</div>
                      <div className="text-[11px] text-plum/70 font-medium">Educational Companion (English)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-full bg-blush text-plum border border-rose/30">
                    Preview
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
