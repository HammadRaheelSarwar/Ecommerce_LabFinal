import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, Package, MessageSquare, ArrowRight, Home } from 'lucide-react'

export default function OrderConfirmationPage() {
  const { orderId } = useParams()
  const [localOrder, setLocalOrder] = useState(null)
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '+923064538251'

  useEffect(() => {
    try {
      const existing = JSON.parse(localStorage.getItem('aa_user_orders') || '[]')
      const found = existing.find(o => o.orderId === orderId || o._id === orderId)
      if (found) setLocalOrder(found)
    } catch (_) {}
  }, [orderId])

  const waTrackMessage = encodeURIComponent(
    `Hello All Available, I just placed Order #${orderId}. Please confirm my parcel dispatch timeline.`
  )
  const waUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${waTrackMessage}`

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white rounded-3xl p-7 sm:p-9 border border-gray-200 shadow-sm text-center"
      >
        {/* Checkmark Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto rounded-full bg-emerald-50 border-2 border-[#00b884] flex items-center justify-center mb-5 text-[#00b884]"
        >
          <CheckCircle2 size={42} />
        </motion.div>

        <span className="text-[11px] font-bold text-[#00b884] uppercase tracking-wider block mb-1">
          Cash On Delivery Confirmed
        </span>
        <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#070A56] tracking-tight mb-2">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm font-sans mb-6 leading-relaxed">
          Thank you for shopping with All Available. Your parcel will be verified and dispatched within 24 hours.
        </p>

        {/* Order Details Card */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 sm:p-5 border border-emerald-100/90 text-left mb-6 font-sans">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-200/60 text-xs">
            <span className="text-gray-600 font-medium">Order Reference:</span>
            <strong className="text-gray-900 font-extrabold text-sm">{orderId}</strong>
          </div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600">Payment:</span>
            <span className="font-bold text-[#0c5a37]">Cash on Delivery (COD)</span>
          </div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-600">Delivery Status:</span>
            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">Order Placed</span>
          </div>
          {localOrder && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/60">
              <span className="text-gray-600">Total Amount:</span>
              <strong className="text-base font-black text-[#0c5a37]">
                PKR {localOrder.grandTotal?.toLocaleString()}
              </strong>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <MessageSquare size={17} className="fill-white" />
            <span>Confirm / Track on WhatsApp</span>
          </a>

          <Link
            to="/orders"
            className="w-full py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 font-sans font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Package size={16} className="text-[#0c5a37]" />
            <span>View in My Orders List</span>
          </Link>

          <Link
            to="/shop"
            className="text-xs font-bold text-[#0c5a37] hover:underline inline-flex items-center gap-1 mt-2 font-sans cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
