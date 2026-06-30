import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/common/Toast';
import { getProjects, getCompletedQuizzes } from '@/services/api';
import { UserCircle, Mail, Shield, Calendar, Award, BarChart3, BookOpen, BrainCircuit, Edit2, Check, X } from 'lucide-react';

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
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-surface-100">My Profile</h1>
          <p className="text-surface-400 mt-1">Manage your account and view your achievements</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800/50 text-surface-300 hover:bg-surface-800 hover:text-primary-400 transition-colors"
          >
            <Edit2 size={16} />
            Edit Profile
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-8 text-center relative">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-surface-950 text-3xl font-bold mx-auto mb-5 shadow-glow">
            {editForm.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          {isEditing ? (
            <div className="space-y-4 text-left animate-fade-in">
              <div>
                <label className="text-xs text-surface-400 font-mono uppercase tracking-wider mb-1 block">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-surface-400 font-mono uppercase tracking-wider mb-1 block">Email</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  disabled
                  className="w-full bg-surface-950 border border-surface-800 rounded-lg px-3 py-2 text-sm text-surface-500 cursor-not-allowed"
                  title="Email cannot be changed"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button 
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary-500 text-surface-950 py-2 rounded-lg text-sm font-bold hover:bg-primary-400 transition-colors"
                >
                  <Check size={16} /> Save
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({ name: user?.name || '', email: user?.email || '' });
                  }}
                  className="flex items-center justify-center p-2 border border-surface-700 text-surface-400 rounded-lg hover:bg-surface-800 hover:text-surface-200 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-surface-100 mb-1">{editForm.name || 'Student'}</h2>
              <p className="text-sm text-surface-400 mb-4">{editForm.email || 'student@real.ai'}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400">
                <Shield size={12} />
                {user?.role === 'admin' ? 'Administrator' : 'Student'}
              </div>

              <div className="mt-6 pt-6 border-t border-surface-800/50 space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-surface-500" />
                  <span className="text-surface-300">{editForm.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar size={16} className="text-surface-500" />
                  <span className="text-surface-300">Joined 2024</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {[
            { icon: BookOpen, label: 'Courses Enrolled', value: String(projectsCount), color: 'text-primary-400' },
            { icon: BrainCircuit, label: 'Quizzes Completed', value: String(completedQuizzes.length), color: 'text-emerald-400' },
            { icon: BarChart3, label: 'Average Score', value: `${avgScore}%`, color: 'text-amber-400' },
            { icon: Award, label: 'Certificates', value: '0', color: 'text-purple-400' },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 flex items-center gap-4 hover-lift">
              <div className="w-12 h-12 rounded-xl bg-surface-800/50 flex items-center justify-center">
                <stat.icon size={22} className={stat.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-100">{stat.value}</p>
                <p className="text-xs text-surface-500">{stat.label}</p>
              </div>
            </div>
          ))}

          {/* Achievements */}
          <div className="sm:col-span-2 glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-surface-100 mb-4 flex items-center gap-2">
              <Award size={20} className="text-primary-400" />
              Achievements
            </h3>
            <div className="flex flex-wrap gap-3">
              {completedQuizzes.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/15 text-sm text-primary-300 font-medium">
                    <Award size={14} />
                    First Quiz Completed
                  </div>
                  {avgScore >= 90 && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/15 text-sm text-amber-300 font-medium">
                      <Award size={14} />
                      Top Scorer
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-surface-500 w-full text-center py-2">
                  Complete your first quiz to earn achievements!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
