import React, { forwardRef, useContext, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardCvcElement, CardExpiryElement, CardNumberElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { CartContext } from '../context/CartContext';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
  import.meta.env.VITE_STRIPE_KEY;

const CARD_OPTIONS = {
  style: {
    base: {
      color: '#c8c6c5',
      fontFamily: 'Inter, sans-serif',
      fontSize: '16px',
      '::placeholder': { color: '#8e9192' },
    },
    invalid: { color: '#ffb4ab' },
  },
};

const StripeCardSection = forwardRef(({ shippingName, amount, checkoutSessionId }, ref) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [processing, setProcessing] = useState(false);

  useImperativeHandle(ref, () => ({
    pay: async () => {
      if (!stripe || !elements) throw new Error('Card payments are not ready yet');

      const numberElement = elements.getElement(CardNumberElement);
      if (!numberElement) throw new Error('Card form is not ready');

      setProcessing(true);
      setCardError('');

      try {
        const paymentIntentRes = await fetch('http://localhost:5000/api/payment/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo') || '{}')?.token || ''}`,
          },
          body: JSON.stringify({ amount, checkoutSessionId }),
        });

        const paymentIntentData = await paymentIntentRes.json();
        if (!paymentIntentRes.ok) {
          throw new Error(paymentIntentData.message || 'Unable to start card payment');
        }

        const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentData.clientSecret, {
          payment_method: {
            card: numberElement,
            billing_details: { name: shippingName || 'Customer' },
          },
        });

        if (error) throw new Error(error.message);
        if (paymentIntent?.status !== 'succeeded') throw new Error('Card payment was not completed');

        return {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: new Date().toISOString(),
        };
      } catch (error) {
        setCardError(error.message);
        throw error;
      } finally {
        setProcessing(false);
      }
    },
  }));

  return (
    <div className="space-y-6 mt-6">
      <div>
        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Card Information</label>
        <div className="relative pb-2 border-b border-outline-variant">
          <CardNumberElement options={CARD_OPTIONS} className="w-full" />
          <div className="absolute right-0 top-0 flex gap-2">
            <span className="material-symbols-outlined text-outline-variant" style={{ fontVariationSettings: "'FILL' 1" }}>credit_card</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Expiry Date</label>
          <div className="pb-2 border-b border-outline-variant">
            <CardExpiryElement options={CARD_OPTIONS} className="w-full" />
          </div>
        </div>
        <div>
          <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">CVC</label>
          <div className="relative pb-2 border-b border-outline-variant">
            <CardCvcElement options={CARD_OPTIONS} className="w-full" />
            <span className="material-symbols-outlined absolute right-0 top-0 text-outline-variant text-[18px]">help</span>
          </div>
        </div>
      </div>

      <div className="text-on-surface-variant text-sm mt-2">
        Amount to charge: PKR {amount.toFixed(2)}
      </div>
      {processing && <div className="text-secondary font-semibold">Processing card payment...</div>}
      {cardError && <div className="text-error">{cardError}</div>}
    </div>
  );
});

const Checkout = ({ stripeReady = false }) => {
  const { cartItems, subtotal, clearCart, updateQuantity, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  const stripePaymentRef = useRef(null);
  const checkoutSessionId = useRef(`chk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  const [shipping, setShipping] = useState({ name: '', address: '', phone: '', email: '' });
  const [paymentMethod, setPaymentMethod] = useState('Stripe');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const createOrder = async (paymentResult = null) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const normalizedOrderItems = cartItems.map((item) => ({
      ...item,
      product: item._id || item.id || item.product,
    }));

    const missingProductReference = normalizedOrderItems.some((item) => !item.product);
    if (missingProductReference) {
      throw new Error('Some cart items are invalid. Please remove them and add again.');
    }

    const orderData = {
      orderItems: normalizedOrderItems,
      shippingDetails: shipping,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: 0,
      totalPrice: subtotal,
      paymentResult,
      isPaid: Boolean(paymentResult),
      paidAt: paymentResult ? new Date().toISOString() : undefined,
      checkoutSessionId: checkoutSessionId.current,
    };

    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(userInfo.token ? { Authorization: `Bearer ${userInfo.token}` } : {}),
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error placing order');
    return data;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartItems.length === 0) {
      setErrorMsg('Cart is empty.');
      return;
    }
    if (!shipping.name || !shipping.address || !shipping.phone) {
      setErrorMsg('Please fill out all shipping details.');
      return;
    }

    setLoading(true);
    try {
      let paymentResult = null;

      if (paymentMethod === 'Stripe') {
        if (!stripeReady) throw new Error('Card payments are not configured on this site yet');
        if (!stripePaymentRef.current?.pay) throw new Error('Card payment form is not ready');
        paymentResult = await stripePaymentRef.current.pay();
      }

      const order = await createOrder(paymentResult);
      clearCart();
      navigate('/order-success', {
        state: {
          orderId: order._id,
          paymentStatus: paymentResult ? 'paid' : 'pending',
          totalPaid: order.totalPrice,
        },
      });
    } catch (error) {
      setErrorMsg(error.message || 'Unable to place order');
    } finally {
      setLoading(false);
    }
  };

  const cardSection = useMemo(() => {
    if (paymentMethod !== 'Stripe') return null;
    if (!stripePublishableKey || !stripeReady) {
      return (
        <div className="mt-4 p-4 rounded-lg bg-error-container text-on-error-container border border-error/30">
          Card payments are not configured yet. Add your Stripe publishable and secret keys to enable this method.
        </div>
      );
    }

    return (
      <StripeCardSection
        ref={stripePaymentRef}
        amount={subtotal}
        shippingName={shipping.name}
        checkoutSessionId={checkoutSessionId.current}
      />
    );
  }, [paymentMethod, stripeReady, subtotal, shipping.name]);

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 page-transition">
      <header className="mb-12 flex items-center justify-between">
        <h1 className="font-headline-lg text-headline-lg text-primary">Secure Checkout</h1>
        <button 
          onClick={() => navigate(-1)} 
          className="font-button text-button text-secondary flex items-center gap-2 hover:opacity-80 transition-opacity bg-transparent"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Return to Store
        </button>
      </header>

      {errorMsg && (
        <div className="mb-8 p-4 rounded-lg bg-error-container text-on-error-container border border-error/30">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Side: Order Summary & Shipping Details */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          <div className="glass-panel rounded-xl p-8">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-6 border-b border-white/5 pb-4">Order Summary</h2>
            <div className="flex flex-col gap-6">
              {cartItems.length === 0 ? (
                <p className="text-on-surface-variant font-body-md">Your cart is currently empty.</p>
              ) : (
                cartItems.map((item) => {
                  const image = item.images?.[0] || item.image || 'https://placehold.co/400x400/0A1F44/00E5FF?text=No+Image';
                  const price = item.discountPrice || item.price;
                  return (
                    <div key={item._id || item.id} className="flex items-center gap-6 group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface-container relative shrink-0">
                        <img 
                          src={image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-body-lg text-body-lg text-primary mb-1">{item.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-3">{item.brand || 'Premium Item'}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-outline-variant rounded bg-surface-container-lowest">
                            <button 
                              onClick={() => updateQuantity(item._id || item.id, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[16px]">remove</span>
                            </button>
                            <span className="w-8 text-center font-body-md text-body-md text-primary">{item.qty}</span>
                            <button 
                              onClick={() => updateQuantity(item._id || item.id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors bg-transparent"
                            >
                              <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item._id || item.id)}
                            className="text-on-surface-variant hover:text-error transition-colors flex items-center text-sm bg-transparent"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-body-lg text-body-lg text-primary">${(price * item.qty).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-8">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-6 border-b border-white/5 pb-4">Shipping Details</h2>
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-6">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={shipping.name}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                  placeholder="Enter full name" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={shipping.email}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                    placeholder="email@example.com" 
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    required
                    value={shipping.phone}
                    onChange={handleChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                    placeholder="Phone number" 
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Shipping Address</label>
                <input 
                  type="text" 
                  name="address"
                  required
                  value={shipping.address}
                  onChange={handleChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                  placeholder="123 Luxury Lane, Suite 100" 
                />
              </div>
            </form>
          </div>
        </section>

        {/* Right Side: Secure Checkout Card */}
        <aside className="lg:col-span-5 relative">
          <div className="sticky top-32 glass-panel rounded-xl p-8 flex flex-col gap-8 border border-secondary/20">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary mb-6">Payment Method</h2>
              
              {/* Premium Wallets */}
              <div className="flex gap-4 mb-8">
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex-1 py-3 px-4 border rounded-lg flex items-center justify-center gap-2 transition-colors group ${paymentMethod === 'COD' ? 'border-secondary bg-secondary/10' : 'border-outline-variant hover:bg-white/5'}`}
                >
                  <span className={`material-symbols-outlined transition-colors ${paymentMethod === 'COD' ? 'text-secondary' : 'text-primary group-hover:text-secondary'}`}>local_shipping</span>
                  <span className={`font-button text-button ${paymentMethod === 'COD' ? 'text-secondary' : 'text-primary'}`}>Cash on Delivery</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setPaymentMethod('Stripe')}
                  className={`flex-1 py-3 px-4 border rounded-lg flex items-center justify-center gap-2 transition-colors group ${paymentMethod === 'Stripe' ? 'border-secondary bg-secondary/10' : 'border-outline-variant hover:bg-white/5'}`}
                >
                  <span className={`material-symbols-outlined transition-colors ${paymentMethod === 'Stripe' ? 'text-secondary' : 'text-primary group-hover:text-secondary'}`}>credit_card</span>
                  <span className={`font-button text-button ${paymentMethod === 'Stripe' ? 'text-secondary' : 'text-primary'}`}>Card</span>
                </button>
              </div>

              {cardSection}
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-body-md text-body-md">Subtotal</span>
                <span className="font-body-md text-body-md text-primary">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-body-md text-body-md">Shipping</span>
                <span className="font-body-md text-body-md text-primary">Complimentary</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="font-body-md text-body-md">Taxes</span>
                <span className="font-body-md text-body-md text-primary">Calculated at next step</span>
              </div>
              <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-2">
                <span className="font-headline-sm text-headline-sm text-primary">Total</span>
                <span className="font-headline-sm text-headline-sm text-secondary">${subtotal.toLocaleString()}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading || cartItems.length === 0}
              className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">lock</span>
              {loading ? 'Processing...' : 'Complete Secure Purchase'}
            </button>
            <div className="flex items-center justify-center gap-2 text-on-surface-variant opacity-80 mt-2">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="font-label-caps text-label-caps tracking-wider text-[10px]">Encrypted Transaction</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default Checkout;
