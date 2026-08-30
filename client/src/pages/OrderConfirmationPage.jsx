import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { orderService } from '../services/orderService'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    // orderId here is the readable ID like AA-20260830-1234
    // We search the customer's orders for it
    orderService.getMyOrders({ limit: 5 })
      .then(res => {
        const found = res.data.orders?.find(o => o.orderId === orderId)
        if (found) setOrder(found)
      })
      .catch(() => {})
  }, [orderId])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-lg w-full"
      >
        <div className="mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto rounded-full bg-gold/10 border-2 border-gold flex items-center justify-center mb-6"
          >
            <CheckCircle size={36} className="text-gold" />
          </motion.div>

          <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Order Confirmed!</p>
          <h1 className="font-serif text-4xl font-bold text-white mb-4">Thank You!</h1>
          <p className="text-gray-mid text-sm font-sans leading-relaxed">
            Your order has been placed successfully. We'll begin processing it right away.
          </p>
        </div>

        {order && (
          <div className="bg-black-card border border-gold/15 p-6 mb-8 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-gold" />
              <span className="text-white font-sans font-bold text-sm">Order Details</span>
            </div>
            <div className="space-y-2 text-sm font-sans">
              <div className="flex justify-between text-gray-mid">
                <span>Order ID</span>
                <span className="text-white font-semibold">{order.orderId}</span>
              </div>
              <div className="flex justify-between text-gray-mid">
                <span>Status</span>
                <span className="text-gold capitalize font-semibold">{order.orderStatus}</span>
              </div>
              <div className="flex justify-between text-gray-mid">
                <span>Payment</span>
                <span className="text-white capitalize">{order.paymentMethod?.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-gray-mid">
                <span>Total</span>
                <span className="text-white font-bold">Rs. {order.grandTotal?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/account/orders" className="btn-gold text-xs">
            <Package size={14} />
            MY ORDERS
          </Link>
          <Link to="/shop" className="btn-outline-gold text-xs">
            CONTINUE SHOPPING <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
