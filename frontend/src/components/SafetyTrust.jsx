import { ShieldAlert, Stethoscope, FileX, Clock } from 'lucide-react'

export default function SafetyTrust() {
  const safetyPoints = [
    {
      title: 'Not a Licensed Doctor',
      desc: 'Dr. Anahitha is an experimental AI web assistant built for learning and informational conversation. She is not a physician, therapist, or healthcare provider.',
      icon: Stethoscope,
      status: 'Current Boundary',
    },
    {
      title: 'Never Diagnoses or Prescribes',
      desc: 'This application cannot evaluate lab tests, identify illnesses, suggest medications, or alter medical treatment plans in any way.',
      icon: FileX,
      status: 'Current Boundary',
    },
    {
      title: 'Not for Medical Emergencies',
      desc: 'This tool cannot handle urgent health crises, cannot send help, and must never be used when immediate medical attention is required.',
      icon: ShieldAlert,
      status: 'Current Boundary',
    },
    {
      title: 'Planned Safety Screening',
      desc: 'Rule-based emergency detection to intercept red-flag symptoms before AI processing is a planned feature currently in development.',
      icon: Clock,
      status: 'Planned Feature',
    },
  ]

  return (
    <section id="safety" className="py-24 bg-[#FAF8FD] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[40px] bg-gradient-to-br from-white via-blush/30 to-lavender-light/50 border border-lavender p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Clear Honest Boundaries */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blush text-plum border border-rose/30 text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-plum" />
                <span>Safety &amp; Project Boundaries</span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-plum tracking-tight leading-snug">
                Clear Boundaries. Honest Capabilities.
              </h2>

              <p className="text-base text-plum/80 leading-relaxed font-normal">
                Dr. Anahitha is a student-built AI learning project. We believe healthcare-adjacent
                technology must be completely transparent about what it can and cannot do.
              </p>

              <div className="p-4 rounded-2xl bg-white/95 border border-lavender shadow-sm text-xs text-plum space-y-1">
                <strong className="block font-bold text-plum">Essential Notice:</strong>
                <p className="text-plum/80 leading-relaxed">
                  Always consult a qualified medical professional for health questions, diagnoses,
                  or treatment decisions. Never delay seeking professional care because of something
                  you read in an AI application.
                </p>
              </div>
            </div>

            {/* Right Column: 4 Grounded Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {safetyPoints.map((item) => {
                const IconComponent = item.icon
                const isPlanned = item.status === 'Planned Feature'

                return (
                  <div
                    key={item.title}
                    className="p-6 rounded-3xl bg-white/95 border border-lavender/70 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-lavender-light border border-lavender flex items-center justify-center text-plum">
                          <IconComponent className="w-6 h-6 text-plum" />
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            isPlanned
                              ? 'bg-lavender-light text-plum border-lavender'
                              : 'bg-blush text-plum border-rose/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-plum mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-plum/75 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
