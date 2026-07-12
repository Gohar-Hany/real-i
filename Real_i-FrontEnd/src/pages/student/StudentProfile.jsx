import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import { getProjects, getCompletedQuizzes } from '@/services/api';
import { UserCircle, Mail, Shield, Calendar, Award, BarChart3, BookOpen, BrainCircuit, Edit2, Check, X, Target, ArrowUpRight } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [projectsCount, setProjectsCount] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name || '', email: user.email || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projects, quizzesRes] = await Promise.all([
          getProjects().catch(() => []),
          getCompletedQuizzes(user?.id).catch(() => ({ completed_tasks: [] }))
        ]);
        
        setProjectsCount(projects.length || 0);
        setCompletedQuizzes(quizzesRes.completed_tasks || []);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };
    if (user) fetchData();
  }, [user]);

  const avgScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedQuizzes.length)
    : 0;

  const handleSave = () => {
    // Since there's no backend endpoint to update the profile yet, we mock the success
    toast.success('Profile updated successfully (Simulated)');
    setIsEditing(false);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
            <UserCircle size={14} className="text-primary-400" />
            <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
              User Identity
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">Profile</span>
          </h1>
          <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed">
            Manage your account credentials, view your learning statistics, and track your achievements.
          </p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-800/50 text-surface-300 border border-surface-700 hover:bg-surface-700 hover:text-white hover:border-surface-600 transition-all shadow-sm active:scale-95 group"
          >
            <Edit2 size={16} className="text-primary-500 group-hover:text-primary-400" />
            <span className="font-semibold text-sm">Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Profile Card / ID Badge */}
        <div className="relative glass-card rounded-3xl p-8 sm:p-10 bg-surface-900/60 border border-surface-700/50 shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary-500/20 transition-all duration-700"></div>

          <div className="relative z-10 text-center">
            <div className="w-28 h-28 mx-auto rounded-full p-1 mb-6 bg-gradient-to-br from-primary-500 to-amber-500 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
              <div className="w-full h-full rounded-full bg-surface-900 flex items-center justify-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary-400 to-amber-200 border-4 border-surface-900">
                {editForm.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-5 text-left animate-fade-in-up">
                <div>
                  <label className="text-xs text-surface-400 font-bold uppercase tracking-wider mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-surface-900/80 border border-surface-700 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-xs text-surface-400 font-bold uppercase tracking-wider mb-2 block flex items-center gap-2">
                    Email <span className="text-[10px] text-surface-500 font-normal normal-case px-1.5 py-0.5 bg-surface-800 rounded">Read Only</span>
                  </label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    disabled
                    className="w-full bg-surface-950/80 border border-surface-800 rounded-xl px-4 py-3 text-sm text-surface-500 cursor-not-allowed shadow-inner"
                    title="Email cannot be changed"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 gradient-primary text-surface-950 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] active:scale-95 transition-all"
                  >
                    <Check size={16} /> Save Changes
                  </button>
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({ name: user?.name || '', email: user?.email || '' });
                    }}
                    className="flex items-center justify-center p-3 border border-surface-700 bg-surface-800/50 text-surface-400 rounded-xl hover:bg-surface-700 hover:text-white transition-all active:scale-95"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-extrabold text-white mb-2">{editForm.name || 'Student User'}</h2>
                <p className="text-sm text-surface-400 font-mono mb-6">{editForm.email || 'student@real.ai'}</p>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-400 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                  <Shield size={14} />
                  {user?.role === 'admin' ? 'Administrator' : 'Verified Student'}
                </div>

                <div className="mt-8 pt-8 border-t border-surface-800/50 space-y-4 text-left">
                  <div className="flex items-center gap-4 text-sm p-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
                    <div className="w-8 h-8 rounded-lg bg-surface-900 border border-surface-700 flex items-center justify-center shrink-0">
                      <Mail size={14} className="text-surface-400" />
                    </div>
                    <span className="text-surface-200 font-medium truncate">{editForm.email}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm p-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
                    <div className="w-8 h-8 rounded-lg bg-surface-900 border border-surface-700 flex items-center justify-center shrink-0">
                      <Calendar size={14} className="text-surface-400" />
                    </div>
                    <span className="text-surface-200 font-medium">Joined Fall 2024</span>
                  </div>

                  <Link
                    to="/student/performance"
                    className="flex items-center gap-4 text-sm p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <BarChart3 size={14} className="text-emerald-400" />
                    </div>
                    <span className="text-emerald-300 font-bold flex-1">View Performance Report</span>
                    <ArrowUpRight size={14} className="text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Stats & Achievements */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 gap-4 lg:gap-6">
            {[
              { icon: BookOpen, label: 'Courses Enrolled', value: String(projectsCount), color: '#D4AF37' },
              { icon: BrainCircuit, label: 'Quizzes Completed', value: String(completedQuizzes.length), color: '#10B981' },
              { icon: BarChart3, label: 'Average Score', value: `${avgScore}%`, color: '#F59E0B' },
              { icon: Award, label: 'Certificates', value: '0', color: '#8B5CF6' },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="relative glass-card rounded-3xl p-6 sm:p-8 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
                style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}
                ></div>
                
                <div className="flex items-center gap-5 relative z-10">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border"
                    style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}
                  >
                    <stat.icon size={26} style={{ color: stat.color }} className="drop-shadow-[0_0_10px_currentColor]" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-surface-400 mt-1">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="relative glass-card rounded-3xl p-6 sm:p-8 bg-surface-900/60 border border-surface-700/50 overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-8 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Award size={20} className="text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Digital Badges</h3>
            </div>

            <div className="flex flex-wrap gap-4 relative z-10">
              {completedQuizzes.length > 0 ? (
                <>
                  <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary-500/10 to-surface-800 border border-primary-500/20 hover:border-primary-500/40 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center border border-primary-500/30 group-hover:scale-110 transition-transform">
                      <Award size={16} className="text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Initiate Sequence</p>
                      <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">First Quiz Completed</p>
                    </div>
                  </div>
                  
                  {avgScore >= 90 && (
                    <div className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-surface-800 border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-default">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition-transform">
                        <Target size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Sharpshooter</p>
                        <p className="text-[10px] text-surface-400 uppercase tracking-wider mt-0.5">90%+ Average Score</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full flex flex-col items-center justify-center py-6 border border-dashed border-surface-700 rounded-2xl bg-surface-900/50">
                  <Award size={32} className="text-surface-600 mb-3" />
                  <p className="text-sm font-bold text-surface-300">No Badges Yet</p>
                  <p className="text-xs text-surface-500 mt-1">Complete your first quiz to earn achievements.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
