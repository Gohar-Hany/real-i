import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminHealthCheck, getProjects, getUsers, getGuidelines } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import {
  Users, BookOpen, BarChart3, MessageSquare, Upload, Shield,
  Activity, ChevronRight, Sparkles, Server, Database, Brain,
  CheckCircle, XCircle, RefreshCw, Zap, FolderOpen,
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({ users: 0, projects: 0, guidelines: 0 });
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, projects, guidelines] = await Promise.all([
          getUsers().catch(() => []),
          getProjects().catch(() => []),
          getGuidelines().catch(() => []),
        ]);
        setStats({
          users: users.length,
          projects: projects.length,
          guidelines: guidelines.filter(g => g.is_active).length,
        });
      } catch (e) { /* ignore */ }
      setLoading(false);
    };
    loadData();
  }, []);

  const checkHealth = async () => {
    try {
      const data = await adminHealthCheck();
      setHealth(data);
      toast.success('System health check complete');
    } catch (err) {
      toast.error('Health check failed');
    }
  };


  const quickActions = [
    { icon: Users, label: 'Students', desc: 'Manage users', path: '/admin/students', color: 'text-primary-400' },
    { icon: FolderOpen, label: 'Courses', desc: 'Manage courses', path: '/admin/courses', color: 'text-emerald-400' },
    { icon: BarChart3, label: 'Analytics', desc: 'View analytics', path: '/admin/analytics', color: 'text-blue-400' },
    { icon: MessageSquare, label: 'Command Chat', desc: 'AI assistant', path: '/admin/chat', color: 'text-amber-400' },
    { icon: Upload, label: 'Upload Files', desc: 'RAG pipeline', path: '/admin/upload', color: 'text-purple-400' },
    { icon: BookOpen, label: 'Guidelines', desc: 'Manage directives', path: '/admin/guidelines', color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Welcome Header */}
      <div className="relative glass-card rounded-3xl p-8 sm:p-10 overflow-hidden bg-surface-900/60 border border-surface-700/50 shadow-2xl group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none group-hover:bg-primary-500/20 transition-all duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md shadow-sm">
              <Shield size={14} className="text-primary-400" />
              <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
                Central Command
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Terminal</span>
            </h1>
            <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Welcome back, <strong className="text-surface-200 font-bold">{user?.name || 'Administrator'}</strong>. Monitor platform activity, manage student access, and oversee all AI-driven agents.
            </p>
          </div>
          <button
            onClick={checkHealth}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-800/50 text-surface-300 border border-surface-700 hover:bg-surface-700 hover:text-white hover:border-surface-600 transition-all shadow-sm active:scale-95 group shrink-0"
          >
            <Activity size={18} className="text-emerald-500 group-hover:text-emerald-400" />
            <span className="font-bold text-sm">Run Diagnostics</span>
          </button>
        </div>
      </div>

      {/* System Health Monitor */}
      {health && (
        <div className="relative glass-card rounded-3xl p-6 sm:p-8 bg-surface-900/60 border border-surface-700/50 shadow-xl overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
            <Server size={20} className="text-emerald-400" />
            Live System Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Object.entries(health).map(([key, value]) => {
              const isUp = typeof value === 'string' ? value.toLowerCase().includes('ok') || value.toLowerCase().includes('connected') : !!value;
              return (
                <div key={key} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-800/40 border border-surface-700/50">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isUp ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'} border`}>
                    {isUp ? (
                      <CheckCircle size={20} className="text-emerald-400" />
                    ) : (
                      <XCircle size={20} className="text-rose-400" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">{key.replace(/_/g, ' ')}</p>
                    <p className={`text-sm font-semibold truncate ${isUp ? 'text-surface-100' : 'text-rose-300'}`}>
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: Users, label: 'Total Users', value: loading ? '...' : stats.users, color: '#3B82F6' },
          { icon: FolderOpen, label: 'Active Projects', value: loading ? '...' : stats.projects, color: '#10B981' },
          { icon: BookOpen, label: 'Guidelines', value: loading ? '...' : stats.guidelines, color: '#F59E0B' },
          { icon: Brain, label: 'AI Agents', value: '3', color: '#8B5CF6' },
        ].map((stat, i) => (
          <div 
            key={i} 
            className="relative glass-card rounded-3xl p-6 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}
            ></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border"
                style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}
              >
                <stat.icon size={22} style={{ color: stat.color }} className="drop-shadow-[0_0_10px_currentColor]" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-surface-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control Modules (Quick Actions) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
            <Zap size={16} className="text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Control Modules</h2>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="relative glass-card rounded-2xl p-5 sm:p-6 text-left bg-surface-900/60 border border-surface-700/50 hover:border-primary-500/30 transition-all duration-300 group hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-primary-500/5"
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 group-hover:border-primary-500/20 transition-all">
                  <action.icon size={24} className={`${action.color} drop-shadow-[0_0_8px_currentColor]`} />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{action.label}</p>
                  <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed">{action.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-surface-950 text-surface-500 transition-all">
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
