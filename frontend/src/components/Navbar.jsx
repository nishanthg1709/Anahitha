import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Menu, X, HeartHandshake, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ onOpenEmergency }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Preview', href: '#preview' },
    { name: 'Safety & Trust', href: '#safety' },
    { name: 'Emergency Access', href: '#emergency' },
  ]

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8FD]/90 backdrop-blur-md border-b border-lavender/40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-plum flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6 text-rose" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-plum">
                ANAHITHA
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-plum/60 -mt-1">
                Healthcare AI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-plum/80 hover:text-plum transition-colors relative py-1 hover:underline underline-offset-4 decoration-rose decoration-2"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Action Area: Start Chat, Auth, & Emergency Button */}
          <div className="hidden sm:flex items-center space-x-3">
            {user ? (
              <Link
                to="/dashboard"
                className="text-xs font-semibold px-3 py-2 rounded-full text-plum hover:bg-lavender-light transition-all flex items-center space-x-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-xs font-semibold px-3 py-2 rounded-full text-plum hover:bg-lavender-light transition-all"
              >
                Log In
              </Link>
            )}

            <Link
              to="/chat"
              className="text-xs font-semibold px-4 py-2.5 rounded-full border border-plum/20 text-plum hover:bg-lavender-light transition-all"
            >
              Start Conversation
            </Link>

            {/* Clearly visible Red Emergency Button */}
            <button
              onClick={onOpenEmergency}
              className="flex items-center space-x-2 bg-emergency-red text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg shadow-emergency-red/25 hover:bg-red-700 hover:shadow-red-600/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Open emergency help"
            >
              <Phone className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>Emergency</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onOpenEmergency}
              className="bg-emergency-red text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1 shadow"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>Emergency</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-plum hover:bg-lavender-light focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-lavender px-4 pt-3 pb-6 space-y-3 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium text-plum hover:bg-lavender-light transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-lavender/50 flex flex-col space-y-2">
            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-plum text-white text-sm font-semibold hover:bg-plum/90"
            >
              Start Conversation
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

