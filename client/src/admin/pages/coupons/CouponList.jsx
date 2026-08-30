import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { couponService } from '../../../services/contentService'
import Modal from '../../../components/ui/Modal'

const EMPTY = {
  code: '', discountType: 'percentage', discountValue: '', minOrderAmount: '',
  maxUses: '', startDate: '', endDate: '', isActive: true, description: ''
}

export default function CouponList() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [deleteId, setDeleteId] = useState(null)

  const load = () => {
    couponService.getAll()
      .then(r => setCoupons(r.data.coupons || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async () => {
    if (!form.code || !form.discountValue) { toast.error('Code and discount value required.'); return }
    try {
      await couponService.create(form)
      toast.success('Coupon created.')
      setAdding(false); setForm(EMPTY); load()
    } catch (err) { toast.error(err.response?.data?.message || 'Create failed.') }
  }

  const handleDelete = async () => {
    try {
      await couponService.delete(deleteId)
      toast.success('Coupon deleted.')
      setDeleteId(null); load()
    } catch (_) { toast.error('Delete failed.') }
  }

  const toggleActive = async (id, current) => {
    await couponService.update(id, { isActive: !current })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-white">Coupons</h1>
        <button onClick={() => setAdding(true)} className="btn-gold text-xs py-2"><Plus size={13} /> ADD COUPON</button>
      </div>

      {adding && (
        <div className="bg-black-surface border border-gold/20 p-5 space-y-4">
          <h3 className="text-xs font-bold text-gold tracking-widest uppercase">New Coupon</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label-xs">Code *</label>
              <input type="text" name="code" value={form.code} onChange={onChange} className="input-luxury uppercase" />
            </div>
            <div>
              <label className="label-xs">Type</label>
              <select name="discountType" value={form.discountType} onChange={onChange} className="input-luxury">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (Rs.)</option>
              </select>
            </div>
            <div>
              <label className="label-xs">Value *</label>
              <input type="number" name="discountValue" value={form.discountValue} onChange={onChange} min={0} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">Min Order (Rs.)</label>
              <input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={onChange} min={0} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">Max Uses</label>
              <input type="number" name="maxUses" value={form.maxUses} onChange={onChange} min={0} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">Start Date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={onChange} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">End Date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={onChange} className="input-luxury" />
            </div>
            <div>
              <label className="label-xs">Description</label>
              <input type="text" name="description" value={form.description} onChange={onChange} className="input-luxury" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-gold text-xs py-2"><Check size={12} /> CREATE</button>
            <button onClick={() => setAdding(false)} className="btn-outline-gold text-xs py-2"><X size={12} /> CANCEL</button>
          </div>
        </div>
      )}

      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Code', 'Type', 'Value', 'Min Order', 'Used/Max', 'Expires', 'Active', 'Del'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? null : coupons.map(c => (
              <tr key={c._id} className="border-b border-white/5">
                <td className="px-4 py-3 text-gold font-bold font-sans text-sm">{c.code}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans capitalize">{c.discountType}</td>
                <td className="px-4 py-3 text-white text-xs font-sans">{c.discountType === 'percentage' ? `${c.discountValue}%` : `Rs. ${c.discountValue}`}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{c.minOrderAmount ? `Rs. ${c.minOrderAmount}` : '—'}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{c.usedCount || 0}/{c.maxUses || '∞'}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{c.endDate ? new Date(c.endDate).toLocaleDateString() : '∞'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(c._id, c.isActive)}
                    className={`text-[10px] font-bold px-2 py-0.5 font-sans ${c.isActive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    {c.isActive ? 'YES' : 'NO'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDeleteId(c._id)} className="text-gray-mid hover:text-red-400 p-1"><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Coupon" message="This coupon will be permanently deleted."
        confirmText="DELETE" confirmClass="bg-red-500 text-white text-xs font-bold flex-1 py-2.5" />
    </div>
  )
}
