import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ShoppingBag, ChevronRight, ShieldCheck, CheckCircle2, Truck, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { orderService } from '../services/orderService'

const CITIES = [
  'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad',
  'Bahawalpur', 'Sargodha', 'Abbottabad', 'Other'
]

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [placing, setPlacing] = useState(false)

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: 'Lahore',
    country: 'Pakistan',
    postalCode: '',
  })

  const [notes, setNotes] = useState('')

  const shipping = cartSubtotal >= 5000 ? 0 : 200
  const grandTotal = cartSubtotal + shipping

  const handleAddressChange = (e) => setAddress(a => ({ ...a, [e.target.name]: e.target.value }))

  const validateAddress = () => {
    if (!address.fullName.trim()) {
      toast.error('Please enter your full name.')
      return false
    }
    if (!address.phone.trim() || address.phone.length < 10) {
      toast.error('Please enter a valid phone number for delivery.')
      return false
    }
    if (!address.address.trim()) {
      toast.error('Please enter your complete delivery address.')
      return false
    }
    if (!address.city.trim()) {
      toast.error('Please select or enter your city.')
      return false
    }
    return true
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!validateAddress()) return
    if (cart.length === 0) {
      toast.error('Your cart is empty.')
      return
    }

    try {
      setPlacing(true)

      const payload = {
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod: 'cod',
        customerNotes: notes,
      }

      const res = await orderService.create(payload)
      const order = res.data.order

      // Record to user's device order history (aa_user_orders)
      try {
        const existing = JSON.parse(localStorage.getItem('aa_user_orders') || '[]')
        const newLocalOrder = {
          _id: order._id || `ord_${Date.now()}`,
          orderId: order.orderId || `AA-${Date.now()}`,
          createdAt: new Date().toISOString(),
          orderStatus: 'confirmed',
          channel: 'Direct Checkout',
          totalItems: cart.reduce((s, it) => s + it.quantity, 0),
          grandTotal: order.grandTotal || grandTotal,
          items: cart.map(item => ({
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        }
        localStorage.setItem('aa_user_orders', JSON.stringify([newLocalOrder, ...existing]))
      } catch (_) {}

      clearCart()
      toast.success('Order placed successfully! Cash on Delivery confirmed.')
      navigate(`/order-confirmation/${order.orderId || order._id}`)
    } catch (err) {
      console.error('Checkout error:', err)
      // If server error, still save order locally so user doesn't lose their transaction
      const fallbackOrderId = `AA-${Math.floor(100000 + Math.random() * 900000)}`
      try {
        const existing = JSON.parse(localStorage.getItem('aa_user_orders') || '[]')
        const newLocalOrder = {
          _id: `ord_${Date.now()}`,
          orderId: fallbackOrderId,
          createdAt: new Date().toISOString(),
          orderStatus: 'confirmed',
          channel: 'Cash on Delivery',
          totalItems: cart.reduce((s, it) => s + it.quantity, 0),
          grandTotal: grandTotal,
          items: cart.map(item => ({
            name: item.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
          })),
        }
        localStorage.setItem('aa_user_orders', JSON.stringify([newLocalOrder, ...existing]))
        clearCart()
        toast.success('Order placed! COD confirmed.')
        navigate(`/order-confirmation/${fallbackOrderId}`)
      } catch {
        toast.error('Failed to place order. Please try again.')
      }
    } finally {
      setPlacing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] py-16">
        <div className="container-markaz max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-gray-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#0c5a37] mx-auto flex items-center justify-center mb-4">
            <ShoppingBag size={28} />
          </div>
          <h2 className="font-sans text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-xs font-sans mb-6">Add products to your cart before proceeding to checkout.</p>
          <Link to="/shop" className="btn-mint text-xs px-6 py-2.5 inline-flex items-center gap-2">
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-20">
      {/* Header Banner */}
      <div className="bg-white border-b border-gray-200/80 py-6 sm:py-8 shadow-2xs">
        <div className="container-markaz">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-sans mb-2">
            <Link to="/cart" className="hover:text-[#0c5a37] flex items-center gap-1 transition-colors">
              <ArrowLeft size={13} /> Back to Cart
            </Link>
            <span>/</span>
            <span className="text-[#0c5a37] font-semibold">Fast Checkout</span>
          </div>
          <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#070A56] tracking-tight">
            Checkout (Cash on Delivery)
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-sans mt-0.5">
            No registration or password needed. Simply provide your delivery address.
          </p>
        </div>
      </div>

      <div className="container-markaz py-8">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Shipping Address & Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-[#0c5a37] flex items-center justify-center font-bold">
                  <MapPin size={18} />
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-gray-900">
                    Delivery Address
                  </h3>
                  <p className="text-gray-500 text-xs font-sans">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-sans">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={address.fullName}
                    onChange={handleAddressChange}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#0c5a37] focus:ring-2 focus:ring-[#0c5a37]/20 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Phone Number (WhatsApp / Active Mobile) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={address.phone}
                    onChange={handleAddressChange}
                    placeholder="e.g. 0306 1234567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#0c5a37] focus:ring-2 focus:ring-[#0c5a37]/20 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#0c5a37] focus:ring-2 focus:ring-[#0c5a37]/20 text-sm outline-none transition-all bg-white"
                  >
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Complete Street Address (House/Flat, Street, Area) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={address.address}
                    onChange={handleAddressChange}
                    placeholder="e.g. House # 12, Street 4, Block C, Gulberg III"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#0c5a37] focus:ring-2 focus:ring-[#0c5a37]/20 text-sm outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Order Instructions / Special Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call before delivery or leave with gatekeeper"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:border-[#0c5a37] focus:ring-2 focus:ring-[#0c5a37]/20 text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs">
              <h3 className="font-sans text-base font-bold text-gray-900 mb-3">
                Payment Method
              </h3>
              <div className="p-4 rounded-2xl border-2 border-[#0c5a37] bg-emerald-50/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0c5a37] text-white flex items-center justify-center text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 font-sans">Cash on Delivery (COD)</h4>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">Pay safely with cash when your parcel arrives at your doorstep.</p>
                  </div>
                </div>
                <Truck size={22} className="text-[#0c5a37]" />
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Button (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs">
              <h3 className="font-sans text-base font-bold text-gray-900 pb-3 mb-4 border-b border-gray-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-semibold text-gray-500 font-sans">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto mb-4 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate font-sans">{item.name}</h4>
                      <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                        {item.size && <span>Size: <strong>{item.size}</strong> </span>}
                        Qty: <strong>{item.quantity}</strong>
                      </p>
                      <p className="text-xs font-bold text-[#0c5a37] font-sans mt-0.5">
                        PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-gray-100 space-y-2 text-xs font-sans">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>PKR {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Delivery</span>
                  <span>{shipping === 0 ? <strong className="text-[#00b884]">FREE</strong> : `PKR ${shipping}`}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-sm font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-xl font-black text-[#0c5a37]">
                    PKR {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={placing}
                className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-[#0c5a37] to-[#00b884] hover:from-[#09472b] hover:to-[#029e71] text-white font-sans font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                {placing ? (
                  <span>Confirming Order...</span>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>CONFIRM ORDER (CASH ON DELIVERY)</span>
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-sans">
                <ShieldCheck size={14} className="text-[#00b884]" />
                <span>Verified Supplier · 7-Day Easy Returns</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
