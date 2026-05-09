import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../lib/api';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', adminKey: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingUserId, setPendingUserId] = useState(null);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!isLogin && !formData.name) {
      return setErrorMsg('Name is required for registration.');
    }
    
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const res = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.requiresVerification) {
          localStorage.setItem('pendingVerificationEmail', data.email || formData.email);
          navigate('/verify-email');
          return;
        }
        throw new Error(data.message || 'Authentication Failed');
      }

      if (data.requiresVerification) {
        localStorage.setItem('pendingVerificationEmail', data.email || formData.email);
        navigate('/verify-email');
        return;
      }
      
      if (data.requires2FA) {
         setRequires2FA(true);
         setPendingUserId(data.userId);
         return;
      }
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = data.role === 'admin' ? '/admin' : '/shop/Male';
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/users/verify-2fa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUserId, token: twoFactorCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid Authentication Code');
      
      localStorage.setItem('userInfo', JSON.stringify(data));
      window.location.href = data.role === 'admin' ? '/admin' : '/shop/Male';
    } catch(err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="glass-panel w-full max-w-md rounded-2xl p-10 flex flex-col gap-8 shadow-2xl border border-secondary/20">
          <div className="text-center">
            <span className="material-symbols-outlined text-[48px] text-secondary mb-4">security</span>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">2-Step Verification</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Enter the 6-digit code from your Authenticator App.</p>
          </div>
          
          {errorMsg && (
            <div className="p-4 rounded-lg bg-error-container text-on-error-container border border-error/30 text-center font-body-md">
              {errorMsg}
            </div>
          )}
          
          <form onSubmit={handleVerify2FA} className="space-y-8" autoComplete="off">
            <div className="text-center">
              <input 
                type="text" 
                required 
                autoComplete="one-time-code"
                value={twoFactorCode} 
                onChange={e => setTwoFactorCode(e.target.value)} 
                placeholder="000000" 
                maxLength={6} 
                className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-0 py-4 font-headline-md tracking-[0.5em] text-center text-primary placeholder:text-outline transition-colors outline-none"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">lock_open</span>
              {loading ? 'Verifying...' : 'Authenticate Securely'}
            </button>
            
            <div className="text-center">
               <button 
                  type="button" 
                  onClick={() => setRequires2FA(false)} 
                  className="font-label-caps text-label-caps text-on-surface-variant hover:text-secondary transition-colors uppercase tracking-widest"
               >
                  Return to Login
               </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden page-transition z-50">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="glass-panel w-full max-w-md rounded-2xl p-10 flex flex-col gap-8 shadow-2xl border border-secondary/20 relative z-10">
        <div className="text-center">
          <h2 className="font-headline-md text-headline-md text-primary mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {isLogin ? 'Sign in to access your curated dashboard.' : 'Join the exclusive All Available experience.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-lg bg-error-container text-on-error-container border border-error/30 text-center font-body-md">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {!isLogin && (
            <>
              <div className="flex gap-4 p-1 bg-surface-container-low rounded-lg border border-white/5">
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'user', adminKey: ''})} 
                  className={`flex-1 py-2 rounded-md font-button text-button transition-colors ${formData.role === 'user' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Customer
                </button>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, role: 'admin'})} 
                  className={`flex-1 py-2 rounded-md font-button text-button transition-colors ${formData.role === 'admin' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                  Administrator
                </button>
              </div>

              {formData.role === 'admin' && (
                <div className="animate-[fadeSlideIn_0.3s_ease-out]">
                  <label className="block font-label-caps text-label-caps text-secondary mb-2">Admin Access Key</label>
                  <input 
                    type="password" 
                    required 
                    value={formData.adminKey} 
                    onChange={e => setFormData({...formData, adminKey: e.target.value})} 
                    placeholder="Enter Master Key" 
                    className="w-full bg-transparent border-0 border-b border-secondary focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Full Name</label>
                <input 
                  type="text" 
                  autoComplete="off" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="John Doe" 
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none"
                />
              </div>
            </>
          )}
          
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Email Address</label>
            <input 
              type="email" 
              required 
              autoComplete="off" 
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="name@example.com" 
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none"
            />
          </div>
          
          <div>
            <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Password</label>
            <input 
              type="password" 
              required 
              autoComplete={isLogin ? 'current-password' : 'new-password'} 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••" 
              minLength={isLogin ? 6 : 8} 
              className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary tracking-widest placeholder:text-outline placeholder:tracking-normal transition-colors outline-none"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 mt-8 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : (isLogin ? 'Sign In Securely' : 'Create Account')}
          </button>
        </form>

        <div className="border-t border-white/5 pt-6 text-center">
          <p className="font-body-md text-on-surface-variant">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={handleToggle} 
              className="ml-2 font-label-caps text-label-caps text-secondary hover:text-secondary-fixed transition-colors tracking-widest uppercase"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
