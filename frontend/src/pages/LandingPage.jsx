import { useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Features from '../components/Features'
import TextVoicePreview from '../components/TextVoicePreview'
import SafetyTrust from '../components/SafetyTrust'
import EmergencySection from '../components/EmergencySection'
import Footer from '../components/Footer'
import EmergencyModal from '../components/EmergencyModal'

export default function LandingPage() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false)

  const handleOpenEmergency = () => setIsEmergencyModalOpen(true)
  const handleCloseEmergency = () => setIsEmergencyModalOpen(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FD] text-plum font-sans selection:bg-lavender selection:text-plum">
      {/* Navigation */}
      <Navbar onOpenEmergency={handleOpenEmergency} />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* 1) Hero Section */}
        <Hero onOpenEmergency={handleOpenEmergency} />

        {/* 2) Five Feature Cards */}
        <Features />

        {/* 3) Text & Voice Preview */}
        <TextVoicePreview />

        {/* 4) Safety and Trust Section */}
        <SafetyTrust />

        {/* 5) Emergency Access Section */}
        <EmergencySection onOpenModal={handleOpenEmergency} />
      </main>

      {/* Footer */}
      <Footer onOpenEmergency={handleOpenEmergency} />

      {/* Modal triggered by any Emergency CTA */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={handleCloseEmergency}
      />
    </div>
  )
}

