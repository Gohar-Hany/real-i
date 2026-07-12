import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { adminHealthCheck, getProjects, getUsers, getGuidelines, getUserResults } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import {
  Users, BookOpen, BarChart3, MessageSquare, Upload, Shield,
  Activity, ChevronRight, Sparkles, Server, Brain,
  CheckCircle, XCircle, Zap, FolderOpen, GraduationCap,
  TrendingUp, AlertTriangle, Clock, Eye, ArrowUpRight
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({ users: 0, students: 0, admins: 0, projects: 0, guidelines: 0 });
  const [recentStudents, setRecentStudents] = useState([]);
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

        const studentUsers = users.filter(u => u.role === 'student');
        const adminUsers = users.filter(u => u.role === 'admin');

        setStats({
          users: users.length,
          students: studentUsers.length,
          admins: adminUsers.length,
          projects: projects.length,
          guidelines: guidelines.filter(g => g.is_active).length,
        });

        // Get recent students (last 5) for the activity widget
        setRecentStudents(studentUsers.slice(0, 6));
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
    { icon: Users, label: 'Students', desc: 'Manage user accounts and roles', path: '/admin/students', color: '#3B82F6' },
    { icon: FolderOpen, label: 'Courses', desc: 'Manage curriculum and modules', path: '/admin/courses', color: '#10B981' },
    { icon: BarChart3, label: 'Analytics', desc: 'View platform-wide metrics', path: '/admin/analytics', color: '#8B5CF6' },
    { icon: MessageSquare, label: 'Command Chat', desc: 'AI-powered admin assistant', path: '/admin/chat', color: '#F59E0B' },
    { icon: Upload, label: 'Upload Files', desc: 'Feed the RAG pipeline', path: '/admin/upload', color: '#EF4444' },
    { icon: BookOpen, label: 'Guidelines', desc: 'Manage learning directives', path: '/admin/guidelines', color: '#EC4899' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 border border-surface-700/50 shadow-2xl group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] group-hover:bg-primary-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-violet-500/5 rounded-full blur-[120px]"></div>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
              <Shield size={14} className="text-primary-400" />
              <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
                Central Command
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">{user?.name?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="text-surface-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Monitor platform activity, manage students, and oversee all AI-driven learning agents.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              onClick={checkHealth}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-800/50 text-surface-300 border border-surface-700 hover:bg-surface-700 hover:text-white hover:border-surface-600 transition-all active:scale-95"
            >
              <Activity size={16} className="text-emerald-500" />
              <span className="font-bold text-sm">Diagnostics</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Health (shown after diagnostics) */}
      {health && (
        <div className="relative glass-card rounded-3xl p-6 bg-surface-900/60 border border-surface-700/50 overflow-hidden animate-fade-in">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-3">
            <Server size={18} className="text-emerald-400" />
            Live System Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(health).map(([key, value]) => {
              const isUp = typeof value === 'string' ? value.toLowerCase().includes('ok') || value.toLowerCase().includes('connected') : !!value;
              return (
                <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-surface-700/50">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isUp ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</p>
                    <p className={`text-xs font-semibold truncate ${isUp ? 'text-surface-200' : 'text-rose-300'}`}>
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Users', value: loading ? '...' : stats.users, sub: `${stats.students} students · ${stats.admins} admins`, color: '#3B82F6' },
          { icon: FolderOpen, label: 'Active Projects', value: loading ? '...' : stats.projects, sub: 'Learning modules', color: '#10B981' },
          { icon: BookOpen, label: 'Guidelines', value: loading ? '...' : stats.guidelines, sub: 'Active directives', color: '#F59E0B' },
          { icon: Brain, label: 'AI Agents', value: '3', sub: 'Chat · Quiz · RAG', color: '#8B5CF6' },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg border"
                  style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <span className="text-2xl font-extrabold text-white">{stat.value}</span>
              </div>
              <p className="text-xs font-bold text-surface-300 uppercase tracking-wider">{stat.label}</p>
              <p className="text-[10px] text-surface-500 mt-0.5">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Zap size={16} className="text-primary-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Control Modules</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="relative glass-card rounded-2xl p-5 text-left bg-surface-900/60 border border-surface-700/50 hover:border-primary-500/30 transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-start gap-4 relative z-10">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ background: `linear-gradient(135deg, ${action.color}20, ${action.color}05)`, borderColor: `${action.color}40` }}
                  >
                    <action.icon size={20} style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{action.label}</p>
                    <p className="text-[11px] text-surface-500 leading-relaxed">{action.desc}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-surface-950 text-surface-500 transition-all mt-0.5">
                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Students Sidebar */}
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-5 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <GraduationCap size={16} className="text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Recent Students</h3>
            </div>
            <Link to="/admin/students" className="text-[10px] text-primary-400 font-bold hover:text-primary-300 uppercase tracking-wider flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-3 space-y-1.5">
            {loading ? (
              <div className="py-8 text-center">
                <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-[10px] text-surface-500 uppercase tracking-widest">Loading...</p>
              </div>
            ) : recentStudents.length === 0 ? (
              <div className="py-8 text-center">
                <Users size={24} className="text-surface-600 mx-auto mb-2" />
                <p className="text-xs text-surface-500">No students found</p>
              </div>
            ) : (
              recentStudents.map((s, i) => (
                <Link
                  key={s.id || i}
                  to={`/admin/students/${s.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-800/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-surface-950 text-xs font-extrabold shrink-0 shadow-sm">
                    {s.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-surface-200 truncate group-hover:text-white transition-colors">{s.name}</p>
                    <p className="text-[10px] text-surface-500 font-mono truncate">{s.email}</p>
                  </div>
                  <Eye size={14} className="text-surface-600 group-hover:text-primary-400 shrink-0 transition-colors" />
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Platform Highlights */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            icon: TrendingUp,
            title: 'Performance Tracking',
            desc: 'View detailed student dossiers with quiz scores, assignments, and academic progress.',
            link: '/admin/students',
            linkText: 'Student Directory',
            color: 'emerald',
          },
          {
            icon: AlertTriangle,
            title: 'System Guidelines',
            desc: 'Create and manage learning directives that guide the AI agents behavior.',
            link: '/admin/guidelines',
            linkText: 'Manage Guidelines',
            color: 'amber',
          },
          {
            icon: Clock,
            title: 'Real-Time Analytics',
            desc: 'Monitor engagement metrics, course completions, and quiz performance across the platform.',
            link: '/admin/analytics',
            linkText: 'View Analytics',
            color: 'blue',
          },
        ].map((card, i) => (
          <div key={i} className={`glass-card rounded-2xl p-6 bg-surface-900/60 border border-surface-700/50 hover:border-${card.color}-500/30 transition-all group`}>
            <div className={`w-10 h-10 rounded-xl bg-${card.color}-500/10 flex items-center justify-center border border-${card.color}-500/20 mb-4`}>
              <card.icon size={20} className={`text-${card.color}-400`} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">{card.title}</h3>
            <p className="text-xs text-surface-500 leading-relaxed mb-4">{card.desc}</p>
            <Link
              to={card.link}
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold text-${card.color}-400 hover:text-${card.color}-300 transition-colors uppercase tracking-wider`}
            >
              {card.linkText} <ArrowUpRight size={12} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
