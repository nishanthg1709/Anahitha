import { motion } from 'framer-motion'
import { Volume2, Sparkles, Bot, User, Clock } from 'lucide-react'

export default function TextVoicePreview() {
  return (
    <section id="preview" className="py-24 bg-gradient-to-b from-[#FAF8FD] via-lavender-light/30 to-[#FAF8FD] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-lavender-light text-plum border border-lavender text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-plum" />
            <span>Sample Preview</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-plum tracking-tight">
            Conversational Experience Preview
          </h2>
          <p className="text-base sm:text-lg text-plum/75 leading-relaxed">
            Here is a sample preview of how you can chat with Dr. Anahitha about everyday wellness
            concerns in plain English.
          </p>
        </div>

        {/* Mock Interface Card */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-lavender/60 overflow-hidden">
          {/* Top Device Bar */}
          <div className="bg-lavender-light/60 px-6 py-4 border-b border-lavender flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-plum flex items-center justify-center text-rose">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-plum flex items-center space-x-2">
                  <span>Conversation Mockup</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-blush text-plum border border-rose/30">
                    Sample preview
                  </span>
                </div>
                <div className="text-[11px] text-plum/70 font-medium">Informational dialogue simulation</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-plum/80 bg-white px-3 py-1 rounded-lg border border-lavender">
                Sample preview
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Conversation Flow */}
            <div className="space-y-4">
              {/* User Message */}
              <div className="flex items-start space-x-3 max-w-xl">
                <div className="w-8 h-8 rounded-full bg-lavender-light flex items-center justify-center shrink-0 text-plum mt-1">
                  <User className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-blush/60 border border-rose/30 text-plum text-sm leading-relaxed shadow-sm">
                  <p className="font-semibold text-xs text-plum/60 mb-1">User</p>
                  I have had a mild, dull headache for the past two mornings after long hours at my laptop. How can I think about this?
                </div>
              </div>

              {/* Dr. Anahitha Response */}
              <div className="flex items-start justify-end space-x-3">
                <div className="max-w-2xl p-5 rounded-2xl rounded-tr-sm bg-lavender-light/40 border border-lavender text-plum text-sm leading-relaxed shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-lavender/50 pb-2">
                    <span className="font-semibold text-xs text-plum flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-plum" />
                      <span>Dr. Anahitha</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase bg-white text-plum px-2 py-0.5 rounded border border-lavender">
                      Sample preview
                    </span>
                  </div>

                  <p>
                    Waking up with dull head tension while working long hours is quite common, often related to screen glare, posture, or hydration.
                  </p>

                  <div className="p-3 rounded-xl bg-white/80 border border-lavender/60 text-xs text-plum space-y-1.5">
                    <div className="font-bold text-plum">Points to Consider:</div>
                    <ul className="list-disc list-inside space-y-1 text-plum/80">
                      <li>Check your desk ergonomics and screen distance.</li>
                      <li>Keep a glass of water nearby to stay hydrated through the afternoon.</li>
                      <li>Write down when the headache starts so you can mention it to your doctor if it continues.</li>
                    </ul>
                  </div>

                  <p className="text-xs text-plum/70 italic border-t border-lavender/50 pt-2">
                    Reminder: This is general educational information. If symptoms persist or worsen, please consult your healthcare provider.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-plum flex items-center justify-center shrink-0 text-white mt-1 shadow-sm">
                  <Bot className="w-4 h-4 text-rose" />
                </div>
              </div>
            </div>

            {/* Voice Preview Section: Clearly labeled Coming Soon */}
            <div className="p-5 sm:p-6 rounded-2xl bg-lavender-light/30 border border-lavender space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-plum/10 flex items-center justify-center text-plum shrink-0">
                    <Volume2 className="w-5 h-5 text-plum" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-plum flex items-center space-x-2">
                      <span>Voice preview, coming soon</span>
                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blush text-plum border border-rose/40">
                        <Clock className="w-3 h-3 text-plum" />
                        <span>Planned</span>
                      </span>
                    </div>
                    <div className="text-xs text-plum/70">
                      Spoken conversational responses in English are planned for a future update.
                    </div>
                  </div>
                </div>

                {/* Static non-functional waveform mockup */}
                <div className="flex items-center space-x-1 h-8 bg-white/70 px-3 py-1.5 rounded-xl border border-lavender opacity-60">
                  {[12, 18, 8, 22, 14, 26, 12, 20, 16, 24, 10, 18].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-plum/50 rounded-full"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-plum/60 italic pt-1">
                * Note: Audio playback and voice interaction are currently in design and not yet functional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
