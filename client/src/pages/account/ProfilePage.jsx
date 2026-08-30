import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../../services/api'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
  })
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await api.put('/users/profile', form)
      await refreshUser()
      toast.success('Profile updated successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-black-card border border-white/5 p-6">
      <h2 className="font-sans font-bold text-white tracking-widest uppercase text-sm mb-6">Edit Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
        <div>
          <label className="label-xs">Full Name</label>
          <input type="text" name="fullName" value={form.fullName} onChange={onChange} className="input-luxury" />
        </div>
        <div>
          <label className="label-xs">Email</label>
          <input type="email" value={user?.email || ''} disabled className="input-luxury opacity-50 cursor-not-allowed" />
          <p className="text-gray-mid text-xs font-sans mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="label-xs">Phone</label>
          <input type="tel" name="phone" value={form.phone} onChange={onChange} placeholder="+92 3xx xxxxxxx" className="input-luxury" />
        </div>
        <button type="submit" disabled={loading} className="btn-gold text-xs disabled:opacity-60">
          {loading ? 'SAVING...' : 'SAVE CHANGES'}
        </button>
      </form>
    </div>
  )
}
