import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api, getCourses, getUser, getAssignedQuizzes, getCompletedQuizzes } from '@/services/api';
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
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        let enrolledIds = user?.enrolled_courses || [];
        let completedLessons = user?.completed_lessons || [];
        try {
          const freshUser = await getUser(user?.id);
          if (freshUser) {
            enrolledIds = freshUser.enrolled_courses || [];
            completedLessons = freshUser.completed_lessons || [];
          }
        } catch (e) { /* use cached user */ }

        const allCourses = await getCourses();
        const enrolledCourses = (Array.isArray(allCourses) ? allCourses : []).filter(c => 
          enrolledIds.includes(c.id) || 
          enrolledIds.includes(c._id) || 
          enrolledIds.includes(c.project_id) || 
          (c.enrolled_students && c.enrolled_students.includes(user?.id))
        );

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
        for (let i = 0; i < enrolledCourses.length; i++) {
          const course = enrolledCourses[i];
          const projectId = course.project_id || course.id;
          let totalQ = 0, completedQ = 0;
          try {
            const quizzes = await getAssignedQuizzes(projectId);
            if (quizzes?.length > 0) {
              totalQ = quizzes.length;
              completedQ = quizzes.filter(q => completedTaskIds.includes(q.task_id)).length;
              const mapped = quizzes.map(q => ({
                ...q,
                project_id: projectId,
                isCompleted: completedTaskIds.includes(q.task_id),
              }));
              allQuizzes = [...allQuizzes, ...mapped];
            }
          } catch (e) { /* skip */ }

          let totalLessons = 0;
          let completedInProject = 0;
          if (course.modules && Array.isArray(course.modules)) {
            course.modules.forEach(mod => {
              if (mod.lessons && Array.isArray(mod.lessons)) {
                totalLessons += mod.lessons.length;
                completedInProject += mod.lessons.filter(l => completedLessons.includes(l.id)).length;
              }
            });
          }

          const progress = totalLessons === 0 ? 0 : Math.round((completedInProject / totalLessons) * 100);

          projData.push({
            id: projectId,
            title: course.title || projectId,
            color: course.color || COLORS[i % COLORS.length],
            progress,
            totalQuizzes: totalQ,
            completedQuizzes: completedQ,
          });
        }

        setAssignedQuizzes(allQuizzes);
        setProjectsData(projData);
      } catch (err) {
        console.error('Failed to load data', err);
      }

      try {
        const response = await api.get('/meetings');
        if (response.success) {
          setMeetings(response.meetings || []);
        }
      } catch (err) {
        console.error('Failed to load meetings', err);
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
      <div className="relative overflow-hidden rounded-3xl bg-surface-900 border border-surface-600/40 dark:border-surface-700/50 shadow-md group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] group-hover:bg-primary-500/20 transition-all duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

        <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-800/80 border border-surface-600/40 dark:border-surface-700 mb-4 backdrop-blur-md">
              <Sparkles size={14} className="text-primary-600 dark:text-primary-400" />
              <span className="text-[11px] font-mono font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                Student Portal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-50 dark:text-surface-100 tracking-tight mb-3 font-heading">
              {user?.name ? (
                <>Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-600 to-amber-700 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500">{user.name.split(' ')[0]}</span></>
              ) : (
                <>Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-primary-600 to-amber-700 dark:from-primary-300 dark:via-primary-400 dark:to-primary-500">REAL_i</span></>
              )}
            </h1>
            <p className="text-surface-400 text-sm sm:text-base max-w-xl leading-relaxed font-sans">
              Your AI-powered learning environment is ready. Dive into courses, track progress, or challenge yourself.
            </p>
          </div>

          <div className="hidden lg:flex shrink-0">
            <div className="w-28 h-28 rounded-full border-4 border-surface-600/30 dark:border-surface-800 flex items-center justify-center bg-surface-800/50 backdrop-blur-sm relative shadow-sm">
              <BrainCircuit size={40} className="text-primary-600 dark:text-primary-400 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
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
            className="relative bg-surface-900 rounded-2xl p-5 border border-surface-600/40 dark:border-surface-700/50 shadow-sm overflow-hidden group hover:-translate-y-1 transition-all duration-300"
            style={{ boxShadow: `0 4px 30px ${stat.color}08` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${stat.color} 0%, transparent 70%)` }}></div>
            <div className="flex items-center justify-between relative z-10">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center border shadow-sm" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}05)`, borderColor: `${stat.color}40` }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-surface-50 dark:text-surface-100 font-heading">{stat.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400 mt-0.5 font-mono">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-6 w-1.5 rounded-full bg-primary-500"></div>
          <h2 className="text-lg font-bold text-surface-50 dark:text-surface-100 font-heading">Quick Actions</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-2xl bg-surface-900 border border-surface-600/40 dark:border-surface-700/50 p-5 text-left transition-all duration-300 hover:border-primary-500 hover:shadow-md hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border transition-transform group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${action.color}20, ${action.color}05)`, borderColor: `${action.color}40` }}
                >
                  <action.icon size={22} style={{ color: action.color }} />
                </div>
                <div className="w-7 h-7 rounded-full bg-surface-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-surface-950 text-surface-400 transition-all">
                  <ArrowRight size={14} className="group-hover:-rotate-45 transition-transform" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-surface-50 dark:text-surface-100 mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors font-heading">{action.title}</h3>
              <p className="text-[11px] text-surface-400 leading-relaxed font-sans">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Quizzes */}
        <div className="rounded-3xl border border-surface-600/40 dark:border-surface-700/50 bg-surface-900 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-surface-600/30 dark:border-surface-800 bg-surface-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
                <Target size={16} className="text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-sm font-bold text-surface-50 dark:text-surface-100 font-heading">Pending Quizzes</h3>
            </div>
            {pendingQuizzes.length > 0 && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-primary-500/15 text-primary-700 dark:text-primary-300 border border-primary-500/30 uppercase font-mono">
                {pendingQuizzes.length} pending
              </span>
            )}
          </div>
          <div className="p-4">
            {pendingQuizzes.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-3 mx-auto shadow-sm">
                  <Trophy size={28} className="text-primary-500" />
                </div>
                <p className="text-sm font-bold text-surface-50 dark:text-surface-100 mb-1 font-heading">All caught up!</p>
                <p className="text-xs text-surface-400 font-sans">No pending quizzes right now</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingQuizzes.slice(0, 5).map((quiz, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/student/quiz', { state: { projectId: quiz.project_id, taskId: quiz.task_id } })}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-surface-600/30 dark:border-surface-700/50 hover:bg-surface-800/80 hover:border-primary-500/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-900 border border-surface-600/40 dark:border-surface-700 flex items-center justify-center shrink-0 group-hover:border-primary-500/30 transition-all">
                      <BrainCircuit size={18} className="text-surface-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-surface-50 dark:text-surface-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors font-heading">{quiz.description || `Quiz ${quiz.task_id}`}</p>
                      <p className="text-[10px] text-surface-400 font-mono">{quiz.project_id}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-surface-900 border border-surface-600/30 dark:border-surface-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-surface-950 transition-colors shrink-0">
                      <ArrowRight size={12} className="text-surface-400 group-hover:text-surface-950" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Classes Widget */}
        {meetings.filter(m => m.status === 'live' || m.status === 'scheduled').length > 0 && (
          <div className="rounded-3xl border border-surface-600/40 dark:border-surface-700/50 bg-surface-900 shadow-sm overflow-hidden relative">
            {meetings.some(m => m.status === 'live') && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/0 via-red-500 to-red-500/0 opacity-70"></div>
            )}
            <div className="p-6 border-b border-surface-600/30 dark:border-surface-800 bg-surface-800/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                  meetings.some(m => m.status === 'live') 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-primary-500/10 border-primary-500/20'
                }`}>
                  <Zap size={16} className={meetings.some(m => m.status === 'live') ? 'text-red-500' : 'text-primary-600 dark:text-primary-400'} />
                </div>
                <h3 className="text-sm font-bold text-surface-50 dark:text-surface-100 font-heading">Live Classes</h3>
              </div>
              <Link to="/student/meetings" className="text-[10px] text-primary-600 dark:text-primary-400 font-bold hover:text-primary-500 uppercase tracking-wider flex items-center gap-1 font-mono">
                View All <ChevronRight size={12} />
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {meetings
                .filter(m => m.status === 'live' || m.status === 'scheduled')
                .map((meeting, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-surface-800/40 border border-surface-600/30 dark:border-surface-700/50 hover:bg-surface-800/70 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center border border-surface-600/40 dark:border-surface-700 shrink-0">
                      <Target size={18} className="text-surface-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-surface-50 dark:text-surface-100 font-heading">{meeting.title}</p>
                      <p className="text-xs text-surface-400 font-sans">
                        {meeting.status === 'live' 
                          ? <span className="text-red-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>Live Now</span>
                          : meeting.scheduledFor ? new Date(meeting.scheduledFor).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Scheduled'}
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/student/live?meetingId=${encodeURIComponent(meeting._id)}&roomSlug=${encodeURIComponent(meeting.roomSlug || meeting.roomName)}`}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      meeting.status === 'live'
                        ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse-soft'
                        : 'bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950'
                    }`}
                  >
                    Join
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Continue Learning — Real API Data */}
        <div className="rounded-3xl border border-surface-600/40 dark:border-surface-700/50 bg-surface-900 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-surface-600/30 dark:border-surface-800 bg-surface-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <TrendingUp size={16} className="text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-surface-50 dark:text-surface-100 font-heading">Continue Learning</h3>
            </div>
            <Link to="/student/courses" className="text-[10px] text-primary-600 dark:text-primary-400 font-bold hover:text-primary-500 uppercase tracking-wider flex items-center gap-1 font-mono">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="p-4">
            {projectsData.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-surface-800 border border-surface-700/60 flex items-center justify-center mb-3 mx-auto shadow-sm text-primary-400">
                  <BookOpen size={28} />
                </div>
                <p className="text-sm font-bold text-surface-50 dark:text-surface-100 mb-1 font-heading">
                  No Enrolled Courses Yet
                </p>
                <p className="text-xs text-surface-400 font-sans max-w-xs mx-auto mb-4 leading-relaxed">
                  You haven't enrolled in any courses yet. Browse our catalog of AI labs and start learning today.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 text-surface-950 shadow-md shadow-primary-500/20 hover:shadow-primary-500/35 transition-all"
                >
                  Browse Course Catalog
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {projectsData.slice(0, 4).map((proj, i) => (
                  <button
                    key={proj.id}
                    onClick={() => navigate('/student/chat')}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-surface-600/30 dark:border-surface-700/50 hover:bg-surface-800/80 transition-all text-left group cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm"
                      style={{ background: `${proj.color}15`, borderColor: `${proj.color}30` }}
                    >
                      <BookOpen size={18} style={{ color: proj.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-bold text-surface-50 dark:text-surface-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors font-heading">{proj.title}</p>
                        <span className="text-xs font-bold shrink-0 ml-3 font-mono" style={{ color: proj.color }}>{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-950 rounded-full overflow-hidden border border-surface-600/30 dark:border-surface-800">
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
