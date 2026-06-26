import { useAuth } from '@/contexts/AuthContext';
import { UserCircle, Mail, Shield, Calendar, Award, BarChart3, BookOpen, BrainCircuit } from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-surface-100">My Profile</h1>
        <p className="text-surface-400 mt-1">Manage your account and view your achievements</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-surface-950 text-3xl font-bold mx-auto mb-5 shadow-glow">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h2 className="text-xl font-bold text-surface-100 mb-1">{user?.name || 'Student'}</h2>
          <p className="text-sm text-surface-400 mb-4">{user?.email || 'student@real.ai'}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400">
            <Shield size={12} />
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </div>

          <div className="mt-6 pt-6 border-t border-surface-800/50 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-surface-500" />
              <span className="text-surface-300">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={16} className="text-surface-500" />
              <span className="text-surface-300">Joined 2024</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {[
            { icon: BookOpen, label: 'Courses Enrolled', value: '4', color: 'text-primary-400' },
            { icon: BrainCircuit, label: 'Quizzes Completed', value: '12', color: 'text-emerald-400' },
            { icon: BarChart3, label: 'Average Score', value: '87%', color: 'text-amber-400' },
            { icon: Award, label: 'Certificates', value: '2', color: 'text-purple-400' },
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
              {['First Quiz', 'Study Streak 7', 'Course Complete', 'Top Scorer'].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/15 text-sm text-primary-300 font-medium">
                  <Award size={14} />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
