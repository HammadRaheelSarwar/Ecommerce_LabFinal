import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api'

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta']

const EMPTY = { fullName: '', phone: '', address: '', city: '', province: 'Punjab', postalCode: '' }

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null) // null | 'new' | id

  const load = () => {
    api.get('/users/addresses')
      .then(res => setAddresses(res.data.addresses || []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const [form, setForm] = useState(EMPTY)
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error('Please fill required fields.')
      return
    }
    try {
      if (editing === 'new') await api.post('/users/addresses', form)
      else await api.put(`/users/addresses/${editing}`, form)
      toast.success('Address saved!')
      setEditing(null)
      setForm(EMPTY)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return
    await api.delete(`/users/addresses/${id}`)
    toast.success('Address deleted.')
    load()
  }

  const startEdit = (addr) => {
    setForm({ fullName: addr.fullName, phone: addr.phone, address: addr.address, city: addr.city, province: addr.province, postalCode: addr.postalCode })
    setEditing(addr._id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-sans font-bold text-white text-sm tracking-widest uppercase">My Addresses</h2>
        <button onClick={() => { setEditing('new'); setForm(EMPTY) }} className="btn-gold text-xs py-2">
          <Plus size={13} /> ADD NEW
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="bg-black-card border border-gold/20 p-5 space-y-4">
          <h3 className="text-xs font-sans font-bold text-gold tracking-widest uppercase">
            {editing === 'new' ? 'New Address' : 'Edit Address'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Full Name *', name: 'fullName', type: 'text' },
              { label: 'Phone *',     name: 'phone',    type: 'tel' },
            ].map(f => (
              <div key={f.name}>
                <label className="label-xs">{f.label}</label>
                <input type={f.type} name={f.name} value={form[f.name]} onChange={onChange} className="input-luxury" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="label-xs">Address *</label>
              <input type="text" name="address" value={form.address} onChange={onChange} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">City *</label>
              <select name="city" value={form.city} onChange={onChange} className="input-luxury">
                <option value="">Select city</option>
                {CITIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs">Postal Code</label>
              <input type="text" name="postalCode" value={form.postalCode} onChange={onChange} className="input-luxury" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-gold text-xs py-2"><Check size={13} /> SAVE</button>
            <button onClick={() => setEditing(null)} className="btn-outline-gold text-xs py-2"><X size={13} /> CANCEL</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="h-32 skeleton" />
      ) : addresses.length === 0 && !editing ? (
        <div className="text-center py-12 bg-black-card border border-white/5">
          <p className="text-gray-mid text-sm font-sans">No saved addresses. Add one to speed up checkout.</p>
        </div>
      ) : (
        addresses.map(addr => (
          <div key={addr._id} className="bg-black-card border border-white/5 p-5 flex gap-4 items-start justify-between">
            <div className="text-sm font-sans space-y-0.5">
              <p className="text-white font-semibold">{addr.fullName}</p>
              <p className="text-gray-mid">{addr.address}</p>
              <p className="text-gray-mid">{addr.city}, {addr.province} {addr.postalCode}</p>
              <p className="text-gray-mid">{addr.phone}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(addr)} className="p-2 text-gray-mid hover:text-gold transition-colors"><Edit2 size={14} /></button>
              <button onClick={() => handleDelete(addr._id)} className="p-2 text-gray-mid hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
