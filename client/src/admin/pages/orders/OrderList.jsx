import { useState, useEffect } from 'react'
import { orderService } from '../../../services/orderService'
import { Link } from 'react-router-dom'
import { Eye, Search } from 'lucide-react'
import { TableRowSkeleton } from '../../../components/ui/Skeleton'

const STATUS_COLORS = {
  new:        'text-blue-400',
  confirmed:  'text-cyan-400',
  processing: 'text-yellow-400',
  shipped:    'text-purple-400',
  delivered:  'text-green-400',
  cancelled:  'text-red-400',
}

export default function OrderList() {
  const [orders, setOrders]  = useState([])
  const [loading, setLoading]= useState(true)
  const [search, setSearch]  = useState('')
  const [status, setStatus]  = useState('')
  const [page, setPage]      = useState(1)
  const [total, setTotal]    = useState(0)

  const load = () => {
    setLoading(true)
    orderService.getAll({ page, limit: 20, search, status })
      .then(r => { setOrders(r.data.orders || []); setTotal(r.data.pagination?.total || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(load, [page, search, status])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">Orders</h1>
        <p className="text-gray-mid text-sm font-sans">{total} orders total</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-mid" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Order ID..." className="input-luxury pl-9 text-xs py-2" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-luxury text-xs py-2">
          <option value="">All Status</option>
          {['new', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-black-surface border border-white/5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Payment', 'Date', 'Action'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-mid font-sans">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2,3,4,5].map(i => <TableRowSkeleton key={i} cols={8} />) : orders.map(o => (
              <tr key={o._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-gold text-xs font-sans font-semibold">{o.orderId}</td>
                <td className="px-4 py-3 text-white text-xs font-sans">{o.customer?.fullName || '—'}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{o.items?.length}</td>
                <td className="px-4 py-3 text-white text-xs font-sans font-semibold">Rs. {o.grandTotal?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold capitalize font-sans ${STATUS_COLORS[o.orderStatus]}`}>
                    {o.orderStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans uppercase">{o.paymentMethod}</td>
                <td className="px-4 py-3 text-gray-mid text-xs font-sans">{new Date(o.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <Link to={`/admin/orders/${o._id}`} className="p-1.5 text-gray-mid hover:text-gold transition-colors inline-block">
                    <Eye size={13} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
