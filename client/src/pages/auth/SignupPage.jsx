import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const [params] = useSearchParams()

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    try {
      setLoading(true)
      await register(form.fullName, form.email, form.phone, form.password)
      toast.success('Account created! Welcome to All Available.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Right — decorative panel */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80"
          alt="Fashion"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-start justify-end p-12">
          <p className="font-serif text-4xl font-bold text-white mb-2">Premium Fashion.</p>
          <p className="font-serif text-4xl font-bold text-gold">Exceptional Style.</p>
        </div>
      </div>

      {/* Left — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
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

          <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">New Here?</p>
          <h1 className="font-serif text-3xl font-bold text-white mb-8">Create Account</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name', name: 'fullName', type: 'text',     placeholder: 'Your full name', required: true },
              { label: 'Email',     name: 'email',    type: 'email',    placeholder: 'your@email.com', required: true },
              { label: 'Phone',     name: 'phone',    type: 'tel',      placeholder: '+92 3xx xxxxxxx',required: false },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">
                  {f.label} {!f.required && <span className="text-white/30">(optional)</span>}
                </label>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={onChange}
                  required={f.required}
                  placeholder={f.placeholder}
                  className="input-luxury"
                />
              </div>
            ))}

            <div>
              <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  minLength={8}
                  placeholder="Min 8 characters"
                  className="input-luxury pr-12"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-mid hover:text-white">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-mid font-sans font-semibold tracking-widest uppercase mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                required
                placeholder="Re-enter password"
                className="input-luxury"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60 mt-2">
              <UserPlus size={15} />
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div className="divider-gold mt-8 mb-6" />
          <p className="text-center text-gray-mid text-sm font-sans">
            Already have an account?{' '}
            <Link
              to={`/login${params.get('redirect') ? `?redirect=${params.get('redirect')}` : ''}`}
              className="text-gold hover:text-gold-soft font-semibold"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
