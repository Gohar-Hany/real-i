import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getAssignedQuizzes, getCompletedQuizzes } from '@/services/api';
import { useToast } from '@/components/common/Toast';
import { COURSES } from '@/data/mockData';
import {
  MessageSquare, BrainCircuit, BookOpen, Sparkles, ArrowRight,
  GraduationCap, Trophy, Target, TrendingUp, Clock, Zap,
  ChevronRight, BarChart3, Star,
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const list = await getProjects();
        if (list.length > 0) {
          let allQuizzes = [];
          let completedTaskIds = [];

          try {
            const res = await getCompletedQuizzes(user?.id);
            setCompletedQuizzes(res.completed_tasks || []);
            completedTaskIds = res.completed_tasks ? res.completed_tasks.map(ct => ct.task_id) : [];
          } catch (e) {
            console.error('Failed to fetch completed quizzes', e);
          }

          for (const project of list) {
            try {
              const quizzes = await getAssignedQuizzes(project.project_id);
              if (quizzes?.length > 0) {
                const mapped = quizzes.map(q => ({
                  ...q,
                  project_id: project.project_id,
                  isCompleted: completedTaskIds.includes(q.task_id),
                }));
                allQuizzes = [...allQuizzes, ...mapped];
              }
            } catch (e) { /* skip */ }
          }
          setAssignedQuizzes(allQuizzes);
          setProjectsCount(list.length);
        }
      } catch (err) {
        console.error('Failed to load quizzes', err);
      }
    };
    fetchQuizzes();
  }, [user]);



  const pendingQuizzes = assignedQuizzes.filter(q => !q.isCompleted);
  const completedCount = assignedQuizzes.filter(q => q.isCompleted).length;

  // Calculate Average Score from completed quizzes
  const avgScore = completedQuizzes.length > 0 
    ? Math.round(completedQuizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedQuizzes.length)
    : 0;

  const quickActions = [
    {
      icon: MessageSquare,
      title: 'Study Chat',
      desc: 'Ask your AI tutor anything about your courses',
      path: '/student/chat',
      gradient: 'from-primary-500 to-primary-600',
    },
    {
      icon: BrainCircuit,
      title: 'Take a Quiz',
      desc: 'Test your knowledge with AI-generated quizzes',
      path: '/student/quiz',
      gradient: 'from-primary-400 to-primary-500',
    },
    {
      icon: GraduationCap,
      title: 'My Courses',
      desc: 'Continue learning from where you left off',
      path: '/student/courses',
      gradient: 'from-primary-600 to-primary-700',
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 border border-surface-700/50 shadow-2xl group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] group-hover:bg-primary-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-700 mb-4 backdrop-blur-md">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-[11px] font-mono font-bold text-primary-400 uppercase tracking-widest">
                Student Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
              {user?.name ? (
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">{user.name}</span></>
              ) : (
                <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">REAL.i</span></>
              )}
            </h1>
            <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Your AI-powered learning environment is ready. Dive into your courses, track your progress, or challenge yourself with a new quiz.
            </p>
          </div>
          
          <div className="hidden lg:flex shrink-0">
            <div className="w-32 h-32 rounded-full border-4 border-surface-800 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm relative shadow-[0_0_30px_rgba(212,175,55,0.1)]">
              <BrainCircuit size={48} className="text-primary-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              <div className="absolute inset-0 rounded-full border border-primary-500/30 animate-[spin_10s_linear_infinite]"></div>
              <div className="absolute inset-[-10px] rounded-full border border-dashed border-primary-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { icon: BookOpen, label: 'Active Courses', value: String(projectsCount), color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'group-hover:border-blue-500/30' },
          { icon: Target, label: 'Quizzes Done', value: String(completedCount), color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'group-hover:border-emerald-500/30' },
          { icon: BarChart3, label: 'Average Score', value: `${avgScore}%`, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'group-hover:border-amber-500/30' },
          { icon: Zap, label: 'Study Streak', value: '1 Day', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'group-hover:border-purple-500/30' },
        ].map((stat, i) => (
          <div key={i} className={`glass-card rounded-2xl p-6 flex flex-col justify-center gap-4 transition-all duration-300 hover:-translate-y-1 group ${stat.border}`}>
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-surface-400 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-6 w-1.5 rounded-full bg-primary-500"></div>
          <h2 className="text-xl font-bold text-white tracking-tight">Quick Actions</h2>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-2xl bg-surface-900 border border-surface-700/50 p-6 text-left transition-all duration-300 hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  <action.icon size={24} className="text-surface-950" />
                </div>
                <div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-colors">
                  <ArrowRight size={14} className="text-surface-400 group-hover:text-primary-400 group-hover:-rotate-45 transition-all" />
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{action.title}</h3>
                <p className="text-sm text-surface-400 leading-relaxed font-medium">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Assigned Quizzes */}
        <div className="flex flex-col rounded-3xl bg-surface-900/50 border border-surface-700/50 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-surface-800/50 flex items-center justify-between bg-surface-900/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-500/10">
                <Target size={20} className="text-primary-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Pending Quizzes</h3>
            </div>
            {pendingQuizzes.length > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                {pendingQuizzes.length} pending
              </span>
            )}
          </div>

          <div className="p-6 sm:p-8 flex-1">
            {pendingQuizzes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-70">
                <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                  <Trophy size={32} className="text-primary-500/50" />
                </div>
                <p className="text-base font-semibold text-white mb-1">You're all caught up!</p>
                <p className="text-sm text-surface-400">No pending quizzes assigned to you.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingQuizzes.slice(0, 4).map((quiz, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/student/quiz', { state: { projectId: quiz.project_id, taskId: quiz.task_id } })}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-800/40 border border-surface-700/30 hover:bg-surface-800 hover:border-primary-500/30 transition-all text-left group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-surface-900 border border-surface-700 flex items-center justify-center shrink-0 group-hover:border-primary-500/30 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all">
                      <BrainCircuit size={20} className="text-surface-400 group-hover:text-primary-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-bold text-surface-100 truncate mb-1 group-hover:text-white transition-colors">{quiz.description || `Quiz ${quiz.task_id}`}</p>
                      <div className="flex items-center gap-2 text-xs font-mono text-surface-500">
                        <span className="text-primary-500/70">{quiz.project_id}</span>
                        <span>•</span>
                        <span>{quiz.task_type || 'Quiz'}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-surface-900 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-surface-950 transition-colors shrink-0">
                      <ArrowRight size={14} className="text-surface-500 group-hover:text-surface-950" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continue Learning */}
        <div className="flex flex-col rounded-3xl bg-surface-900/50 border border-surface-700/50 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-surface-800/50 flex items-center justify-between bg-surface-900/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp size={20} className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Continue Learning</h3>
            </div>
            <Link to="/student/courses" className="text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-1 uppercase tracking-wider">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="p-6 sm:p-8 flex-1">
            <div className="space-y-4">
              {COURSES.slice(0, 3).map((course, i) => {
                const progress = [65, 30, 85][i];
                return (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-surface-800/40 border border-surface-700/30 hover:bg-surface-800 hover:border-blue-500/30 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-surface-700 group-hover:border-blue-500/30 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] transition-all" style={{ background: `${course.color}15` }}>
                      <BookOpen size={20} style={{ color: course.color }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm sm:text-base font-bold text-surface-100 truncate group-hover:text-white transition-colors">{course.title}</p>
                        <span className="text-xs font-mono font-bold text-blue-400 shrink-0 ml-4">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden border border-surface-800">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full relative" style={{ width: `${progress}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
