import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import { updateUserProfile } from '@/services/api';
import { UserCircle, Camera, Save, Shield, Key, Mail, User } from 'lucide-react';

export default function AdminProfile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@real-i.com',
    avatar: user?.avatar || null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, avatar: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        name: formData.name,
      };
      
      // Only send avatar if it was changed
      if (formData.avatar !== user.avatar) {
        payload.avatar = formData.avatar;
      }

      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      const res = await updateUserProfile(user.id, payload);
      
      if (res.user) {
        setUser(res.user);
        toast.success('Profile updated successfully');
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <Shield size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Security Clearance: Level 5
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Identity</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage your credentials, update your personal avatar, and oversee authentication protocols.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* ── Left Column - Avatar & Identity Summary ── */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-8 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="relative group mb-6 z-10">
              <div className="w-32 h-32 rounded-full bg-surface-950 border-4 border-surface-800 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all group-hover:border-primary-500/50 relative">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={80} className="text-surface-600 group-hover:text-primary-500/50 transition-colors" />
                )}
                
                {/* Upload Overlay */}
                <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary-500 text-surface-950 hover:bg-primary-400 transition-colors shadow-lg active:scale-95"
              >
                <Camera size={18} />
              </button>
              
              {/* Hidden File Input */}
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
              />
            </div>

            <h3 className="text-xl font-black text-white mb-1 relative z-10">{formData.name}</h3>
            <p className="text-sm font-medium text-surface-400 mb-4 relative z-10">{formData.email}</p>
            
            <span className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 relative z-10">
              {user?.role === 'admin' ? 'System Administrator' : 'User'}
            </span>
          </div>

          {/* Quick Stats / Info */}
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 relative overflow-hidden">
            <h4 className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-4">System Access Log</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-surface-800">
                <span className="text-sm text-surface-500 font-medium">Last Login</span>
                <span className="text-sm text-white font-mono">Today, Just now</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-surface-800">
                <span className="text-sm text-surface-500 font-medium">IP Address</span>
                <span className="text-sm text-white font-mono">Secured</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500 font-medium">Role</span>
                <span className="text-sm text-primary-400 font-bold uppercase tracking-wider">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Column - Settings Form ── */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 overflow-hidden">
            <div className="p-6 md:p-8 space-y-8">
              
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <User size={18} className="text-primary-400" />
                  Personal Details
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User size={16} className="text-surface-500" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-primary-500 outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      Email Address <LockIcon />
                    </label>
                    <div className="relative opacity-60">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={16} className="text-surface-500" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-surface-800 border border-surface-700 rounded-xl pl-11 pr-4 py-3 text-surface-400 outline-none cursor-not-allowed"
                      />
                    </div>
                    <p className="text-[10px] text-surface-500 mt-2 font-medium">
                      Email addresses are locked for security purposes. Contact SuperAdmin for changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-surface-800/50 w-full" />

              {/* Password Management */}
              <div>
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                  <Key size={18} className="text-primary-400" />
                  Security
                </h3>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current"
                        className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer */}
            <div className="px-6 py-5 border-t border-surface-700/50 bg-surface-800/30 flex justify-end gap-3">
              <button
                type="button"
                className="px-6 py-2.5 rounded-xl font-bold text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl gradient-primary text-surface-950 font-bold hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
                ) : (
                  <><Save size={18} /> Save Changes</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-500">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}
