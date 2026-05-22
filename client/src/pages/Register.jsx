import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Toast from '../components/Toast'

function Register() {
  const navigate = useNavigate()
  
  // State variables
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Redirect if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password) {
      showToast('All registration fields are required.', 'warning')
      return
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password
      })
      showToast('Registered successfully! Directing to sign in...', 'success')
      
      setTimeout(() => {
        navigate('/')
      }, 1500)
    } catch (err) {
      console.error('Registration failed:', err)
      const errorMsg = err.response?.data?.message || 'Registration failed. Try a different email.'
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type) => {
    setToast({ message, type })
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative px-6 overflow-hidden animate-fade-in font-sans">
      {/* Cinematic Cover Background Image */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-[0.06] blur-[2px] pointer-events-none select-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/70 to-zinc-950 z-0 pointer-events-none" />

      {/* Dynamic ambient glowing backing light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-650/10 rounded-full blur-[130px] pointer-events-none select-none z-0" />

      {/* Main card panel - state of the art glassmorphism */}
      <div className="w-full max-w-md p-9 bg-zinc-900/30 border border-zinc-850 rounded-[28px] shadow-2xl relative z-10 animate-slide-in backdrop-blur-xl hover:border-zinc-800 transition duration-500">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2">
            <span>🎬</span><span><span className="text-red-500 glow-red">M</span>OVIE <span className="text-red-500 glow-red">V</span>ERSE</span>
          </h1>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-3.5 opacity-90">
            Begin Your Cinematic Journey
          </p>
          <p className="text-zinc-500 text-[11px] font-semibold tracking-wide mt-1.5 leading-relaxed">
            Create your account to unlock curated tracking, bookmarks, rating logs, and CineMatch Lounge permissions.
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-zinc-400 block uppercase tracking-widest">Full Name</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <input
                type="text"
                className="w-full bg-zinc-950/60 hover:bg-zinc-950/90 focus:bg-zinc-950 border border-zinc-850 focus:border-red-500 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-red-500/50 transition duration-300 text-sm font-semibold placeholder-zinc-700 shadow-inner"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-zinc-400 block uppercase tracking-widest">Email Address</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                type="email"
                className="w-full bg-zinc-950/60 hover:bg-zinc-950/90 focus:bg-zinc-950 border border-zinc-850 focus:border-red-500 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-red-500/50 transition duration-300 text-sm font-semibold placeholder-zinc-700 shadow-inner"
                placeholder="e.g. name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-extrabold text-zinc-400 block uppercase tracking-widest">Password</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition duration-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full bg-zinc-950/60 hover:bg-zinc-950/90 focus:bg-zinc-950 border border-zinc-850 focus:border-red-500 text-white pl-12 pr-12 py-4 rounded-2xl outline-none focus:ring-1 focus:ring-red-500/50 transition duration-300 text-sm font-semibold placeholder-zinc-700 shadow-inner"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-red-650 hover:bg-red-600 text-white py-4 rounded-2xl font-black text-sm tracking-wide transition-all glow-btn-red duration-200 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/20"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Vault Account</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-zinc-900"></div>
          <span className="flex-shrink mx-4 text-zinc-400 text-[10px] font-extrabold uppercase tracking-widest">Membership Setup</span>
          <div className="flex-grow border-t border-zinc-900"></div>
        </div>

        <p className="text-zinc-400 text-center text-sm font-medium">
          Already have a vault?{' '}
          <span
            onClick={() => navigate('/')}
            className="text-red-500 cursor-pointer hover:text-red-400 font-extrabold hover:underline transition"
          >
            Sign In Instead
          </span>
        </p>
      </div>

      {/* Global Toast Alert container */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default Register