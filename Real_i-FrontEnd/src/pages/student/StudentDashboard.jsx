import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProjects, getAssignedQuizzes, getCompletedQuizzes } from '@/services/api';
import {
  MessageSquare, BrainCircuit, BookOpen, Sparkles, ArrowRight,
  GraduationCap, Trophy, Target, TrendingUp, Zap,
  ChevronRight, BarChart3, Clock, CheckCircle
} from 'lucide-react';

const COLORS = ['#D4AF37', '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [projectsData, setProjectsData] = useState([]);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
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

          const projData = [];
          for (let i = 0; i < list.length; i++) {
            const project = list[i];
            let totalQ = 0, completedQ = 0;
            try {
              const quizzes = await getAssignedQuizzes(project.project_id);
              if (quizzes?.length > 0) {
                totalQ = quizzes.length;
                completedQ = quizzes.filter(q => completedTaskIds.includes(q.task_id)).length;
                const mapped = quizzes.map(q => ({
                  ...q,
                  project_id: project.project_id,
                  isCompleted: completedTaskIds.includes(q.task_id),
                }));
                allQuizzes = [...allQuizzes, ...mapped];
              }
            } catch (e) { /* skip */ }

            projData.push({
              id: project.project_id,
              title: project.project_id,
              color: COLORS[i % COLORS.length],
              progress: totalQ === 0 ? 0 : Math.round((completedQ / totalQ) * 100),
              totalQuizzes: totalQ,
              completedQuizzes: completedQ,
            });
          }

          setAssignedQuizzes(allQuizzes);
          setProjectsData(projData);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      }
    };
    if (user) fetchAll();
  }, [user]);

  const pendingQuizzes = assignedQuizzes.filter(q => !q.isCompleted);
  const completedCount = assignedQuizzes.filter(q => q.isCompleted).length;
  const avgScore = completedQuizzes.length > 0
    ? Math.round(completedQuizzes.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedQuizzes.length)
    : 0;

  const quickActions = [
    { icon: MessageSquare, title: 'Study Chat', desc: 'Ask your AI tutor anything', path: '/student/chat', color: '#D4AF37' },
    { icon: BrainCircuit, title: 'Take a Quiz', desc: 'Test your knowledge with AI quizzes', path: '/student/quiz', color: '#8B5CF6' },
    { icon: GraduationCap, title: 'My Courses', desc: 'Continue where you left off', path: '/student/courses', color: '#3B82F6' },
    { icon: BarChart3, title: 'Performance', desc: 'View your detailed progress report', path: '/student/performance', color: '#10B981' },
  ];

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in-up pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 border border-surface-700/50 shadow-2xl group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] group-hover:bg-primary-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

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
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">{user.name.split(' ')[0]}</span></>
              ) : (
                <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-amber-200">REAL_i</span></>
              )}
            </h1>
            <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed">
              Your AI-powered learning environment is ready. Dive into courses, track progress, or challenge yourself.
            </p>
          </div>

          <div className="hidden lg:flex shrink-0">
            <div className="w-28 h-28 rounded-full border-4 border-surface-800 flex items-center justify-center bg-surface-900/50 backdrop-blur-sm relative shadow-[0_0_30px_rgba(212,175,55,0.1)]">
              <BrainCircuit size={40} className="text-primary-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              <div className="absolute inset-0 rounded-full border border-primary-500/30 animate-[spin_10s_linear_infinite]"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Active Courses', value: String(projectsData.length), color: '#3B82F6' },
          { icon: Target, label: 'Quizzes Done', value: String(completedCount), color: '#10B981' },
          { icon: BarChart3, label: 'Avg. Score', value: `${avgScore}%`, color: '#F59E0B' },
          { icon: Zap, label: 'Pending', value: String(pendingQuizzes.length), color: '#8B5CF6' },
        ].map((stat, i) => (
          <div
            key={i}
            className="relative glass-card rounded-2xl p-5 bg-surface-900/60 border border-surface-700/50 overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-6 w-1.5 rounded-full bg-primary-500"></div>
          <h2 className="text-lg font-bold text-white">Quick Actions</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-2xl bg-surface-900 border border-surface-700/50 p-5 text-left transition-all duration-300 hover:border-primary-500/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)] hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${action.color}20, ${action.color}05)`, borderColor: `${action.color}40` }}
                >
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-surface-950 text-surface-500 transition-all">
                  <ArrowRight size={14} className="group-hover:-rotate-45 transition-transform" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1 group-hover:text-primary-300 transition-colors">{action.title}</h3>
              <p className="text-[11px] text-surface-500 leading-relaxed">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Quizzes */}
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                <Target size={16} className="text-primary-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Pending Quizzes</h3>
            </div>
            {pendingQuizzes.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-primary-500/10 text-primary-400 border border-primary-500/20 uppercase">
                {pendingQuizzes.length} pending
              </span>
            )}
          </div>
          <div className="p-4">
            {pendingQuizzes.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-3 mx-auto">
                  <Trophy size={28} className="text-primary-500/50" />
                </div>
                <p className="text-sm font-bold text-white mb-1">All caught up!</p>
                <p className="text-xs text-surface-500">No pending quizzes right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingQuizzes.slice(0, 5).map((quiz, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/student/quiz', { state: { projectId: quiz.project_id, taskId: quiz.task_id } })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:bg-surface-800/60 hover:border-primary-500/30 transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-900 border border-surface-700 flex items-center justify-center shrink-0 group-hover:border-primary-500/30 transition-all">
                      <BrainCircuit size={18} className="text-surface-400 group-hover:text-primary-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-surface-200 truncate group-hover:text-white transition-colors">{quiz.description || `Quiz ${quiz.task_id}`}</p>
                      <p className="text-[10px] text-surface-500 font-mono">{quiz.project_id}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-surface-900 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-surface-950 transition-colors shrink-0">
                      <ArrowRight size={12} className="text-surface-500 group-hover:text-surface-950" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Continue Learning — Real API Data */}
        <div className="glass-card rounded-3xl border border-surface-700/50 bg-surface-900/60 overflow-hidden">
          <div className="p-6 border-b border-surface-800 bg-surface-900/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Continue Learning</h3>
            </div>
            <Link to="/student/courses" className="text-[10px] text-primary-400 font-bold hover:text-primary-300 uppercase tracking-wider flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            {projectsData.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-3 mx-auto">
                  <BookOpen size={28} className="text-blue-500/50" />
                </div>
                <p className="text-sm font-bold text-white mb-1">No courses yet</p>
                <p className="text-xs text-surface-500">Courses will appear here once assigned</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectsData.slice(0, 4).map((proj, i) => (
                  <button
                    key={proj.id}
                    onClick={() => navigate('/student/chat')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/30 border border-surface-700/50 hover:bg-surface-800/60 transition-all text-left group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: `${proj.color}15`, borderColor: `${proj.color}30` }}
                    >
                      <BookOpen size={18} style={{ color: proj.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-bold text-surface-200 truncate group-hover:text-white transition-colors">{proj.title}</p>
                        <span className="text-xs font-bold shrink-0 ml-3" style={{ color: proj.color }}>{proj.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-900 rounded-full overflow-hidden border border-surface-800">
                        <div className="h-full rounded-full" style={{ width: `${proj.progress}%`, background: proj.color }}></div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
