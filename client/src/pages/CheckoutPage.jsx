import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, MapPin, ShoppingBag, ChevronRight, Tag } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { orderService } from '../services/orderService'
import { couponService } from '../services/contentService'

const CITIES = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala']

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: Address, 2: Review & Place
  const [placing, setPlacing] = useState(false)

  const [address, setAddress] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    province: 'Punjab',
    postalCode: '',
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode]   = useState('')
  const [couponData, setCouponData]   = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [notes, setNotes]             = useState('')

  const shipping = cartSubtotal >= 5000 ? 0 : 200
  const discount = couponData?.discountAmount || 0
  const total    = cartSubtotal + shipping - discount

  const handleAddressChange = (e) => setAddress(a => ({ ...a, [e.target.name]: e.target.value }))

  const validateAddress = () => {
    if (!address.fullName || !address.phone || !address.address || !address.city) {
      toast.error('Please fill in all required address fields.')
      return false
    }
    return true
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      setCouponLoading(true)
      const res = await couponService.validate({ code: couponCode, orderTotal: cartSubtotal })
      setCouponData(res.data.coupon)
      toast.success(`Coupon applied! You save Rs. ${res.data.coupon.discountAmount}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon.')
      setCouponData(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const placeOrder = async () => {
    if (!validateAddress()) return
    if (cart.length === 0) { toast.error('Your cart is empty.'); return }

    try {
      setPlacing(true)
      const res = await orderService.create({
        items: cart.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: couponData?.code || '',
        customerNotes: notes,
      })
      clearCart()
      toast.success('Order placed successfully!')
      navigate(`/order-confirmation/${res.data.order.orderId}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black-premium border-b border-white/5 py-8">
        <div className="container-luxury">
          <div className="flex items-center gap-6">
            <Step n={1} label="Shipping"       active={step >= 1} />
            <ChevronRight size={14} className="text-gray-mid" />
            <Step n={2} label="Review & Pay"   active={step >= 2} />
          </div>
        </div>
      </div>

      <div className="container-luxury py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left — Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1 — Shipping Address */}
            <SectionCard title="Shipping Address" icon={MapPin} active={step === 1}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *',  name: 'fullName',  type: 'text',  placeholder: 'Recipient full name' },
                  { label: 'Phone *',      name: 'phone',     type: 'tel',   placeholder: '+92 3xx xxxxxxx' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="label-xs">{f.label}</label>
                    <input type={f.type} name={f.name} value={address[f.name]} onChange={handleAddressChange} placeholder={f.placeholder} className="input-luxury" />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="label-xs">Address *</label>
                  <input type="text" name="address" value={address.address} onChange={handleAddressChange} placeholder="Street address, area, landmark" className="input-luxury" />
                </div>
                <div>
                  <label className="label-xs">City *</label>
                  <select name="city" value={address.city} onChange={handleAddressChange} className="input-luxury">
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Province</label>
                  <select name="province" value={address.province} onChange={handleAddressChange} className="input-luxury">
                    {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'AJK', 'Gilgit-Baltistan'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-xs">Postal Code</label>
                  <input type="text" name="postalCode" value={address.postalCode} onChange={handleAddressChange} placeholder="54000" className="input-luxury" />
                </div>
              </div>

              <div className="mt-4">
                <label className="label-xs">Order Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any special instructions..."
                  className="input-luxury resize-none"
                />
              </div>

              <div className="mt-6">
                <button
                  onClick={() => { if (validateAddress()) setStep(2) }}
                  className="btn-gold text-xs"
                >
                  CONTINUE TO REVIEW
                </button>
              </div>
            </SectionCard>

            {/* Step 2 — Review */}
            {step >= 2 && (
              <SectionCard title="Review & Payment" icon={CreditCard} active={step === 2}>
                {/* Order items */}
                <div className="space-y-3 mb-6">
                  {cart.map(item => (
                    <div key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex gap-3 items-center py-2 border-b border-white/5 last:border-0"
                    >
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-14 h-18 object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-sans line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-mid font-sans">{item.size} / {item.color} · Qty: {item.quantity}</p>
                      </div>
                      <p className="text-gold text-sm font-semibold font-sans flex-shrink-0">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Payment method */}
                <div className="mb-6">
                  <p className="label-xs mb-3">Payment Method</p>
                  <div className="space-y-2">
                    {[
                      { value: 'cod',  label: 'Cash on Delivery',      desc: 'Pay when your order arrives.' },
                      { value: 'bank', label: 'Bank Transfer',          desc: 'Send payment to our bank account.' },
                    ].map(m => (
                      <label key={m.value} className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                        paymentMethod === m.value ? 'border-gold bg-gold/5' : 'border-white/10 hover:border-gold/30'
                      }`}>
                        <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value}
                          onChange={e => setPaymentMethod(e.target.value)} className="accent-gold mt-1" />
                        <div>
                          <p className="text-white text-sm font-sans font-semibold">{m.label}</p>
                          <p className="text-gray-mid text-xs font-sans">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="btn-outline-gold text-xs">
                    BACK
                  </button>
                  <button onClick={placeOrder} disabled={placing} className="btn-gold flex-1 text-xs disabled:opacity-60">
                    <ShoppingBag size={14} />
                    {placing ? 'PLACING ORDER...' : 'PLACE ORDER'}
                  </button>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right — Summary */}
          <div className="lg:col-span-1">
            <div className="bg-black-card border border-white/5 p-6 sticky top-24">
              <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-white mb-6">Order Summary</h3>

              {/* Mini cart */}
              <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={`${item.productId}-${item.size}-${item.color}`} className="flex justify-between text-xs font-sans text-gray-mid">
                    <span className="truncate flex-1 mr-2">{item.name} ×{item.quantity}</span>
                    <span className="flex-shrink-0 text-white">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    className="input-luxury flex-1 text-xs py-2"
                  />
                  <button onClick={applyCoupon} disabled={couponLoading} className="btn-outline-gold text-xs py-2 px-3 flex-shrink-0">
                    <Tag size={12} />
                  </button>
                </div>
                {couponData && (
                  <p className="text-green-400 text-xs font-sans mt-1">
                    ✓ {couponData.code} — Rs. {couponData.discountAmount} saved!
                  </p>
                )}
              </div>

              <div className="divider-gold mb-4" />

              <div className="space-y-2 text-sm font-sans mb-4">
                <div className="flex justify-between text-gray-mid">
                  <span>Subtotal</span>
                  <span className="text-white">Rs. {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-mid">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : 'text-white'}>
                    {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="divider-gold mb-4" />
              <div className="flex justify-between text-white font-bold font-sans text-base">
                <span>Total</span>
                <span>Rs. {total.toLocaleString()}</span>
              </div>

              <p className="text-xs text-gray-mid font-sans mt-4">
                Free delivery on orders above Rs. 5,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({ n, label, active }) {
  return (
    <div className={`flex items-center gap-2 ${active ? 'text-gold' : 'text-gray-mid'}`}>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans border-2 ${
        active ? 'border-gold bg-gold text-black' : 'border-white/20'
      }`}>{n}</span>
      <span className="text-xs font-sans font-semibold tracking-widest uppercase">{label}</span>
    </div>
  )
}

function SectionCard({ title, icon: Icon, active, children }) {
  return (
    <div className={`border ${active ? 'border-gold/30' : 'border-white/5'} p-6 transition-all duration-300`}>
      <div className="flex items-center gap-2 mb-6">
        <Icon size={18} className="text-gold" />
        <h2 className="font-sans font-bold text-white tracking-widest uppercase text-sm">{title}</h2>
      </div>
      {children}
    </div>
  )
}
