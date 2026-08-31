import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminService } from '../services/contentService'
import api from '../services/api'

const ADMIN_TOKEN_KEY = 'aa_admin_token'

export default function AdminLogin() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await adminService.login({ email, password })
      localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token)
      api.defaults.headers.common['X-Admin-Authorization'] = `Bearer ${res.data.token}`
      toast.success('Welcome back, Admin!')
      navigate('/admin')
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 405
          ? 'Backend server not found (HTTP 405). Please verify backend deployment and VITE_API_URL.'
          : !err.response
          ? 'Unable to connect to backend server. Please make sure the API is running.'
          : 'Invalid credentials.')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="w-14 h-14 mx-auto border-2 border-gold flex items-center justify-center mb-4">
            <Lock size={22} className="text-gold" />
          </div>
          <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Admin Panel</p>
          <h1 className="font-serif text-3xl font-bold text-white">Sign In</h1>
          <p className="text-gray-mid text-sm font-sans mt-2">All Available — Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-xs">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-luxury" placeholder="admin@allavailable.com" />
          </div>
          <div>
            <label className="label-xs">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input-luxury pr-12" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-white">
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
