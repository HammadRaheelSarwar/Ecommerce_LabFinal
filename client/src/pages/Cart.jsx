import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity } = useContext(CartContext);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.discountPrice || item.price;
    return acc + price * item.qty;
  }, 0);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 page-transition">
      <header className="mb-12 flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-lg text-primary">Your Cart</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="font-button text-button text-secondary flex items-center gap-2 hover:opacity-80 transition-opacity bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Continue Shopping
        </button>
      </header>

      {cartItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-xl border border-secondary/20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">shopping_bag</span>
          <h2 className="font-headline-sm text-headline-sm text-primary mb-4">Your bag is empty</h2>
          <p className="text-on-surface-variant font-body-md mb-8">
            Discover our collection of premium and luxury items.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/shop/Male" className="bg-secondary text-on-secondary font-button text-button py-3 px-6 rounded hover:bg-secondary-fixed transition-colors">
              Shop Men
            </Link>
            <Link to="/shop/Female" className="bg-secondary text-on-secondary font-button text-button py-3 px-6 rounded hover:bg-secondary-fixed transition-colors">
              Shop Women
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Cart Items List */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            <div className="glass-panel rounded-xl p-8">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-6 border-b border-white/5 pb-4">
                Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
              </h2>
              <div className="flex flex-col gap-6">
                {cartItems.map(item => {
                  const itemId = item._id || item.id;
                  const price = item.discountPrice || item.price;
                  const image = item.image || (item.images && item.images[0]) || 'https://placehold.co/400x400/0A1F44/00E5FF?text=No+Image';

                  return (
                    <div key={itemId} className="flex flex-col sm:flex-row items-center gap-6 group">
                      <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-surface-container relative shrink-0">
                        <img 
                          src={image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex-grow w-full text-center sm:text-left">
                        <h3 className="font-body-lg text-body-lg text-primary mb-1">{item.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-3">{item.brand || 'Premium Quality'}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-4">
                          <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest">
                            <button 
                              onClick={() => updateQuantity(itemId, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="w-8 text-center font-body-md text-body-md text-primary">{item.qty}</span>
                            <button 
                              onClick={() => updateQuantity(itemId, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(itemId)}
                            className="text-on-surface-variant hover:text-error transition-colors flex items-center text-sm bg-transparent"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-center sm:text-right mt-4 sm:mt-0">
                        <p className="font-body-lg text-body-lg text-primary">${(price * item.qty).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Cart Summary Side */}
          <aside className="lg:col-span-4 relative">
            <div className="sticky top-32 glass-panel rounded-xl p-8 flex flex-col gap-6 border border-secondary/20">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Order Summary</h2>
              
              <div className="border-t border-white/10 pt-6 space-y-4">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="font-body-md text-body-md">Subtotal</span>
                  <span className="font-body-md text-body-md text-primary">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="font-body-md text-body-md">Shipping</span>
                  <span className="font-body-md text-body-md text-primary">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span className="font-body-md text-body-md">Taxes</span>
                  <span className="font-body-md text-body-md text-primary">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                  <span className="font-headline-sm text-headline-sm text-primary">Estimated Total</span>
                  <span className="font-headline-sm text-headline-sm text-secondary">${subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 mt-4"
              >
                Proceed to Checkout
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

export default Cart;
