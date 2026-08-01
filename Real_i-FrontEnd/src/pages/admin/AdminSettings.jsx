import { useState, useEffect } from 'react';
import { useToast } from '@/components/common/Toast';
import Select from '@/components/common/Select';
import { Settings, Globe, Shield, Database, Bell, Bot, Server, ShieldCheck, Zap, Link2, CreditCard, Layout } from 'lucide-react';

const DEFAULT_SETTINGS = {
  // General
  academyName: 'REAL_i Academy',
  supportEmail: 'support@real-i.com',
  language: 'en',
  
  // AI Config
  aiEnabled: true,
  aiModel: 'gpt-4',
  aiPersonality: 'You are Raaed, a helpful and strict educational assistant...',
  
  // Security
  maintenanceMode: false,
  restrictEnrollment: false,
  twoFactorAuth: false,

  // Integrations
  stripeKey: '',
  zoomClient: ''
};

export default function AdminSettings() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('reali_admin_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call and save to local storage
    setTimeout(() => {
      localStorage.setItem('reali_admin_settings', JSON.stringify(settings));
      toast.success('System configuration updated and deployed');
      setLoading(false);
    }, 800);
  };

  const tabs = [
    { id: 'general', label: 'General & Branding', icon: Layout, desc: 'Core platform identity' },
    { id: 'ai', label: 'AI Configuration', icon: Bot, desc: 'Manage Raaed assistant' },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck, desc: 'Maintenance and auth rules' },
    { id: 'integrations', label: 'API & Integrations', icon: Link2, desc: 'Payment and third-party tools' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-10 max-w-7xl mx-auto">
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
            Centralized control panel for core platform behaviors, security protocols, AI parameters, and third-party integrations.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-surface-950 text-sm font-black transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 shrink-0 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
          ) : (
            <><Zap size={18} /> Deploy Configuration</>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ── Left Sidebar (Tabs) ── */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex flex-col text-left px-5 py-4 rounded-2xl transition-all border ${
                  isActive 
                    ? 'bg-surface-800/80 border-primary-500/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                    : 'bg-transparent border-transparent hover:bg-surface-800/40 hover:border-surface-700/50 text-surface-400'
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <Icon size={18} className={isActive ? 'text-primary-400' : 'text-surface-500'} />
                  <span className={`font-bold ${isActive ? 'text-white' : 'text-surface-300'}`}>
                    {tab.label}
                  </span>
                </div>
                <span className="text-xs text-surface-500 pl-7">{tab.desc}</span>
              </button>
            );
          })}
        </div>

        {/* ── Right Content Area ── */}
        <div className="flex-1 glass-card rounded-3xl border border-surface-700/50 shadow-2xl bg-surface-900/60 p-6 md:p-8 overflow-hidden relative min-h-[500px]">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-surface-800 pb-4 flex items-center gap-2">
                <Layout className="text-primary-400" size={20} /> General & Branding
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Academy Name</label>
                  <input
                    type="text"
                    name="academyName"
                    value={settings.academyName}
                    onChange={handleChange}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-surface-500 mt-2">This is the public name displayed on the homepage and student emails.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Support Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={settings.supportEmail}
                    onChange={handleChange}
                    className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-colors"
                  />
                  <p className="text-[10px] text-surface-500 mt-2">Students will contact this address for technical issues.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">System Default Language</label>
                <div className="w-full md:w-1/2">
                  <Select
                    value={settings.language}
                    onChange={(val) => setSettings(prev => ({ ...prev, language: val }))}
                    options={[
                      { value: 'en', label: 'English (US)' },
                      { value: 'ar', label: 'Arabic (AE)' }
                    ]}
                  />
                </div>
                <p className="text-[10px] text-surface-500 mt-2">Sets the default language for new users. Users can override this in their own profile.</p>
              </div>
            </div>
          )}

          {/* AI Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-surface-800 pb-4 flex items-center gap-2">
                <Bot className="text-blue-400" size={20} /> AI Configuration (Raaed)
              </h3>
              
              <div className="flex items-start justify-between p-5 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                <div className="pr-6">
                  <p className="text-sm font-bold text-white mb-1">Enable Global AI Assistant</p>
                  <p className="text-xs text-surface-400 leading-relaxed">Turn this on to allow students to interact with Raaed in their courses. Turning this off will hide the chat widget for everyone.</p>
                </div>
                <button 
                  onClick={() => handleToggle('aiEnabled')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${settings.aiEnabled ? 'bg-blue-500/40 border border-blue-500/50' : 'bg-surface-800 border border-surface-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${settings.aiEnabled ? 'translate-x-6 bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
                </button>
              </div>

              <div className={`transition-opacity ${!settings.aiEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">AI Intelligence Model</label>
                <div className="w-full md:w-1/2">
                  <Select
                    value={settings.aiModel}
                    onChange={(val) => setSettings(prev => ({ ...prev, aiModel: val }))}
                    options={[
                      { value: 'gpt-4', label: 'GPT-4 (Most Capable, Slower)' },
                      { value: 'gpt-3.5', label: 'GPT-3.5 Turbo (Fast, Less Capable)' },
                      { value: 'llama3', label: 'Llama 3 (Locally Hosted, Private)' }
                    ]}
                  />
                </div>
                <p className="text-[10px] text-surface-500 mt-2 mb-6">Select which language model Raaed uses to answer student questions.</p>

                <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">System Prompt (Personality)</label>
                <textarea
                  name="aiPersonality"
                  value={settings.aiPersonality}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-colors font-mono text-sm"
                />
                <p className="text-[10px] text-surface-500 mt-2">These are the absolute rules the AI must follow. Use this to restrict the AI from giving direct answers to quizzes.</p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-surface-800 pb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} /> Security & Access
              </h3>
              
              <div className="flex items-start justify-between p-5 rounded-2xl bg-rose-500/5 border border-rose-500/20">
                <div className="pr-6">
                  <p className="text-sm font-bold text-rose-400 mb-1">Maintenance Mode</p>
                  <p className="text-xs text-surface-400 leading-relaxed">Locks the entire platform. Students will see a "Down for Maintenance" page. Only Admins can log in.</p>
                </div>
                <button 
                  onClick={() => handleToggle('maintenanceMode')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${settings.maintenanceMode ? 'bg-rose-500/40 border border-rose-500/50' : 'bg-surface-800 border border-surface-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${settings.maintenanceMode ? 'translate-x-6 bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'translate-x-0 bg-surface-500'}`}></div>
                </button>
              </div>

              <div className="flex items-start justify-between p-5 rounded-2xl bg-surface-800/30 border border-surface-700/50">
                <div className="pr-6">
                  <p className="text-sm font-bold text-white mb-1">Restrict New Enrollments</p>
                  <p className="text-xs text-surface-400 leading-relaxed">If enabled, students cannot register themselves. Accounts must be manually created by an Admin.</p>
                </div>
                <button 
                  onClick={() => handleToggle('restrictEnrollment')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${settings.restrictEnrollment ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-surface-800 border border-surface-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${settings.restrictEnrollment ? 'translate-x-6 bg-emerald-400' : 'translate-x-0 bg-surface-500'}`}></div>
                </button>
              </div>

              <div className="flex items-start justify-between p-5 rounded-2xl bg-surface-800/30 border border-surface-700/50">
                <div className="pr-6">
                  <p className="text-sm font-bold text-white mb-1">Require 2FA for Admins</p>
                  <p className="text-xs text-surface-400 leading-relaxed">Force all administrator accounts to use Two-Factor Authentication via Authenticator App.</p>
                </div>
                <button 
                  onClick={() => handleToggle('twoFactorAuth')}
                  className={`w-12 h-6 rounded-full p-1 transition-colors shrink-0 ${settings.twoFactorAuth ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-surface-800 border border-surface-700'}`}
                >
                  <div className={`w-4 h-4 rounded-full transition-transform ${settings.twoFactorAuth ? 'translate-x-6 bg-emerald-400' : 'translate-x-0 bg-surface-500'}`}></div>
                </button>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white mb-6 border-b border-surface-800 pb-4 flex items-center gap-2">
                <Link2 className="text-amber-400" size={20} /> API & Integrations
              </h3>
              
              <div className="p-6 rounded-2xl bg-surface-800/30 border border-surface-700/50 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#635BFF]/10 flex items-center justify-center">
                    <CreditCard size={20} className="text-[#635BFF]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Stripe Payment Gateway</h4>
                    <p className="text-xs text-surface-500">Required for selling premium courses.</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Stripe Secret API Key</label>
                  <input
                    type="password"
                    name="stripeKey"
                    value={settings.stripeKey}
                    onChange={handleChange}
                    placeholder="sk_test_..."
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-surface-800/30 border border-surface-700/50 space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-[#2D8CFF]/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#2D8CFF]"><path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4z"/><rect width="12" height="12" x="3" y="6" rx="2" ry="2"/></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Zoom OAuth</h4>
                    <p className="text-xs text-surface-500">Enable automatic meeting link generation for live classes.</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">Zoom Client ID</label>
                  <input
                    type="text"
                    name="zoomClient"
                    value={settings.zoomClient}
                    onChange={handleChange}
                    placeholder="Client ID from Zoom Marketplace"
                    className="w-full bg-surface-950 border border-surface-700 rounded-xl px-4 py-3 text-white focus:border-primary-500 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
