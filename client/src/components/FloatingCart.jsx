import React, { useContext, useState } from 'react';
import { X, ShoppingCart, ChevronRight, Minus, Plus, Trash2 } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const FloatingCart = () => {
  const { cartItems, subtotal, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((a, i) => a + i.qty, 0);

  return (
    <>
      {/* Floating Button */}
      <button
        className="fixed bottom-8 right-8 z-[1500] w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgba(233,195,73,0.4)] hover:scale-110 hover:shadow-[0_12px_40px_rgba(233,195,73,0.6)] transition-all duration-300"
        onClick={() => setOpen(!open)}
        title="Cart"
        style={{ animation: totalItems > 0 ? 'cartBounce 0.4s ease' : 'none' }}
      >
        <ShoppingCart size={22} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-on-error text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-background">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      {open && (
        <>
          <div className="fixed inset-0 z-[1400] bg-background/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed bottom-[5.5rem] right-4 md:right-8 z-[1500] w-[calc(100vw-2rem)] md:w-[380px] max-h-[500px] flex flex-col rounded-2xl overflow-hidden glass-panel shadow-2xl animate-[fadeSlideUp_0.3s_ease-out]">
            <div className="flex items-center justify-between p-5 border-b border-white/5 bg-surface-container-low/50">
              <h3 className="font-headline-sm text-headline-sm text-primary">
                My Cart <span className="font-body-md text-body-md text-on-surface-variant ml-2">({totalItems} items)</span>
              </h3>
              <button className="text-on-surface-variant hover:text-error transition-colors p-1 rounded-md hover:bg-error/10" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 no-scrollbar">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant flex flex-col items-center">
                  <span className="material-symbols-outlined text-[48px] opacity-30 mb-4">shopping_bag</span>
                  <p className="font-body-md text-body-md mb-6">Your cart is elegantly empty.</p>
                  <button 
                    className="bg-secondary text-on-secondary font-button text-button py-2 px-6 rounded hover:bg-secondary-fixed transition-colors"
                    onClick={() => { navigate('/shop/Male'); setOpen(false); }}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : cartItems.map(item => {
                const itemId = item._id || item.id;
                const img = item.images?.[0] || item.image || 'https://placehold.co/400x400/0A1F44/00E5FF?text=No+Image';
                const price = item.discountPrice || item.price;
                
                return (
                  <div key={itemId} className="flex gap-4 items-start p-3 bg-surface-container-lowest border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
                    <img src={img} alt={item.name} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-body-md text-primary font-medium mb-1 truncate">{item.name}</p>
                      <p className="font-body-md text-body-md text-secondary font-bold mb-2">${(price * item.qty).toLocaleString()}</p>
                      <div className="flex items-center gap-2 bg-surface-container-high rounded-md w-fit p-1 border border-white/5">
                        <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors" onClick={() => decreaseQuantity(itemId)}><Minus size={12} /></button>
                        <span className="font-label-caps text-[12px] font-bold w-4 text-center text-primary">{item.qty}</span>
                        <button className="w-6 h-6 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors" onClick={() => increaseQuantity(itemId)}><Plus size={12} /></button>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors p-2" onClick={() => removeFromCart(itemId)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {cartItems.length > 0 && (
              <div className="p-5 border-t border-white/5 bg-surface-container-low/50">
                <div className="flex justify-between items-center mb-4 font-headline-sm text-headline-sm">
                  <span className="text-primary">Total</span>
                  <strong className="text-secondary">${subtotal.toLocaleString()}</strong>
                </div>
                <button 
                  className="w-full bg-secondary text-on-secondary font-button text-button py-3 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 mb-3"
                  onClick={() => { navigate('/checkout'); setOpen(false); }}
                >
                  Checkout <ChevronRight size={18} />
                </button>
                <button 
                  className="w-full bg-transparent border border-outline-variant text-on-surface-variant font-button text-button py-3 rounded hover:border-secondary hover:text-secondary transition-colors"
                  onClick={() => { navigate('/cart'); setOpen(false); }}
                >
                  View Full Cart
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes cartBounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
      `}</style>
    </>
  );
};

export default FloatingCart;
