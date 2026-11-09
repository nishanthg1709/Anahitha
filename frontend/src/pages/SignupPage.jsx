import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartHandshake, ArrowLeft, Lock, Mail, User, ShieldAlert, PhoneCall } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!email.trim() || !password || password.length < 6) {
      setErrorMsg('Please enter an email and password (minimum 6 characters).')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await signUp({ email, password, displayName })
      if (error) {
        setErrorMsg(error.message || 'Signup failed.')
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8FD] text-plum font-sans flex flex-col justify-between p-4 sm:p-6">
      {/* Top Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-plum/70 hover:text-plum transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <a
          href="tel:112"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-emergency-red hover:underline"
        >
          <PhoneCall className="w-3.5 h-3.5 fill-current" />
          <span>Emergency 112</span>
        </a>
      </header>

      {/* Main Container */}
      <main className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-lavender/60 shadow-lg my-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-plum flex items-center justify-center text-rose shadow-md">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-plum">Create Account</h1>
            <p className="text-xs text-plum/60 font-medium">Save conversation history and manage your settings</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-emergency-red/30 text-emergency-red text-xs font-medium flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-plum mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-plum/40 absolute left-3.5 top-3" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Preferred name"
                className="w-full bg-[#FAF8FD] border border-lavender rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-plum placeholder-plum/40 focus:outline-none focus:border-plum/60 focus:ring-2 focus:ring-lavender"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-plum/40 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#FAF8FD] border border-lavender rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-plum placeholder-plum/40 focus:outline-none focus:border-plum/60 focus:ring-2 focus:ring-lavender"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-plum mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-plum/40 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-[#FAF8FD] border border-lavender rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-plum placeholder-plum/40 focus:outline-none focus:border-plum/60 focus:ring-2 focus:ring-lavender"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-plum text-white text-xs font-bold shadow hover:bg-plum/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-lavender/40 text-center space-y-3">
          <p className="text-xs text-plum/70">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-plum hover:underline">
              Log in
            </Link>
          </p>

          <div className="pt-2">
            <Link
              to="/chat"
              className="inline-block text-xs text-plum/60 hover:text-plum font-semibold underline underline-offset-4"
            >
              Continue as Guest (No account or data storage) →
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-plum/50">
        Demo only. Please do not submit real clinical or confidential details.
      </footer>
    </div>
  )
}
