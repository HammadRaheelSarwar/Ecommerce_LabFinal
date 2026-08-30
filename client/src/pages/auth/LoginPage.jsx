import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPwd, setShowPwd]     = useState(false)
  const [loading, setLoading]     = useState(false)
  const { login } = useAuth()
  const [params] = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await login(email, password)
      toast.success('Welcome back!')
      // Redirect is handled by GuestRoute
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-sm"
        >
          <Link to="/" className="inline-block mb-10">
            <span className="font-serif text-2xl font-bold tracking-widest text-white">ALL AVAILABLE</span>
            <span className="text-gold text-[9px] tracking-[0.3em] uppercase font-sans block">Premium Lifestyle</span>
          </Link>

          <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Welcome Back</p>
          <h1 className="font-serif text-3xl font-bold text-white mb-8">Sign In</h1>

          {params.get('redirect') === '/checkout' && (
            <div className="bg-gold/10 border border-gold/30 px-4 py-3 mb-6 text-sm text-gold/90 font-sans">
              Please sign in to proceed to checkout.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="input-luxury"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="input-luxury pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-white transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-gold hover:text-gold-soft font-sans">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full disabled:opacity-60 mt-2"
            >
              <LogIn size={15} />
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>

          <div className="divider-gold mt-8 mb-6" />

          <p className="text-center text-gray-mid text-sm font-sans">
            New to All Available?{' '}
            <Link
              to={`/signup${params.get('redirect') ? `?redirect=${params.get('redirect')}` : ''}`}
              className="text-gold hover:text-gold-soft font-semibold"
            >
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right — decorative panel */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <p className="font-serif text-4xl font-bold text-white mb-2">Your World</p>
          <p className="font-serif text-4xl font-bold text-gold">of Style.</p>
        </div>
      </div>
    </div>
  )
}
