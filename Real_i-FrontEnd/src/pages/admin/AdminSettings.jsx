import { useState } from 'react';
import { useToast } from '@/components/common/Toast';
import Select from '@/components/common/Select';
import { Settings, Globe, Shield, Database, Bell, Bot, Server, Smartphone, Zap } from 'lucide-react';

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  // Fake settings state
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    aiAssistantEnabled: true,
    strictSecurity: true,
    emailNotifications: true,
    apiAccess: false,
    systemLanguage: 'en',
    dataRetentionDays: '30'
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      toast.success('System configuration updated and deployed');
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
            <Settings size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              Global Configuration
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            System <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Settings</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
            Modify core platform behaviors, security protocols, and integration parameters.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-black transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 shrink-0 disabled:opacity-50 disabled:grayscale"
        >
          <Zap size={18} />
          {loading ? 'Deploying...' : 'Deploy Configuration'}
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Core System Panel */}
        <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative z-50 group hover:border-primary-500/30 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary-500/10 transition-colors"></div>
          
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-8 relative z-10">
            <span className="w-1.5 h-6 bg-primary-500 rounded-full inline-block"></span>
            <Server size={20} className="text-primary-400" /> Core System
          </h3>

          <div className="space-y-6 relative z-10">
            {/* Toggle Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Maintenance Mode</p>
                <p className="text-xs text-surface-500 font-medium">Disables student access and displays maintenance screen</p>
              </div>
              <button 
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.maintenanceMode ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-surface-800 border border-surface-700'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-6 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
              </button>
            </div>

            {/* Toggle Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Allow Registrations</p>
                <p className="text-xs text-surface-500 font-medium">Enable new students to create accounts</p>
              </div>
              <button 
                onClick={() => handleToggle('allowRegistrations')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.allowRegistrations ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-surface-800 border border-surface-700'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${settings.allowRegistrations ? 'translate-x-6 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
              <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Globe size={12} /> System Language
              </label>
              <Select
                value={settings.systemLanguage}
                onChange={(val) => setSettings(prev => ({ ...prev, systemLanguage: val }))}
                options={[
                  { value: 'en', label: 'English (US)' },
                  { value: 'ar', label: 'Arabic (AE)' }
                ]}
                placeholder="Select Language"
              />
            </div>
          </div>
        </div>

        {/* AI & Integration Panel */}
        <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative z-50 group hover:border-blue-500/30 transition-colors duration-500">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-blue-500/10 transition-colors"></div>
          
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-8 relative z-10">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full inline-block"></span>
            <Bot size={20} className="text-blue-400" /> AI & Integrations
          </h3>

          <div className="space-y-6 relative z-10">
            {/* Toggle Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">Enable AI Assistant (Raaed)</p>
                <p className="text-xs text-surface-500 font-medium">Activate the global AI study assistant for all students</p>
              </div>
              <button 
                onClick={() => handleToggle('aiAssistantEnabled')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.aiAssistantEnabled ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-surface-800 border border-surface-700'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${settings.aiAssistantEnabled ? 'translate-x-6 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
              </button>
            </div>

            {/* Toggle Item */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
              <div>
                <p className="text-sm font-bold text-white mb-0.5">External API Access</p>
                <p className="text-xs text-surface-500 font-medium">Allow third-party integrations to connect to platform</p>
              </div>
              <button 
                onClick={() => handleToggle('apiAccess')}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.apiAccess ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-surface-800 border border-surface-700'}`}
              >
                <div className={`w-4 h-4 rounded-full transition-transform ${settings.apiAccess ? 'translate-x-6 bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-surface-950/50 border border-surface-800 opacity-60 pointer-events-none">
              <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Database size={12} /> Vector DB Provider (Locked)
              </label>
              <input
                type="text"
                disabled
                value="Pinecone (Cluster 3A)"
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-700 text-sm font-mono text-surface-500"
              />
            </div>
          </div>
        </div>

        {/* Security & Data Panel */}
        <div className="glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 sm:p-8 relative overflow-hidden group hover:border-rose-500/30 transition-colors duration-500 lg:col-span-2">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
          
          <h3 className="text-lg font-extrabold text-white flex items-center gap-2 mb-8 relative z-10">
            <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
            <Shield size={20} className="text-rose-400" /> Security & Data Retention
          </h3>

          <div className="grid md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">Strict Security Protocol</p>
                  <p className="text-xs text-surface-500 font-medium">Force 2FA and restrict IP access for Admins</p>
                </div>
                <button 
                  onClick={() => handleToggle('strictSecurity')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.strictSecurity ? 'bg-rose-500/20 border border-rose-500/50' : 'bg-surface-800 border border-surface-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${settings.strictSecurity ? 'translate-x-6 bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-950/50 border border-surface-800">
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">System Notifications</p>
                  <p className="text-xs text-surface-500 font-medium">Send critical alerts via Email/SMS</p>
                </div>
                <button 
                  onClick={() => handleToggle('emailNotifications')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.emailNotifications ? 'bg-primary-500/20 border border-primary-500/50' : 'bg-surface-800 border border-surface-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${settings.emailNotifications ? 'translate-x-6 bg-primary-400 shadow-[0_0_10px_rgba(212,175,55,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-950/50 border border-surface-800 flex flex-col justify-center">
              <label className="block text-[10px] font-bold text-surface-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Database size={12} /> Data Retention Policy (Days)
              </label>
              <div className="flex gap-4 mt-2">
                {[7, 30, 90, 365].map(days => (
                  <label key={days} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${settings.dataRetentionDays === String(days) ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-surface-900 border-surface-700 text-surface-400 hover:bg-surface-800'}`}>
                    <input type="radio" name="dataRetentionDays" value={days} checked={settings.dataRetentionDays === String(days)} onChange={handleChange} className="sr-only" />
                    <span className="text-xl font-black font-mono">{days}</span>
                    <span className="text-[9px] uppercase font-bold mt-1">Days</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
