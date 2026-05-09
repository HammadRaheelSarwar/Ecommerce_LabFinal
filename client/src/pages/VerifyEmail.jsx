import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { apiUrl } from '../lib/api';

const RESEND_COOLDOWN_SECONDS = 60;
const STORAGE_EMAIL_KEY = 'pendingVerificationEmail';
const STORAGE_COOLDOWN_KEY = 'verificationCooldownUntil';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem(STORAGE_EMAIL_KEY) || '');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(Number(localStorage.getItem(STORAGE_COOLDOWN_KEY) || 0));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingSeconds = useMemo(() => {
    return Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  }, [cooldownUntil, now]);

  const persistCooldown = (expiresAt) => {
    setCooldownUntil(expiresAt);
    localStorage.setItem(STORAGE_COOLDOWN_KEY, String(expiresAt));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otpCode) {
      toast.error('Enter your email and verification code', { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/verify-email'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      localStorage.removeItem(STORAGE_EMAIL_KEY);
      localStorage.removeItem(STORAGE_COOLDOWN_KEY);
      localStorage.setItem('userInfo', JSON.stringify(data));
      toast.success('Email verified successfully', { style: { background: '#1e2020', color: '#c8c6c5', border: '1px solid #444748' } });
      window.location.href = data.role === 'admin' ? '/admin' : '/shop/Male';
    } catch (error) {
      toast.error(error.message || 'Verification failed', { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email first', { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
      return;
    }

    setResendLoading(true);
    try {
      const res = await fetch(apiUrl('/api/auth/resend-otp'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not resend code');

      const expiresAt = Date.now() + RESEND_COOLDOWN_SECONDS * 1000;
      persistCooldown(expiresAt);
      localStorage.setItem(STORAGE_EMAIL_KEY, email);
      toast.success('Verification code resent', { style: { background: '#1e2020', color: '#c8c6c5', border: '1px solid #444748' } });
    } catch (error) {
      toast.error(error.message || 'Could not resend code', { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden page-transition">
      <Toaster position="top-right" />
      
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-md rounded-2xl p-10 flex flex-col gap-8 shadow-2xl border border-secondary/20 relative z-10">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-secondary mb-4">mark_email_read</span>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Verify Your Email</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Enter the OTP sent to your inbox to activate your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6" autoComplete="off">
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none"
            />
          </div>
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Verification Code</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-0 py-4 font-headline-md tracking-[0.5em] text-center text-primary placeholder:text-outline transition-colors outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">verified</span>
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading || remainingSeconds > 0}
            className="w-full bg-transparent border border-secondary text-secondary font-button text-button py-4 rounded hover:bg-secondary/10 transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
            {resendLoading ? 'Sending...' : remainingSeconds > 0 ? `Resend in ${remainingSeconds}s` : 'Resend Code'}
          </button>
        </form>

        <div className="border-t border-white/5 pt-6 text-center">
          <button 
            onClick={() => navigate('/login')} 
            className="font-label-caps text-label-caps text-secondary hover:text-secondary-fixed transition-colors tracking-widest uppercase"
          >
            Back to login
          </button>
        </div>
      </div>
    </main>
  );
};

export default VerifyEmail;
