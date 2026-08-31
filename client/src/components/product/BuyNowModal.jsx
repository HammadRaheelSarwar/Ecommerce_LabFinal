import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquare, Mail, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { analyticsService } from '../../services/analyticsService'

export default function BuyNowModal({
  isOpen,
  onClose,
  product,
  selectedSize,
  selectedColor,
  quantity,
  settings,
}) {
  if (!isOpen || !product) return null

  const unitPrice = product.salePrice || product.basePrice || 0
  const totalPrice = unitPrice * quantity
  const mainImg = product.images?.find(i => i.isMain) || product.images?.[0]
  const imageUrl = mainImg?.url || ''
  const productCode = product.sku || `AA-${(product._id || 'PROD').slice(-6).toUpperCase()}`
  const productUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/product/${product.slug}`
    : `/product/${product.slug}`

  // Business contact configs
  const whatsappNumber = (
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    settings?.ordering?.whatsappNumber ||
    settings?.contact?.whatsapp ||
    '+923064538251'
  ).replace(/[^0-9]/g, '')

  const orderEmail = (
    import.meta.env.VITE_ORDER_EMAIL ||
    settings?.ordering?.orderEmail ||
    settings?.contact?.email ||
    'allavailable.shooping@gmail.com'
  ).trim()

  // 1. Prepare WhatsApp Message (Requirement 13)
  const buildWhatsAppMessage = () => {
    let msg = `Hello All Available,\n\nI want to order this product:\n\n`
    msg += `Product: ${product.name}\n`
    msg += `Product Code: ${productCode}\n`
    msg += `Price: PKR ${totalPrice.toLocaleString()}\n`
    if (selectedSize) msg += `Size: ${selectedSize}\n`
    if (selectedColor) msg += `Color: ${selectedColor}\n`
    msg += `Quantity: ${quantity}\n\n`
    msg += `Product Link:\n${productUrl}\n`
    if (imageUrl) {
      msg += `\nProduct Image:\n${imageUrl}\n`
    }
    msg += `\nPlease confirm availability and order details.`
    return msg
  }

  // 2. Prepare Email Subject & Body (Requirements 18 & 19)
  const emailSubject = `Order Inquiry — ${product.name}`
  const buildEmailBody = () => {
    let body = `Hello All Available,\n\nI would like to order the following product:\n\n`
    body += `Product Name:\n${product.name}\n\n`
    body += `Product Code:\n${productCode}\n\n`
    body += `Price:\nPKR ${totalPrice.toLocaleString()}\n\n`
    if (selectedSize) body += `Size:\n${selectedSize}\n\n`
    if (selectedColor) body += `Color:\n${selectedColor}\n\n`
    body += `Quantity:\n${quantity}\n\n`
    body += `Product Link:\n${productUrl}\n`
    if (imageUrl) {
      body += `\nProduct Image:\n${imageUrl}\n`
    }
    body += `\nPlease confirm availability and provide the next steps.\n\nThank you.`
    return body
  }

  const recordLocalOrder = (channel = 'WhatsApp') => {
    try {
      const existing = JSON.parse(localStorage.getItem('aa_user_orders') || '[]')
      const orderNumber = `AA-${Math.floor(100000 + Math.random() * 900000)}`
      const newOrder = {
        _id: `ord_${Date.now()}`,
        orderId: orderNumber,
        createdAt: new Date().toISOString(),
        orderStatus: 'confirmed',
        channel: channel,
        totalItems: quantity,
        grandTotal: totalPrice,
        items: [
          {
            product: {
              _id: product._id,
              name: product.name,
              slug: product.slug,
              images: product.images,
              image: imageUrl,
            },
            name: product.name,
            size: selectedSize || 'Standard',
            color: selectedColor || '',
            quantity: quantity,
            price: price,
            image: imageUrl,
          }
        ]
      }
      localStorage.setItem('aa_user_orders', JSON.stringify([newOrder, ...existing]))
    } catch (_) {}
  }

  const handleWhatsAppOrder = () => {
    analyticsService.trackWhatsAppOrderClick(product, { size: selectedSize, color: selectedColor }, quantity)
    recordLocalOrder('WhatsApp')
    const encoded = encodeURIComponent(buildWhatsAppMessage())
    const url = `https://wa.me/${whatsappNumber}?text=${encoded}`
    window.open(url, '_blank')
    onClose()
  }

  const handleEmailOrder = () => {
    analyticsService.trackEmailOrderClick(product, { size: selectedSize, color: selectedColor }, quantity)
    recordLocalOrder('Email')
    const encodedSubject = encodeURIComponent(emailSubject)
    const encodedBody = encodeURIComponent(buildEmailBody())
    const mailtoUrl = `mailto:${orderEmail}?subject=${encodedSubject}&body=${encodedBody}`
    window.location.href = mailtoUrl
    onClose()
  }

  const handleGmailOrder = () => {
    analyticsService.trackEmailOrderClick(product, { size: selectedSize, color: selectedColor }, quantity)
    recordLocalOrder('Gmail')
    const encodedSubject = encodeURIComponent(emailSubject)
    const encodedBody = encodeURIComponent(buildEmailBody())
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(orderEmail)}&su=${encodedSubject}&body=${encodedBody}`
    window.open(gmailUrl, '_blank')
    onClose()
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-lg bg-white text-gray-900 rounded-3xl border border-gray-200/80 shadow-2xl overflow-hidden z-10 p-6 sm:p-7"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div className="pr-8 mb-5">
            <span className="text-[11px] font-bold text-[#00b884] uppercase tracking-wider block mb-1">
              Direct Concierge Checkout
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl text-gray-900 font-extrabold leading-tight">
              Complete Your Order
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm font-sans mt-1">
              Connect directly with <strong>All Available</strong> via WhatsApp or Email to confirm this item.
            </p>
          </div>

          {/* Product Summary Mini Card */}
          <div className="bg-[#F0FDF4] rounded-2xl p-3.5 border border-[#DCFCE7] flex items-center gap-3.5 mb-6">
            <div className="w-16 h-16 rounded-xl bg-white border border-emerald-100 overflow-hidden flex-shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-gray-900 truncate font-sans">
                {product.name}
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-sans mt-0.5">
                {selectedSize && <span>Size: <strong className="text-gray-800">{selectedSize}</strong></span>}
                {selectedColor && <span>Color: <strong className="text-gray-800">{selectedColor}</strong></span>}
                <span>Qty: <strong className="text-gray-800">{quantity}</strong></span>
              </div>
              <p className="text-sm font-black text-[#0c5a37] font-sans mt-1">
                PKR {totalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="space-y-3 mb-5">
            {/* WhatsApp Option */}
            {product.allowWhatsApp !== false && (
              <button
                onClick={handleWhatsAppOrder}
                className="w-full group bg-emerald-50/70 hover:bg-emerald-100/70 border-2 border-[#25D366]/40 hover:border-[#25D366] rounded-2xl p-4 flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <MessageSquare size={22} className="fill-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900 font-sans flex items-center gap-1.5">
                      Order through WhatsApp
                      <span className="text-[10px] bg-[#25D366] text-white font-bold px-2 py-0.5 rounded-full">
                        Instant
                      </span>
                    </span>
                    <p className="text-xs text-gray-500 font-sans mt-0.5">
                      Fastest confirmation with pre-filled product details.
                    </p>
                  </div>
                </div>
                <ExternalLink size={18} className="text-gray-400 group-hover:text-[#25D366] transition-colors" />
              </button>
            )}

            {/* Email Option */}
            {product.allowEmail !== false && (
              <div className="rounded-2xl border border-gray-200 hover:border-[#0c5a37]/50 bg-gray-50/80 transition-all p-4">
                <button
                  onClick={handleEmailOrder}
                  className="w-full flex items-center justify-between text-left group active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#0c5a37] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Mail size={22} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 font-sans">
                        Order through Email
                      </span>
                      <p className="text-xs text-gray-500 font-sans mt-0.5">
                        Open your email app with pre-filled product details.
                      </p>
                    </div>
                  </div>
                  <ExternalLink size={18} className="text-gray-400 group-hover:text-[#0c5a37] transition-colors" />
                </button>

                {/* Optional Open in Gmail Button */}
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-sans">Using Web Gmail?</span>
                  <button
                    onClick={handleGmailOrder}
                    className="text-[#0c5a37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Open in Gmail →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Guarantee Footer */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 pt-2 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#00b884]" /> Verified Supplier
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-[#00b884]" /> Cash on Delivery Ready
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
