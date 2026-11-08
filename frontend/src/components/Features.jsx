import {
  FileText,
  BookOpen,
  CalendarCheck,
  Smile,
  MessageSquare,
} from 'lucide-react'

export default function Features() {
  const features = [
    {
      title: 'Understand Symptoms',
      badge: 'Organization',
      description:
        'Helps you write down and organize how you are feeling in plain words so you have clear, prepared notes to share with your doctor.',
      icon: FileText,
      color: 'bg-lavender-light',
      borderColor: 'border-lavender',
    },
    {
      title: 'Health Information',
      badge: 'Definitions',
      description:
        'Helps look up and explain common wellness terms and health definitions in simple, everyday English without complex jargon.',
      icon: BookOpen,
      color: 'bg-blush/60',
      borderColor: 'border-rose/30',
    },
    {
      title: 'Personalized Guidance',
      badge: 'Daily Routines',
      description:
        'Helps you plan daily wellness goals, gentle reminders to drink water, and routine self-care habits aligned with your schedule.',
      icon: CalendarCheck,
      color: 'bg-lavender-light',
      borderColor: 'border-lavender',
    },
    {
      title: 'Lifestyle & Wellness',
      badge: 'Habits',
      description:
        'Offers practical suggestions for healthy sleep habits, daily relaxation routines, and gentle physical movement.',
      icon: Smile,
      color: 'bg-blush/60',
      borderColor: 'border-rose/30',
    },
    {
      title: '24/7 AI Chat',
      badge: 'Always Available',
      description:
        'A conversational chat companion available at any hour to answer everyday wellness questions and chat through lifestyle topics.',
      icon: MessageSquare,
      color: 'bg-lavender-light',
      borderColor: 'border-lavender',
    },
  ]

  return (
    <section id="features" className="py-24 bg-[#FAF8FD] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blush text-plum border border-rose/30 text-xs font-semibold uppercase tracking-wider">
            <span>Capabilities Overview</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-plum tracking-tight">
            How Dr. Anahitha Can Assist You
          </h2>
          <p className="text-base sm:text-lg text-plum/75 leading-relaxed">
            Explore the different modes designed to help you organize thoughts, learn everyday
            concepts, and build supportive daily wellness routines.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const IconComponent = feature.icon
            const isFeatured = idx === 4 // 24/7 AI Chat

            return (
              <div
                key={feature.title}
                className={`rounded-3xl p-8 bg-white border ${
                  feature.borderColor
                } shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                  isFeatured ? 'md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white via-blush/20 to-lavender-light/40' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl ${feature.color} border ${feature.borderColor} flex items-center justify-center text-plum shadow-inner`}
                    >
                      <IconComponent className="w-7 h-7 text-plum" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-blush text-plum border border-rose/30">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-plum mb-3 tracking-tight">
                    {feature.title}
                  </h3>

                  <p className="text-sm sm:text-base text-plum/80 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-lavender/40 text-xs font-semibold text-plum/60">
                  <span>Educational &amp; lifestyle support</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
