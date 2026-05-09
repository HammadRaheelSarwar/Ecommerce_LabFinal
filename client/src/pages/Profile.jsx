import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import toast, { Toaster } from 'react-hot-toast';

const Profile = () => {
  const token = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).token : null;
  const userRole = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')).role : 'user';
  
  const { data: profileData, loading, execute: fetchProfile } = useApi('http://localhost:5000/api/user/profile');
  const updateApi = useApi('http://localhost:5000/api/user/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }});
  const passwordApi = useApi('http://localhost:5000/api/user/password', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }});

  const [formData, setFormData] = useState({ name: '', phone: '', address: '', profileImage: '' });
  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (token) {
        fetchProfile(undefined, { headers: { Authorization: `Bearer ${token}` } }).then(data => {
            if (data) setFormData({ name: data.name, phone: data.phone || '', address: data.address || '', profileImage: data.profileImage || '' });
        });
    }
  }, []);

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormData({ ...formData, profileImage: reader.result });
          reader.readAsDataURL(file);
      }
  };

  const handleProfileSubmit = async (e) => {
      e.preventDefault();
      try {
          await updateApi.execute(undefined, { body: JSON.stringify(formData) });
          toast.success("Profile saved successfully", { style: { background: '#1e2020', color: '#c8c6c5', border: '1px solid #444748' } });
          const local = JSON.parse(localStorage.getItem('userInfo'));
          local.name = formData.name;
          localStorage.setItem('userInfo', JSON.stringify(local));
      } catch (e) {
          toast.error("Failed to update profile details", { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
      }
  };

  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      if (passData.newPassword !== passData.confirmPassword) {
          return toast.error("New passwords do not match!", { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
      }
      try {
          await passwordApi.execute(undefined, { body: JSON.stringify({ oldPassword: passData.oldPassword, newPassword: passData.newPassword }) });
          toast.success("Password changed securely", { style: { background: '#1e2020', color: '#c8c6c5', border: '1px solid #444748' } });
          setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } catch (e) {
          toast.error(e.message || "Failed to change password natively", { style: { background: '#93000a', color: '#ffdad6', border: '1px solid #ffb4ab' } });
      }
  };

  if (loading && !profileData) {
      return (
          <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 text-center">
              <p className="font-body-md text-on-surface-variant">Loading profile data...</p>
          </main>
      );
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16 md:py-24 page-transition">
      <Toaster position="top-right" />
      
      <header className="mb-12 flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg text-primary">Personal Profile</h1>
        <p className="font-body-md text-on-surface-variant">Manage your account settings, public profile, and security preferences.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start">
        {/* Basic Settings Card */}
        <section className="glass-panel rounded-xl p-8 flex flex-col gap-8">
            <h2 className="font-headline-sm text-headline-sm text-primary mb-2 border-b border-white/5 pb-4">Public Details</h2>
            
            <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="flex items-center gap-6 mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 relative group bg-surface-container-low shrink-0">
                        {formData.profileImage ? (
                            <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-label-caps text-label-caps">
                                No Avatar
                            </div>
                        )}
                        <label className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <span className="material-symbols-outlined text-secondary mb-1 text-[20px]">photo_camera</span>
                            <span className="font-label-caps text-[10px] text-secondary">Upload</span>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                    <div>
                        <h3 className="font-body-lg text-body-lg text-primary mb-1">{formData.name || 'Anonymous User'}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-2">{profileData?.email || 'Synchronizing...'}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-label-caps tracking-widest border ${userRole === 'admin' ? 'border-secondary/30 bg-secondary/10 text-secondary' : 'border-white/10 bg-white/5 text-on-surface'}`}>
                            {userRole.toUpperCase()}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Display Name</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required 
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                        placeholder="Your full name"
                    />
                </div>
                
                <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Phone Number</label>
                    <input 
                        type="tel" 
                        value={formData.phone} 
                        onChange={e => setFormData({...formData, phone: e.target.value})} 
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                        placeholder="+1 (555) 000-0000"
                    />
                </div>

                <div>
                    <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Shipping Address</label>
                    <textarea 
                        value={formData.address} 
                        onChange={e => setFormData({...formData, address: e.target.value})} 
                        rows={3} 
                        className="w-full bg-surface-container-low border border-outline-variant focus:border-secondary focus:ring-1 focus:ring-secondary rounded-lg px-4 py-3 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none resize-none" 
                        placeholder="123 Luxury Lane, Suite 100..."
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={updateApi.loading} 
                    className="w-full bg-secondary text-on-secondary font-button text-button py-3 rounded-lg hover:bg-secondary-fixed transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    {updateApi.loading ? 'Synchronizing...' : 'Save Changes'}
                </button>
            </form>
        </section>

        {/* Security Password Card */}
        <aside className="relative">
            <div className="sticky top-32 glass-panel rounded-xl p-8 flex flex-col gap-8 border border-secondary/20">
                <h2 className="font-headline-sm text-headline-sm text-primary mb-2 border-b border-white/5 pb-4">Security Vault</h2>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Current Password</label>
                        <input 
                            type="password" 
                            value={passData.oldPassword} 
                            onChange={e => setPassData({...passData, oldPassword: e.target.value})} 
                            required 
                            className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                            placeholder="Enter current password"
                        />
                    </div>
                    
                    <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">New Password</label>
                        <input 
                            type="password" 
                            value={passData.newPassword} 
                            onChange={e => setPassData({...passData, newPassword: e.target.value})} 
                            required 
                            minLength={6} 
                            className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                            placeholder="Enter new password"
                        />
                    </div>

                    <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={passData.confirmPassword} 
                            onChange={e => setPassData({...passData, confirmPassword: e.target.value})} 
                            required 
                            minLength={6} 
                            className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-secondary focus:ring-0 px-0 py-2 font-body-md text-body-md text-primary placeholder:text-outline transition-colors outline-none" 
                            placeholder="Re-enter new password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={passwordApi.loading} 
                        className="w-full bg-transparent border border-secondary text-secondary font-button text-button py-3 rounded-lg hover:bg-secondary/10 transition-colors flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                        {passwordApi.loading ? 'Encrypting...' : 'Update Password'}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-on-surface-variant opacity-80 mt-2">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        <span className="font-label-caps text-label-caps tracking-wider text-[10px]">Encrypted Transmission</span>
                    </div>
                </form>
            </div>
        </aside>
      </div>
    </main>
  );
};

export default Profile;
