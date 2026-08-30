import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartSubtotal } = useCart()

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white text-gray-900 border-l border-gray-200 z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-[#0c5a37] text-white">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#00b884]" />
                <span className="font-sans text-sm font-bold tracking-wider uppercase">
                  Your Cart ({cart.length})
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1.5 text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto py-4 px-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0c5a37] flex items-center justify-center mb-2">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="font-sans font-bold text-lg text-gray-900">Your cart is empty</p>
                  <p className="text-xs text-gray-500 max-w-xs">
                    Explore trending Pakistani fashion, luxury watches and jewelry.
                  </p>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="btn-forest text-xs mt-3 px-6 py-2.5"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <motion.div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex gap-3 pb-4 border-b border-gray-100 items-center"
                  >
                    <Link
                      to={`/product/${item.slug}`}
                      onClick={() => setCartOpen(false)}
                      className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200/60"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.slug}`}
                        onClick={() => setCartOpen(false)}
                        className="text-xs sm:text-sm font-sans font-bold text-gray-800 hover:text-[#0c5a37] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <div className="text-[11px] text-gray-500 font-sans mt-0.5">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span> | </span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <p className="text-[#0c5a37] text-xs sm:text-sm font-extrabold font-sans mt-1">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-black"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId, item.size, item.color)}
                          className="text-gray-400 hover:text-rose-600 transition-colors ml-auto p-1"
                          title="Remove item"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-gray-100 p-5 space-y-3 bg-gray-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-600 font-sans">Subtotal</span>
                  <span className="text-base font-extrabold text-[#0c5a37] font-sans">
                    PKR {cartSubtotal.toLocaleString()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-sans">
                  Free delivery across Pakistan on orders above PKR 5,000.
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="btn-mint w-full py-3 text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md"
                >
                  PROCEED TO CHECKOUT <ArrowRight size={14} />
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setCartOpen(false)}
                  className="block text-center text-xs font-bold text-[#0c5a37] hover:underline pt-1"
                >
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
