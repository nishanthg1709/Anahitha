import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'
import EmergencyPage from './pages/EmergencyPage'
import FloatingEmergencyButton from './components/FloatingEmergencyButton'

export default function App() {
  return (
    <BrowserRouter>
      {/* Floating emergency button visible on every page */}
      <FloatingEmergencyButton />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
