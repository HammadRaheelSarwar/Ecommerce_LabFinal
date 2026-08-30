import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { orderService } from '../../../services/orderService'

const STATUSES = ['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded']

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm]     = useState({ orderStatus: '', paymentStatus: '', adminNotes: '' })
  const [saving, setSaving] = useState(false)

  const load = () => {
    orderService.getById(id)
      .then(r => {
        const o = r.data.order
        setOrder(o)
        setForm({ orderStatus: o.orderStatus, paymentStatus: o.paymentStatus, adminNotes: o.adminNotes || '' })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      await orderService.update(id, form)
      toast.success('Order updated.')
      load()
    } catch (_) { toast.error('Update failed.') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="h-64 skeleton" />
  if (!order) return <p className="text-gray-mid font-sans text-sm">Order not found.</p>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="text-gray-mid hover:text-gold"><ArrowLeft size={18} /></Link>
        <h1 className="font-serif text-2xl font-bold text-white">Order {order.orderId}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label-xs">Order Status</label>
          <select value={form.orderStatus} onChange={e => setForm(f => ({ ...f, orderStatus: e.target.value }))} className="input-luxury">
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label-xs">Payment Status</label>
          <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))} className="input-luxury">
            {PAYMENT_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={handleUpdate} disabled={saving} className="btn-gold text-xs w-full disabled:opacity-60">
            <Save size={13} /> {saving ? 'SAVING...' : 'UPDATE ORDER'}
          </button>
        </div>
      </div>

      <div>
        <label className="label-xs">Admin Notes</label>
        <textarea value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))}
          rows={2} className="input-luxury resize-none" placeholder="Internal notes..." />
      </div>

      {/* Items */}
      <div className="bg-black-surface border border-white/5 p-6">
        <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase mb-4">Items ({order.items?.length})</h3>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0 items-center">
              {item.image && <img src={item.image} alt="" className="w-12 h-14 object-cover flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-white text-sm font-sans">{item.name}</p>
                <p className="text-gray-mid text-xs font-sans">{item.size}/{item.color} · Qty: {item.quantity} · Rs. {item.unitPrice?.toLocaleString()} each</p>
              </div>
              <p className="text-gold font-semibold text-sm font-sans">Rs. {item.totalPrice?.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Info grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-black-surface border border-white/5 p-5">
          <h3 className="label-xs mb-3">Shipping Address</h3>
          <div className="text-sm font-sans text-gray-mid space-y-1">
            <p className="text-white font-semibold">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
            <p>{order.shippingAddress?.phone}</p>
          </div>
        </div>
        <div className="bg-black-surface border border-white/5 p-5">
          <h3 className="label-xs mb-3">Financial Summary</h3>
          <div className="space-y-1.5 text-sm font-sans">
            {[
              { l: 'Subtotal', v: `Rs. ${order.subtotal?.toLocaleString()}` },
              { l: 'Shipping', v: order.shippingCost === 0 ? 'FREE' : `Rs. ${order.shippingCost}` },
              { l: 'Discount', v: order.discount > 0 ? `-Rs. ${order.discount}` : null },
              { l: 'Total',    v: `Rs. ${order.grandTotal?.toLocaleString()}`, bold: true },
            ].filter(r => r.v).map(r => (
              <div key={r.l} className={`flex justify-between ${r.bold ? 'text-white font-bold border-t border-white/5 pt-1.5 mt-1.5' : 'text-gray-mid'}`}>
                <span>{r.l}</span><span className={r.bold ? 'text-white' : 'text-white'}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
