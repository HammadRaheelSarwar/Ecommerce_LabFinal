import React, { useEffect, useState } from 'react';
import useApi from '../hooks/useApi';
import { apiUrl } from '../lib/api';

const SecurityPanel = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : '';
  const generateApi = useApi('/api/users/generate-2fa', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  const enableApi = useApi('/api/users/enable-2fa', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(apiUrl('/api/users/me'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) setProfile(data);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleGenerate = async () => {
    try {
      const res = await generateApi.execute();
      if(res) {
        setQrCodeUrl(res.qrCode);
        setSetupSecret(res.secret);
        setStatusMsg('');
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleEnable = async (e) => {
    e.preventDefault();
    try {
      const res = await enableApi.execute(undefined, {
         body: JSON.stringify({ token: verificationCode }),
         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      });
      if(res) {
         setStatusMsg('Two-Factor Authentication is officially locked! Your account is now highly secure.');
         setQrCodeUrl('');
      }
    } catch(err) {
       alert(err.message || 'Verification failed. Try again.');
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 page-transition">
      <header className="mb-12 flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg text-primary">Security Protocols</h1>
        <p className="font-body-md text-on-surface-variant">Review your account's safety settings and enable Two-Factor Authentication.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <section className="lg:col-span-8 flex flex-col gap-8">
            <div className="glass-panel rounded-xl p-8 flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Account Type</p>
                        <strong className="font-body-lg text-body-lg text-primary uppercase tracking-widest text-[12px]">{profileLoading ? 'Loading...' : (profile?.role || 'user')}</strong>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">2FA Status</p>
                        <strong className={`font-body-lg text-body-lg ${profile?.isTwoFactorEnabled ? 'text-secondary' : 'text-error'}`}>
                            {profileLoading ? 'Loading...' : (profile?.isTwoFactorEnabled ? 'Enabled' : 'Disabled')}
                        </strong>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-6">
                        <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Last Login</p>
                        <strong className="font-body-md text-body-md text-primary truncate block">
                            {profileLoading ? 'Loading...' : (profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Unknown')}
                        </strong>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8">
                    <h2 className="font-headline-sm text-headline-sm text-primary mb-2">Two-Factor Authentication (2FA)</h2>
                    <p className="font-body-md text-on-surface-variant mb-8">
                        Protect your All Available account by mandating a physical Authenticator Code upon sign-in.
                    </p>
                    
                    {statusMsg ? (
                        <div className="p-4 rounded-lg bg-secondary/10 text-secondary border border-secondary/30 font-body-md">
                            {statusMsg}
                        </div>
                    ) : profile?.isTwoFactorEnabled ? (
                        <div className="p-4 rounded-lg bg-secondary/10 text-secondary border border-secondary/30 font-body-md flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">verified_user</span>
                            Two-Factor Authentication is already enabled on this account.
                        </div>
                    ) : !qrCodeUrl ? (
                        <button 
                            onClick={handleGenerate} 
                            disabled={generateApi.loading} 
                            className="bg-secondary text-on-secondary font-button text-button py-3 px-8 rounded hover:bg-secondary-fixed transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                            {generateApi.loading ? 'Generating Hash...' : 'Setup Authenticator App'}
                        </button>
                    ) : (
                        <div className="flex flex-col items-center bg-surface-container-low border border-white/5 p-8 rounded-xl max-w-md mx-auto">
                            <p className="font-body-md text-primary mb-6 text-center">Scan this QR Code in Google Authenticator or Authy</p>
                            <div className="bg-white p-4 rounded-xl mb-6 shadow-xl">
                                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                            <div className="w-full text-center mb-8">
                                <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">Fallback Secret</p>
                                <strong className="font-body-lg text-primary tracking-widest">{setupSecret}</strong>
                            </div>
                            
                            <form onSubmit={handleEnable} className="w-full space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="000000"
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 px-0 py-4 font-headline-md tracking-[0.5em] text-center text-primary placeholder:text-outline transition-colors outline-none"
                                />
                                <button 
                                    type="submit" 
                                    disabled={enableApi.loading} 
                                    className="w-full bg-secondary text-on-secondary font-button text-button py-4 rounded hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                    {enableApi.loading ? 'Verifying...' : 'Verify & Enable'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </section>
      </div>
    </main>
  );
};

export default SecurityPanel;
