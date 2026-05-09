import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const { state } = useLocation();
  const orderId = state?.orderId || 'N/A';
  const paymentStatus = state?.paymentStatus || 'pending';
  const totalPaid = state?.totalPaid ?? 0;

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden page-transition">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-lg rounded-2xl p-10 md:p-14 flex flex-col items-center text-center gap-8 shadow-2xl border border-secondary/20 relative z-10">
        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center mb-2 border border-secondary/30">
          <span className="material-symbols-outlined text-[48px] text-secondary">check_circle</span>
        </div>
        
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary mb-4">Acquisition Confirmed</h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm mx-auto">
            Your selection has been secured. Our team is now preparing your items with the utmost care.
          </p>
        </div>

        <div className="w-full bg-surface-container-low border border-white/5 rounded-xl p-6 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Order Identifier</span>
            <span className="font-body-md text-body-md text-primary font-mono">{orderId}</span>
          </div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Payment Status</span>
            <span className={`font-label-caps text-label-caps px-2 py-1 rounded border ${paymentStatus === 'paid' ? 'border-secondary/30 bg-secondary/10 text-secondary' : 'border-error/30 bg-error/10 text-error'}`}>
              {paymentStatus.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-headline-sm text-headline-sm text-on-surface">Total</span>
            <span className="font-headline-sm text-headline-sm text-secondary">${Number(totalPaid).toLocaleString()}</span>
          </div>
        </div>

        <Link 
          to="/shop/Male" 
          className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 mt-4"
        >
          Return to Collection
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
};

export default OrderSuccess;
