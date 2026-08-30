import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/login" className="flex items-center gap-2 text-gray-mid hover:text-gold text-xs font-sans mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Forgot Password</p>
        <h1 className="font-serif text-3xl font-bold text-white mb-4">Reset Password</h1>
        <p className="text-gray-mid text-sm font-sans mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {sent ? (
          <div className="bg-gold/10 border border-gold/30 p-6 text-center">
            <Mail size={32} className="text-gold mx-auto mb-3" />
            <p className="text-white font-sans font-semibold">Email Sent!</p>
            <p className="text-gray-mid text-sm font-sans mt-2">
              Check your inbox for the password reset link.
            </p>
          </div>
        ) : (
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
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
