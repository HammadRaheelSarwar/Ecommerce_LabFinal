import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, ArrowLeft } from 'lucide-react'
import { orderService } from '../../services/orderService'

const STATUS_STEPS = ['new', 'confirmed', 'processing', 'shipped', 'delivered']

export default function OrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderService.getMyOrderById(id)
      .then(res => setOrder(res.data.order))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="h-64 skeleton" />
  if (!order) return <p className="text-gray-mid text-sm font-sans">Order not found.</p>

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/account/orders" className="text-gray-mid hover:text-gold transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h2 className="font-sans font-bold text-white text-sm tracking-widest uppercase">
          Order {order.orderId}
        </h2>
      </div>

      {/* Status tracker */}
      {order.orderStatus !== 'cancelled' && (
        <div className="bg-black-card border border-white/5 p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-white/5">
              <div
                className="h-full bg-gold transition-all duration-700"
                style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
              />
            </div>
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                  i <= currentStep ? 'border-gold bg-gold text-black' : 'border-white/20 bg-black text-gray-mid'
                }`}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span className={`text-[9px] mt-1 tracking-widest uppercase font-sans capitalize ${
                  i <= currentStep ? 'text-gold' : 'text-gray-mid'
                }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-black-card border border-white/5 p-6">
        <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase mb-4">Items Ordered</h3>
        <div className="space-y-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 py-3 border-b border-white/5 last:border-0">
              {item.image && <img src={item.image} alt={item.name} className="w-14 h-18 object-cover flex-shrink-0" />}
              <div className="flex-1">
                <p className="text-white text-sm font-sans font-medium">{item.name}</p>
                <p className="text-gray-mid text-xs font-sans">{item.size} / {item.color} · Qty: {item.quantity}</p>
                <p className="text-gold text-sm font-semibold mt-1">Rs. {item.totalPrice?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-black-card border border-white/5 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase mb-3">Shipping To</h3>
          <div className="text-gray-mid text-sm font-sans space-y-1">
            <p className="text-white font-semibold">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.address}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.province}</p>
            <p>{order.shippingAddress?.phone}</p>
          </div>
        </div>
        <div>
          <h3 className="font-sans font-bold text-white text-xs tracking-widest uppercase mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm font-sans">
            {[
              { label: 'Subtotal',  value: `Rs. ${order.subtotal?.toLocaleString()}` },
              { label: 'Shipping',  value: order.shippingCost === 0 ? 'FREE' : `Rs. ${order.shippingCost}` },
              { label: 'Discount',  value: order.discount > 0 ? `-Rs. ${order.discount?.toLocaleString()}` : null },
              { label: 'Total',     value: `Rs. ${order.grandTotal?.toLocaleString()}`, bold: true },
              { label: 'Payment',   value: order.paymentMethod?.toUpperCase() },
            ].filter(r => r.value).map(row => (
              <div key={row.label} className={`flex justify-between ${row.bold ? 'text-white font-bold border-t border-white/5 pt-2 mt-2' : 'text-gray-mid'}`}>
                <span>{row.label}</span>
                <span className={row.bold ? 'text-white' : 'text-white'}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
