import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import { motion } from 'framer-motion'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match.'); return }
    try {
      setLoading(true)
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      toast.success('Password reset successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.')
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
        <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">New Password</p>
        <h1 className="font-serif text-3xl font-bold text-white mb-8">Reset Password</h1>

        {done ? (
          <div className="text-center">
            <p className="text-white font-sans mb-4">Your password has been reset successfully.</p>
            <Link to="/login" className="btn-gold text-xs">SIGN IN NOW</Link>
          </div>
        ) : !token ? (
          <p className="text-red-400 font-sans text-sm">Invalid or missing reset token. Please request a new link.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} className="input-luxury" />
            </div>
            <div>
              <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="input-luxury" />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
