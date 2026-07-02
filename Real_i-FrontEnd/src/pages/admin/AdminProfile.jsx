import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import { UserCircle, Camera, Save, Shield, Key, Mail, User } from 'lucide-react';

export default function AdminProfile() {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || 'Administrator',
    email: user?.email || 'admin@real-i.com',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Admin profile updated successfully');
      setLoading(false);
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
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
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Identity</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Manage your system credentials, personal information, and authentication protocols.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Column - Avatar & Identity Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-8 relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="relative group mb-6 z-10">
              <div className="w-32 h-32 rounded-full bg-surface-950 border-4 border-surface-800 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.15)] transition-all group-hover:border-primary-500/50">
                {/* Placeholder Avatar */}
                <UserCircle size={80} className="text-surface-600 group-hover:text-primary-500/50 transition-colors" />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 rounded-full bg-primary-500 text-surface-950 hover:bg-primary-400 transition-colors shadow-lg active:scale-95">
                <Camera size={18} />
              </button>
            </div>

            <h3 className="text-xl font-black text-white mb-1 relative z-10">{formData.name}</h3>
            <p className="text-sm font-medium text-surface-400 mb-4 relative z-10">{formData.email}</p>
            
            <span className="inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 relative z-10">
              System Administrator
            </span>
          </div>

          {/* Quick Stats / Info */}
          <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 relative overflow-hidden">
            <h4 className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-4">System Access Log</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-surface-800">
                <span className="text-sm text-surface-500 font-medium">Last Login</span>
                <span className="text-sm text-white font-mono">Today, 08:42 AM</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-surface-800">
                <span className="text-sm text-surface-500 font-medium">IP Address</span>
                <span className="text-sm text-white font-mono">192.168.1.1</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500 font-medium">Role</span>
                <span className="text-sm text-primary-400 font-bold uppercase tracking-wider">SuperAdmin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Update Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative overflow-hidden h-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mb-8 relative z-10">
              <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
              Identity Parameters
            </h3>

            <div className="space-y-6 relative z-10">
              {/* Basic Info */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User size={12} /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner placeholder-surface-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all shadow-inner placeholder-surface-600"
                    required
                  />
                </div>
              </div>

              <div className="w-full h-px bg-surface-800 my-8"></div>

              {/* Security / Password */}
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2 mb-6">
                <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
                Security Protocol
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Key size={12} /> Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full sm:w-1/2 px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner placeholder-surface-600"
                    placeholder="Enter current password to authorize changes"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner placeholder-surface-600"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-surface-950/80 border border-surface-800 text-sm font-medium text-white outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all shadow-inner placeholder-surface-600"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-surface-950 text-sm font-black transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  <Save size={18} />
                  {loading ? 'Executing...' : 'Commit Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
