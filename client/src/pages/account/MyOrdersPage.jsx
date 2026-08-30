import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import { orderService } from '../../services/orderService'

const STATUS_COLORS = {
  new:        'text-blue-400 bg-blue-400/10',
  confirmed:  'text-cyan-400 bg-cyan-400/10',
  processing: 'text-yellow-400 bg-yellow-400/10',
  shipped:    'text-purple-400 bg-purple-400/10',
  delivered:  'text-green-400 bg-green-400/10',
  cancelled:  'text-red-400 bg-red-400/10',
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getMyOrders({ limit: 20 })
      .then(res => setOrders(res.data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 skeleton" />)}
    </div>
  )

  return (
    <div className="space-y-4">
      <h2 className="font-sans font-bold text-white tracking-widest uppercase text-sm mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-black-card border border-white/5">
          <Package size={40} className="text-gold/20 mx-auto mb-3" />
          <p className="font-serif text-xl text-white/50 mb-2">No orders yet</p>
          <p className="text-gray-mid text-sm font-sans mb-6">Explore our collection and place your first order.</p>
          <Link to="/shop" className="btn-gold text-xs">SHOP NOW</Link>
        </div>
      ) : (
        orders.map(order => (
          <Link
            key={order._id}
            to={`/account/orders/${order._id}`}
            className="flex items-center gap-4 bg-black-card border border-white/5 hover:border-gold/20 p-5 transition-all group"
          >
            <Package size={20} className="text-gold flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-white font-sans font-semibold text-sm">{order.orderId}</span>
                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded font-sans ${STATUS_COLORS[order.orderStatus] || 'text-gray-mid bg-white/5'}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-gray-mid text-xs font-sans mt-1">
                {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} item(s) · Rs. {order.grandTotal?.toLocaleString()}
              </p>
            </div>
            <ChevronRight size={16} className="text-gray-mid group-hover:text-gold transition-colors flex-shrink-0" />
          </Link>
        ))
      )}
    </div>
  )
}
