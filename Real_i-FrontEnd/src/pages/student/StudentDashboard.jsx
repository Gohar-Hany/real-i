import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
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
  const headerRef = useRef(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const list = await getProjects();
        if (list.length > 0) {
          let allQuizzes = [];
          let completedTaskIds = [];

          try {
            const res = await getCompletedQuizzes(user?.id);
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
        }
      } catch (err) {
        console.error('Failed to load quizzes', err);
      }
    };
    fetchQuizzes();
  }, [user]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.dash-card', {
        opacity: 0, y: 30, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.2,
      });
    });
    return () => ctx.revert();
  }, []);

  const pendingQuizzes = assignedQuizzes.filter(q => !q.isCompleted);
  const completedCount = assignedQuizzes.filter(q => q.isCompleted).length;

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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div ref={headerRef} className="relative glass-card rounded-3xl p-8 overflow-hidden dash-card">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-500/5 rounded-full blur-[100px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary-400" />
            <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider">
              Welcome Back
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-100 mb-2">
            {user?.name ? (
              <>Hello, <span className="text-gradient">{user.name}</span> 👋</>
            ) : (
              <>Welcome to <span className="text-gradient">REAL.i</span></>
            )}
          </h1>
          <p className="text-surface-400 text-base max-w-lg">
            Ready to continue building your intelligence? Pick up where you left off or explore something new.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Courses', value: '4', color: 'text-primary-400' },
          { icon: Target, label: 'Quizzes Done', value: String(completedCount), color: 'text-emerald-400' },
          { icon: BarChart3, label: 'Avg Score', value: '87%', color: 'text-amber-400' },
          { icon: Zap, label: 'Study Streak', value: '5 days', color: 'text-purple-400' },
        ].map((stat, i) => (
          <div key={i} className="dash-card glass-card rounded-2xl p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-surface-800/50 flex items-center justify-center shrink-0">
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-surface-100">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-surface-100 mb-4 flex items-center gap-2">
          <Zap size={18} className="text-primary-400" />
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="dash-card glass-card rounded-2xl p-6 text-left hover:border-primary-500/20 transition-all duration-300 hover-lift group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-glow-sm group-hover:shadow-glow transition-all`}>
                <action.icon size={22} className="text-surface-950" />
              </div>
              <h3 className="text-base font-bold text-surface-100 mb-1">{action.title}</h3>
              <p className="text-xs text-surface-400 leading-relaxed">{action.desc}</p>
              <div className="flex items-center gap-1 mt-3 text-xs text-primary-400 font-semibold">
                Open <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Quizzes */}
        <div className="dash-card glass-card rounded-2xl p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-surface-100 flex items-center gap-2">
              <Target size={18} className="text-primary-400" />
              Assigned Quizzes
            </h3>
            {pendingQuizzes.length > 0 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-500/15 text-primary-400 border border-primary-500/20">
                {pendingQuizzes.length} pending
              </span>
            )}
          </div>

          {pendingQuizzes.length === 0 ? (
            <div className="text-center py-10">
              <Trophy size={36} className="text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No pending quizzes. You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQuizzes.slice(0, 5).map((quiz, i) => (
                <button
                  key={i}
                  onClick={() => navigate('/student/quiz', { state: { projectId: quiz.project_id, taskId: quiz.task_id } })}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-surface-800/30 transition-colors text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center shrink-0">
                    <BrainCircuit size={18} className="text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-200 truncate">{quiz.description || `Quiz ${quiz.task_id}`}</p>
                    <p className="text-xs text-surface-500">{quiz.project_id} · {quiz.task_type || 'Quiz'}</p>
                  </div>
                  <ArrowRight size={16} className="text-surface-500 group-hover:text-primary-400 transition-colors shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Continue Learning */}
        <div className="dash-card glass-card rounded-2xl p-7">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-surface-100 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary-400" />
              Continue Learning
            </h3>
            <Link to="/student/courses" className="text-xs text-primary-400 font-semibold hover:text-primary-300 transition-colors flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {COURSES.slice(0, 3).map((course, i) => {
              const progress = [65, 30, 85][i];
              return (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-800/30 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${course.color}20` }}>
                    <BookOpen size={18} style={{ color: course.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-200 truncate">{course.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-primary-400 font-semibold shrink-0">{progress}%</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
