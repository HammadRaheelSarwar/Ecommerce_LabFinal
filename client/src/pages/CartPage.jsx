import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartSubtotal, setCartOpen } = useCart()

  const shipping = cartSubtotal >= 5000 ? 0 : 200
  const total = cartSubtotal + shipping

  return (
    <div className="min-h-screen bg-black">
      <div className="bg-black-premium border-b border-white/5 py-12 text-center">
        <p className="text-gold text-xs tracking-[0.4em] uppercase font-sans mb-2">Shopping</p>
        <h1 className="font-serif text-4xl font-bold text-white">YOUR BAG</h1>
      </div>

      <div className="container-luxury py-10">
        {cart.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center">
            <ShoppingBag size={48} className="text-gold/20 mb-4" />
            <p className="font-serif text-2xl text-white/50 mb-3">Your bag is empty</p>
            <p className="text-gray-mid text-sm font-sans mb-8">Add something beautiful to get started.</p>
            <Link to="/shop" className="btn-gold text-xs">EXPLORE COLLECTION</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-white/10 text-xs font-sans font-bold tracking-widest uppercase text-gray-mid">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Size</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {cart.map(item => (
                <div key={`${item.productId}-${item.size}-${item.color}`}
                  className="grid grid-cols-12 gap-4 py-4 border-b border-white/5 items-center"
                >
                  {/* Image + Name */}
                  <div className="col-span-7 md:col-span-6 flex gap-3 items-start">
                    <Link to={`/product/${item.slug}`} className="w-20 h-24 flex-shrink-0 bg-black-card overflow-hidden">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                    </Link>
                    <div>
                      <Link to={`/product/${item.slug}`} className="text-sm font-sans text-white hover:text-gold transition-colors font-medium line-clamp-2">
                        {item.name}
                      </Link>
                      <div className="text-xs text-gray-mid mt-1 font-sans">
                        {item.color}{item.color && item.size ? ' / ' : ''}{item.size}
                      </div>
                      <p className="text-gold text-sm font-semibold mt-1 md:hidden">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Size — md only */}
                  <div className="hidden md:block col-span-2 text-center text-xs text-gray-mid font-sans">
                    {item.size || '—'}
                  </div>

                  {/* Qty */}
                  <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                    <div className="flex items-center border border-white/10">
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-mid hover:text-white">
                        <Minus size={10} />
                      </button>
                      <span className="w-8 text-center text-xs text-white font-sans">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-mid hover:text-white">
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>

                  {/* Total + delete */}
                  <div className="col-span-2 hidden md:flex items-center justify-end gap-3">
                    <span className="text-white text-sm font-sans font-semibold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <button onClick={() => removeFromCart(item.productId, item.size, item.color)}
                      className="text-gray-mid hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-black-card p-6 border border-white/5 sticky top-24">
                <h3 className="font-sans text-sm font-bold tracking-widest uppercase text-white mb-6">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-mid font-sans">
                    <span>Subtotal</span>
                    <span className="text-white">Rs. {cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-mid font-sans">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-400 font-semibold' : 'text-white'}>
                      {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-gray-mid/70 font-sans">
                      Add Rs. {(5000 - cartSubtotal).toLocaleString()} more for free shipping
                    </p>
                  )}
                </div>

                <div className="divider-gold mb-6" />

                <div className="flex justify-between text-white font-bold font-sans mb-6">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>

                <Link to="/checkout" className="btn-gold w-full flex items-center justify-center gap-2 mb-3">
                  CHECKOUT <ArrowRight size={14} />
                </Link>
                <Link to="/shop" className="btn-outline-gold w-full text-center text-xs block">
                  CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
