import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.admin-card', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.2,
      });
    });
    return () => ctx.revert();
  }, []);

  const quickActions = [
    { icon: Users, label: 'Students', desc: 'Manage users', path: '/admin/students', color: 'text-primary-400' },
    { icon: FolderOpen, label: 'Courses', desc: 'Manage courses', path: '/admin/courses', color: 'text-emerald-400' },
    { icon: BarChart3, label: 'Analytics', desc: 'View analytics', path: '/admin/analytics', color: 'text-blue-400' },
    { icon: MessageSquare, label: 'Command Chat', desc: 'AI assistant', path: '/admin/chat', color: 'text-amber-400' },
    { icon: Upload, label: 'Upload Files', desc: 'RAG pipeline', path: '/admin/upload', color: 'text-purple-400' },
    { icon: BookOpen, label: 'Guidelines', desc: 'Manage directives', path: '/admin/guidelines', color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative glass-card rounded-3xl p-8 overflow-hidden admin-card">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={18} className="text-primary-400" />
              <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-100 mb-2">
              Welcome, <span className="text-gradient">{user?.name || 'Admin'}</span>
            </h1>
            <p className="text-surface-400 text-base">
              Monitor your platform, manage students, and oversee AI agents.
            </p>
          </div>
          <button
            onClick={checkHealth}
            className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-xl glass-light text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-white/10 transition-all active:scale-95"
          >
            <Activity size={16} />
            System Health
          </button>
        </div>
      </div>

      {/* System Health (if checked) */}
      {health && (
        <div className="admin-card glass-card rounded-2xl p-6">
          <h3 className="text-sm font-bold text-surface-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Server size={16} className="text-primary-400" />
            System Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(health).map(([key, value]) => {
              const isUp = typeof value === 'string' ? value.toLowerCase().includes('ok') || value.toLowerCase().includes('connected') : !!value;
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/30">
                  {isUp ? (
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-rose-400 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-semibold text-surface-200 capitalize">{key.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-surface-500 truncate">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: loading ? '...' : stats.users, color: 'text-primary-400' },
          { icon: FolderOpen, label: 'Projects', value: loading ? '...' : stats.projects, color: 'text-emerald-400' },
          { icon: BookOpen, label: 'Active Guidelines', value: loading ? '...' : stats.guidelines, color: 'text-amber-400' },
          { icon: Brain, label: 'AI Agents', value: '3', color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="admin-card glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-800/50 flex items-center justify-center shrink-0">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-surface-100">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-surface-100 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-primary-400" />
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="admin-card glass-card rounded-2xl p-5 text-left hover:border-primary-500/20 transition-all duration-300 hover-lift group"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-surface-800/50 flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-colors">
                  <action.icon size={20} className={action.color} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-surface-100">{action.label}</p>
                  <p className="text-xs text-surface-500">{action.desc}</p>
                </div>
                <ChevronRight size={16} className="text-surface-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
