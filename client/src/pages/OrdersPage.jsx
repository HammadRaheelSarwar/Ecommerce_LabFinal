import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, MessageSquare, ChevronRight, ShoppingBag, ExternalLink, Calendar, CheckCircle2, Truck, Clock } from 'lucide-react'
import { orderService } from '../services/orderService'

const STATUS_CONFIG = {
  confirmed:  { label: 'Order Placed',  color: 'bg-emerald-50 text-[#0c5a37] border-emerald-200', icon: CheckCircle2 },
  processing: { label: 'Processing',    color: 'bg-blue-50 text-blue-700 border-blue-200',       icon: Clock },
  shipped:    { label: 'In Transit',    color: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Truck },
  delivered:  { label: 'Delivered',     color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',     color: 'bg-rose-50 text-rose-700 border-rose-200',       icon: CheckCircle2 },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+923064538251'

  useEffect(() => {
    // 1. Read device-specific orders
    let localOrders = []
    try {
      localOrders = JSON.parse(localStorage.getItem('aa_user_orders') || '[]')
    } catch (_) {}

    // 2. Try fetching server orders (if customer token exists)
    orderService.getMyOrders({ limit: 50 })
      .then(res => {
        const serverOrders = res.data.orders || []
        // Merge without duplicate orderId
        const existingIds = new Set(serverOrders.map(o => o.orderId || o._id))
        const combined = [...serverOrders]
        localOrders.forEach(o => {
          if (!existingIds.has(o.orderId) && !existingIds.has(o._id)) {
            combined.push(o)
          }
        })
        combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setOrders(combined)
      })
      .catch(() => {
        // Fallback to local device orders
        setOrders(localOrders)
      })
      .finally(() => setLoading(false))
  }, [])

  // Calculate totals
  const totalOrdersCount = orders.length
  const totalProductsCount = orders.reduce((sum, order) => {
    const itemsCount = (order.items || []).reduce((s, it) => s + (it.quantity || 1), 0)
    return sum + (itemsCount || order.totalItems || 1)
  }, 0)

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-20">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-gray-200/80 py-8 sm:py-10 shadow-2xs">
        <div className="container-markaz">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-3">
            <Link to="/" className="hover:text-[#0c5a37] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#0c5a37] font-semibold">My Orders</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#070A56] tracking-tight">
                My Orders & Tracking
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm font-sans mt-1">
                Your private device order history. Track each package and its item contents.
              </p>
            </div>

            {/* Summary Pill */}
            {totalOrdersCount > 0 && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl px-4 py-2.5 self-start sm:self-auto shadow-xs">
                <div className="text-center pr-3 border-r border-emerald-200">
                  <span className="block text-lg font-black text-[#0c5a37] leading-none">
                    {totalOrdersCount}
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">
                    {totalOrdersCount === 1 ? 'Order' : 'Orders'}
                  </span>
                </div>
                <div className="text-center pl-1">
                  <span className="block text-lg font-black text-[#00b884] leading-none">
                    {totalProductsCount}
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold uppercase">
                    {totalProductsCount === 1 ? 'Product' : 'Products'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Orders List Content */}
      <div className="container-markaz py-8">
        {loading ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-white rounded-2xl border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl p-12 sm:p-16 text-center max-w-lg mx-auto border border-gray-200/80 shadow-xs my-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0c5a37] mx-auto flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No orders found
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-sans mb-7 leading-relaxed">
              When you purchase or confirm an order on All Available, your order details and items will automatically appear here.
            </p>
            <Link to="/shop" className="btn-mint text-xs px-6 py-3 inline-flex items-center gap-2">
              <ShoppingBag size={15} />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          /* List of orders */
          <div className="max-w-3xl mx-auto space-y-5">
            {orders.map((order, idx) => {
              const statusKey = (order.orderStatus || 'confirmed').toLowerCase()
              const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.confirmed
              const StatusIcon = statusInfo.icon

              const items = order.items || []
              const orderItemsCount = items.reduce((s, it) => s + (it.quantity || 1), 0) || order.totalItems || 1
              const orderTotal = order.grandTotal || order.totalPrice || 0

              const waTrackMessage = encodeURIComponent(
                `Hello All Available, I would like to check the status of my Order #${order.orderId || order._id}.`
              )
              const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${waTrackMessage}`

              return (
                <div
                  key={order._id || idx}
                  className="bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-5 bg-gray-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/70 text-[#0c5a37] flex items-center justify-center font-bold">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-sans font-bold text-gray-900 text-sm sm:text-base">
                            Order #{order.orderId || order._id}
                          </h3>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                            <StatusIcon size={12} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-gray-500 text-xs font-sans flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* WhatsApp Track Action */}
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-emerald-900 border border-[#25D366]/40 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <MessageSquare size={14} className="text-[#25D366] fill-[#25D366]" />
                      <span>Track on WhatsApp</span>
                    </a>
                  </div>

                  {/* Order Items Section */}
                  <div className="p-4 sm:p-5 divide-y divide-gray-100">
                    {items.map((item, itemIdx) => {
                      const itemImg = item.image || item.product?.images?.[0]?.url || item.product?.image || '/images/placeholder.jpg'
                      const itemName = item.name || item.product?.name || 'Product'
                      const itemSlug = item.product?.slug

                      return (
                        <div key={itemIdx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3.5">
                          {/* Thumbnail */}
                          <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0">
                            <img
                              src={itemImg}
                              alt={itemName}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/images/placeholder.jpg' }}
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            {itemSlug ? (
                              <Link
                                to={`/product/${itemSlug}`}
                                className="font-sans font-bold text-gray-900 text-sm hover:text-[#0c5a37] truncate block transition-colors"
                              >
                                {itemName}
                              </Link>
                            ) : (
                              <h4 className="font-sans font-bold text-gray-900 text-sm truncate">
                                {itemName}
                              </h4>
                            )}
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-sans mt-0.5">
                              {item.size && <span>Size: <strong className="text-gray-800">{item.size}</strong></span>}
                              {item.color && <span>Color: <strong className="text-gray-800">{item.color}</strong></span>}
                              <span>Qty: <strong className="text-gray-800">{item.quantity || 1}</strong></span>
                            </div>
                            <p className="text-xs font-semibold text-emerald-800 font-sans mt-0.5">
                              PKR {(item.price || 0).toLocaleString()} each
                            </p>
                          </div>

                          {/* Subtotal */}
                          <div className="text-right flex-shrink-0">
                            <span className="text-sm font-extrabold text-[#0c5a37] font-sans block">
                              PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Order Footer Bar */}
                  <div className="px-4 sm:px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2 text-xs font-sans">
                    <span className="text-gray-500">
                      Total Products: <strong className="text-gray-900">{orderItemsCount}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Total Amount:</span>
                      <span className="text-base font-black text-[#0c5a37]">
                        PKR {orderTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
